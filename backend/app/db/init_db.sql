-- ============================================================
-- 星际贸易模拟游戏 - OpenGauss 数据库初始化脚本
-- 基于项目概念设计与逻辑模型
-- ============================================================

-- 清理已有表（开发阶段，方便重新初始化）
DROP TABLE IF EXISTS wanted_list CASCADE;
DROP TABLE IF EXISTS player_encounters CASCADE;
DROP TABLE IF EXISTS event_choices CASCADE;
DROP TABLE IF EXISTS event_effects CASCADE;
DROP TABLE IF EXISTS galaxy_events CASCADE;
DROP TABLE IF EXISTS transaction_logs CASCADE;
DROP TABLE IF EXISTS warehouse_inventory CASCADE;
DROP TABLE IF EXISTS player_cargo CASCADE;
DROP TABLE IF EXISTS station_inventory CASCADE;
DROP TABLE IF EXISTS trade_routes CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS goods CASCADE;
DROP TABLE IF EXISTS space_stations CASCADE;

-- ------------------------------------------------------------
-- 1. 空间站表 (SpaceStations)
-- ------------------------------------------------------------
CREATE TABLE space_stations (
    station_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL,
    independence_factor DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    security_level INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE space_stations IS '贸易节点——空间站/星球';
COMMENT ON COLUMN space_stations.independence_factor IS '独立性因子，影响涟漪传播衰减';
COMMENT ON COLUMN space_stations.security_level IS '安全等级，影响通缉惩罚系数';

-- ------------------------------------------------------------
-- 2. 商品表 (Goods)
-- ------------------------------------------------------------
CREATE TABLE goods (
    goods_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    category VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
    base_value INT NOT NULL DEFAULT 100,
    is_contraband BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE goods IS '可交易商品定义';
COMMENT ON COLUMN goods.category IS '商品类别: NORMAL, CONTRABAND, RAW, MANUFACTURED';
COMMENT ON COLUMN goods.is_contraband IS '是否为违禁品';

-- 约束：违禁品时 category 必须为 CONTRABAND
ALTER TABLE goods ADD CONSTRAINT chk_contraband_category
    CHECK (is_contraband = FALSE OR category = 'CONTRABAND');

-- ------------------------------------------------------------
-- 3. 玩家表 (Players)
-- ------------------------------------------------------------
CREATE TABLE players (
    player_id BIGSERIAL PRIMARY KEY,
    nickname VARCHAR(64) NOT NULL,
    credits BIGINT NOT NULL DEFAULT 10000,
    current_station_id BIGINT NOT NULL REFERENCES space_stations(station_id),
    cargo_capacity INT NOT NULL DEFAULT 80,
    cargo_used INT NOT NULL DEFAULT 0,
    game_status VARCHAR(16) NOT NULL DEFAULT 'PLAYING'
        CHECK (game_status IN ('PLAYING', 'WON', 'LOST', 'TIMEUP')),
    game_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE players IS '游戏参与者';
COMMENT ON COLUMN players.credits IS '当前资金（允许临时负值，触发破产判定）';
COMMENT ON COLUMN players.game_status IS 'PLAYING=进行中, WON=垄断胜利, LOST=破产失败, TIMEUP=超时';

-- ------------------------------------------------------------
-- 4. 贸易路线表 (TradeRoutes)
-- 空间站间有向图连接
-- ------------------------------------------------------------
CREATE TABLE trade_routes (
    route_id BIGSERIAL PRIMARY KEY,
    from_station_id BIGINT NOT NULL REFERENCES space_stations(station_id),
    to_station_id BIGINT NOT NULL REFERENCES space_stations(station_id),
    distance_level INT NOT NULL DEFAULT 1,
    transport_cost INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_no_self_loop CHECK (from_station_id <> to_station_id),
    CONSTRAINT uq_route UNIQUE (from_station_id, to_station_id)
);

COMMENT ON TABLE trade_routes IS '空间站间有向贸易路线';
COMMENT ON COLUMN trade_routes.distance_level IS '距离层级，涟漪传播衰减因子';

-- ------------------------------------------------------------
-- 5. 站点库存表 (StationInventory)
-- 复合实体：站点 + 商品
-- ------------------------------------------------------------
CREATE TABLE station_inventory (
    station_id BIGINT NOT NULL REFERENCES space_stations(station_id),
    goods_id BIGINT NOT NULL REFERENCES goods(goods_id),
    stock_quantity INT NOT NULL DEFAULT 0,
    base_price INT NOT NULL DEFAULT 100,
    last_ripple_time TIMESTAMP,
    PRIMARY KEY (station_id, goods_id)
);

COMMENT ON TABLE station_inventory IS '空间站持有的商品库存与基准价格';
COMMENT ON COLUMN station_inventory.base_price IS '动态价格的计算锚点';

-- 约束：库存非负
ALTER TABLE station_inventory ADD CONSTRAINT chk_stock_nonneg
    CHECK (stock_quantity >= 0);

-- ------------------------------------------------------------
-- 6. 玩家货舱表 (PlayerCargo)
-- 复合实体：玩家 + 商品
-- ------------------------------------------------------------
CREATE TABLE player_cargo (
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    goods_id BIGINT NOT NULL REFERENCES goods(goods_id),
    quantity INT NOT NULL DEFAULT 0,
    avg_cost INT NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, goods_id)
);

COMMENT ON TABLE player_cargo IS '玩家飞船货舱中的商品';
COMMENT ON COLUMN player_cargo.avg_cost IS '加权平均成本价';

-- ------------------------------------------------------------
-- 7. 仓库库存表 (WarehouseInventory)
-- 复合实体：玩家 + 站点 + 商品（三因素）
-- ------------------------------------------------------------
CREATE TABLE warehouse_inventory (
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    station_id BIGINT NOT NULL REFERENCES space_stations(station_id),
    goods_id BIGINT NOT NULL REFERENCES goods(goods_id),
    quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, station_id, goods_id)
);

COMMENT ON TABLE warehouse_inventory IS '玩家在站点寄存的仓库商品';

-- ------------------------------------------------------------
-- 8. 交易日志表 (TransactionLogs)
-- 事实表，记录所有交易行为
-- ------------------------------------------------------------
CREATE TABLE transaction_logs (
    log_id BIGSERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    station_id BIGINT NOT NULL REFERENCES space_stations(station_id),
    goods_id BIGINT NOT NULL REFERENCES goods(goods_id),
    trade_type VARCHAR(8) NOT NULL CHECK (trade_type IN ('buy', 'sell')),
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    total_amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE transaction_logs IS '所有交易记录——涟漪传播与通缉计算的触发源';

CREATE INDEX idx_tx_log_player ON transaction_logs(player_id);
CREATE INDEX idx_tx_log_station ON transaction_logs(station_id);
CREATE INDEX idx_tx_log_time ON transaction_logs(created_at);

-- ------------------------------------------------------------
-- 9. 星系事件定义表 (GalaxyEvents)
-- ------------------------------------------------------------
CREATE TABLE galaxy_events (
    event_id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(16) NOT NULL
        CHECK (event_type IN ('MARKET', 'ROUTE', 'ENCOUNTER')),
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    duration_seconds INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at TIMESTAMP
);

COMMENT ON TABLE galaxy_events IS '世界动态事件定义';

-- ------------------------------------------------------------
-- 10. 事件影响表 (EventEffects)
-- 事件对世界状态的具体影响规则
-- ------------------------------------------------------------
CREATE TABLE event_effects (
    effect_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES galaxy_events(event_id),
    target_type VARCHAR(16) NOT NULL
        CHECK (target_type IN ('PRICE', 'ROUTE', 'STATION')),
    target_id BIGINT,
    affected_field VARCHAR(32) NOT NULL,
    effect_value DOUBLE PRECISION NOT NULL,
    is_percentage BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE event_effects IS '事件对世界状态的影响规则——通过动态价格视图被动读取';
COMMENT ON COLUMN event_effects.target_id IS '根据 target_type 对应 space_stations.station_id 或 trade_routes.route_id';

-- ------------------------------------------------------------
-- 11. 事件决策选项表 (EventChoices)
-- ------------------------------------------------------------
CREATE TABLE event_choices (
    choice_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES galaxy_events(event_id),
    choice_text VARCHAR(256) NOT NULL,
    result_procedure VARCHAR(128),
    success_rate DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    success_effect_id BIGINT REFERENCES event_effects(effect_id),
    failure_effect_id BIGINT REFERENCES event_effects(effect_id)
);

COMMENT ON TABLE event_choices IS '遭遇事件的分支选项';

-- ------------------------------------------------------------
-- 12. 玩家遭遇表 (PlayerEncounters)
-- 玩家与事件交互实例
-- ------------------------------------------------------------
CREATE TABLE player_encounters (
    encounter_id BIGSERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    event_id BIGINT NOT NULL REFERENCES galaxy_events(event_id),
    choice_made BIGINT REFERENCES event_choices(choice_id),
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolution_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE player_encounters IS '玩家与星系事件的交互记录';

-- ------------------------------------------------------------
-- 13. 通缉名单表 (WantedList)
-- 玩家通缉状态
-- ------------------------------------------------------------
CREATE TABLE wanted_list (
    wanted_id BIGSERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    wanted_level INT NOT NULL DEFAULT 0
        CHECK (wanted_level BETWEEN 0 AND 3),
    suspicious_score INT NOT NULL DEFAULT 0,
    reason VARCHAR(128),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE wanted_list IS '玩家通缉状态——由触发器自动维护';
COMMENT ON COLUMN wanted_list.wanted_level IS '0=清白, 1=监视(≥100), 2=调查(≥150), 3=扣留(≥200)';

CREATE INDEX idx_wanted_player ON wanted_list(player_id);

-- ============================================================
-- 示例 Mock 数据（可选）
-- ============================================================

-- 插入示例空间站（20个）
INSERT INTO space_stations (name, x, y, independence_factor, security_level) VALUES
('阿尔法星港', 0, 0, 1.0, 3),
('贝塔贸易站', 150, 80, 1.2, 2),
('伽马前哨', 300, 150, 0.8, 1),
('德尔塔中转', 450, 200, 1.5, 2),
('艾普西隆矿场', 100, 250, 1.1, 1),
('泽塔空间站', 250, 300, 0.9, 3),
('伊塔深空港', 400, 100, 1.3, 2),
('西塔枢纽', 500, 350, 1.0, 3),
('约塔补给站', 50, 400, 1.4, 1),
('卡帕商埠', 350, 450, 0.7, 2),
('拉姆达哨站', 200, 50, 1.2, 1),
('缪斯中继', 450, 50, 1.0, 2),
('纽黑文港', 600, 200, 1.1, 3),
('克西安全区', 550, 450, 1.5, 3),
('奥密克戎黑市', 100, 450, 0.6, 1),
('派星际站', 300, 0, 1.3, 2),
('柔贸易港', 150, 350, 0.9, 2),
('西格玛要塞', 500, 100, 1.4, 3),
('陶空间站', 350, 250, 1.0, 1),
('宇普西隆港', 600, 400, 1.2, 2);

-- 插入示例商品（8种）
INSERT INTO goods (name, category, base_value, is_contraband) VALUES
('标准矿石', 'RAW', 100, FALSE),
('高能晶体', 'RAW', 500, FALSE),
('精密零件', 'MANUFACTURED', 800, FALSE),
('星际芯片', 'MANUFACTURED', 1500, FALSE),
('医疗药剂', 'NORMAL', 300, FALSE),
('生物样本', 'NORMAL', 600, FALSE),
('暗物质核心', 'CONTRABAND', 2000, TRUE),
('走私艺术品', 'CONTRABAND', 1200, TRUE);

-- 插入示例玩家
INSERT INTO players (nickname, current_station_id) VALUES
('玩家1', 1);

-- 初始化站点库存（每个站点每种商品基础库存和价格）
INSERT INTO station_inventory (station_id, goods_id, stock_quantity, base_price)
SELECT s.station_id, g.goods_id, 100, g.base_value
FROM space_stations s CROSS JOIN goods g;

-- 插入示例贸易路线（形成连通图）
INSERT INTO trade_routes (from_station_id, to_station_id, distance_level, transport_cost) VALUES
(1, 2, 1, 50), (2, 1, 1, 50),
(1, 11, 1, 30), (11, 1, 1, 30),
(2, 3, 1, 60), (3, 2, 1, 60),
(2, 16, 1, 40), (16, 2, 1, 40),
(3, 6, 1, 55), (6, 3, 1, 55),
(4, 6, 1, 45), (6, 4, 1, 45),
(4, 7, 1, 70), (7, 4, 1, 70),
(5, 9, 1, 50), (9, 5, 1, 50),
(6, 20, 1, 60), (20, 6, 1, 60),
(7, 13, 1, 80), (13, 7, 1, 80),
(8, 13, 1, 50), (13, 8, 1, 50),
(8, 14, 1, 40), (14, 8, 1, 40),
(9, 17, 1, 35), (17, 9, 1, 35),
(10, 14, 1, 70), (14, 10, 1, 70),
(11, 16, 1, 45), (16, 11, 1, 45),
(12, 18, 1, 55), (18, 12, 1, 55),
(13, 18, 1, 65), (18, 13, 1, 65),
(15, 17, 1, 50), (17, 15, 1, 50),
(16, 19, 1, 40), (19, 16, 1, 40),
(17, 20, 1, 45), (20, 17, 1, 45),
(18, 19, 1, 55), (19, 18, 1, 55);

-- ============================================================
-- 完成提示
-- ============================================================
SELECT '数据库初始化完成' AS status;

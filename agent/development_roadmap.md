# 星际贸易模拟游戏 - 前后端开发路线图

## 当前状态总结

**已完成（v0.1 基础框架）**
- **前端**：Vite + React + TypeScript + Redux Toolkit + MUI 项目初始化完成；基础组件、状态管理、API 封装就绪；构建通过
- **后端**：FastAPI + asyncpg 项目框架完成；连接池与事务管理封装完成；OpenGauss 5.0.3 已接入并验证；13 张核心数据表已创建；Mock 数据已填充（20 空间站、8 商品、42 贸易路线、160 库存记录）
- **数据库**：已创建 `space_stations`、`goods`、`players`、`trade_routes`、`station_inventory`、`player_cargo`、`warehouse_inventory`、`transaction_logs`、`galaxy_events`、`event_effects`、`event_choices`、`player_encounters`、`wanted_list` 共 13 张表

---

## 一、前端开发方向

### 1.1 星图可视化（Canvas StarMap）

当前 `StarMap.tsx` 是空壳，需要实现：
- **渲染空间站节点**：根据后端 API 获取的 20 个空间站坐标，在 Canvas 上绘制圆形节点，显示名称和坐标
- **渲染贸易路线**：读取 `trade_routes` 数据，用线段连接相邻空间站，考虑用箭头表示有向性
- **玩家位置高亮**：当前玩家所在空间站用特殊颜色/动画标记
- **交互功能**：鼠标悬停显示空间站基本信息；点击空间站可发起移动请求
- **航线状态可视化**：被事件关闭的航线（`is_active = FALSE`）用虚线/灰色表示

### 1.2 交易面板（TradeForm + PlayerPanel）

当前组件为 UI 占位，需接入真实数据流：
- **动态价格显示**：调用 `/api/stations/{id}/prices` 获取当前站点的实时价格（结合库存弹性、事件系数计算）
- **交易表单**：选择商品、输入数量、预览交易金额和利润
- **库存与资金实时更新**：交易成功后通过 Redux dispatch 更新 `playerSlice` 状态
- **货舱可视化**：用进度条显示当前货舱占用率（`cargo_used / cargo_capacity`）
- **交易历史**：`TransactionLog` 组件从后端轮询或 WebSocket 接收最新交易记录

### 1.3 事件系统（EventModal）

- **事件弹窗触发**：后端通过 WebSocket 推送 `ENCOUNTER` 类型事件时，强制弹出模态框
- **决策渲染**：根据 `event_choices` 数据渲染二选一/三选一按钮
- **结果展示**：选择后显示成功/失败动画，更新玩家状态（资金、通缉等级、货舱等）
- **全局事件通知**：`MARKET`/`ROUTE` 类型事件用 Toast 提示，不阻塞操作

### 1.4 状态管理与数据同步

- **轮询机制**：每 3 秒轮询一次玩家状态、所在站点价格、通缉状态
- **WebSocket 升级**：当前 WebSocket 仅实现 echo，后续需实现：
  - 订阅特定玩家/站点频道
  - 接收价格更新推送（减少轮询压力）
  - 接收事件推送（实时触发弹窗）
- **乐观更新**：交易提交后立即更新前端状态，若后端返回失败则回滚并提示

### 1.5 结算与胜利界面

- **胜利画面**：检测到 `game_status = 'WON'` 时显示垄断胜利结算界面，展示持有率、最终资金、评分
- **失败画面**：`game_status = 'LOST'` 或 `'TIMEUP'` 时显示破产/超时结算
- **历史对局记录**：将结算数据存入本地存储或后端，展示最佳成绩排行

---

## 二、后端开发方向

### 2.1 动态价格查询接口

核心教学展示点——价格不存储为静态值，每次查询实时计算：

```sql
-- 伪代码示意：六维因子合成
SELECT 
    base_price
    * inventory_elasticity(stock_quantity)  -- 库存弹性
    * COALESCE(event_coefficient, 1.0)      -- 事件影响
    * transport_premium                     -- 运输溢价
    * CASE WHEN is_contraband THEN 1.5 + random() ELSE 1.0 END
    * wanted_penalty(wanted_level)          -- 通缉惩罚
    AS final_price
FROM station_inventory
JOIN goods USING (goods_id)
LEFT JOIN ...
```

后端需提供 `/api/stations/{station_id}/prices` 接口，将上述 SQL 查询结果返回。

### 2.2 交易事务（原子性核心）

交易是项目的核心教学案例，必须保证原子性：

1. **校验阶段**：资金是否充足、货舱是否有空间、库存是否足够
2. **执行阶段**：
   - 更新 `players.credits`
   - 更新 `player_cargo.quantity` 和 `avg_cost`（加权平均成本计算）
   - 更新 `station_inventory.stock_quantity`
   - 写入 `transaction_logs`
3. **涟漪传播阶段**：递归CTE遍历 `trade_routes`，更新关联站点的 `base_price`
4. **通缉计算阶段**：基于最近交易日志窗口函数计算 `suspicious_score`，更新 `wanted_list`

以上所有操作必须在同一个数据库事务内完成，任一环节失败则全部回滚。

### 2.3 移动与航线查询

- `/api/players/{id}/move`：更新 `current_station_id`，校验航线是否激活
- `/api/stations/{id}/routes`：返回从当前站点可达的所有航线及运输成本
- 移动时 30% 概率触发航行遭遇事件（`ENCOUNTER`），通过 WebSocket 推送

### 2.4 定时任务（APScheduler）

- **垄断判定**：每 30 秒执行一次，聚合 `player_cargo` + `warehouse_inventory`（UNION ALL），计算每种商品的全星系持有率，若 ≥80% 则将 `players.game_status` 设为 `'WON'`
- **通缉衰减**：每 10 秒对所有玩家的 `suspicious_score` 执行 `-5` 衰减
- **事件批量触发**：平均 45 秒生成一次 `MARKET`/`ROUTE` 类型全局事件
- **超时检测**：每分钟检测 `game_start_time`，超过 600 秒（10分钟）未结束则强制结算

### 2.5 WebSocket 推送完善

当前 `websocket.py` 仅实现 echo，需扩展：
- **频道订阅**：玩家连接时发送 `{ "type": "subscribe", "playerId": 1 }`
- **价格广播**：交易成功后向所有订阅了相关站点的客户端推送价格更新
- **事件广播**：生成全局事件时广播给所有连接
- **通缉广播**：通缉等级变化时定向推送给对应玩家

---

## 三、数据库开发方向（核心教学展示点）

### 3.1 动态价格视图（View）

```sql
CREATE OR REPLACE VIEW v_station_prices AS
SELECT 
    si.station_id,
    si.goods_id,
    g.name AS goods_name,
    g.is_contraband,
    si.base_price,
    si.stock_quantity,
    -- 库存弹性系数
    CASE 
        WHEN si.stock_quantity <= 5 THEN 2.0
        WHEN si.stock_quantity <= 20 THEN 1.5
        WHEN si.stock_quantity <= 50 THEN 1.2
        WHEN si.stock_quantity >= 200 THEN 0.8
        ELSE 1.0
    END AS inventory_factor,
    -- 事件影响系数
    COALESCE(
        (SELECT effect_value FROM event_effects ee
         JOIN galaxy_events ge ON ee.event_id = ge.event_id
         WHERE ee.target_type = 'PRICE' AND ee.target_id = si.goods_id
         AND ge.is_active = TRUE), 1.0
    ) AS event_factor,
    -- 合成最终价格
    si.base_price 
        * CASE WHEN si.stock_quantity <= 5 THEN 2.0 ... END
        * COALESCE(event_factor, 1.0)
        AS final_buy_price,
    si.base_price 
        * CASE WHEN si.stock_quantity <= 5 THEN 2.0 ... END
        * COALESCE(event_factor, 1.0)
        * 0.95 AS final_sell_price
FROM station_inventory si
JOIN goods g ON si.goods_id = g.goods_id;
```

### 3.2 涟漪传播存储过程

```sql
CREATE OR REPLACE FUNCTION fn_ripple_price(
    p_station_id BIGINT,
    p_goods_id BIGINT,
    p_trade_type VARCHAR,
    p_quantity INT
) RETURNS VOID AS $$
DECLARE
    v_intensity DOUBLE PRECISION;
BEGIN
    -- 计算涟漪强度
    v_intensity := CASE p_trade_type 
        WHEN 'buy' THEN 0.05 
        WHEN 'sell' THEN 0.03 
    END * p_quantity;
    
    -- 递归CTE：最多传播3跳
    WITH RECURSIVE ripple AS (
        -- 起点
        SELECT from_station_id, to_station_id, 1 AS hop
        FROM trade_routes
        WHERE from_station_id = p_station_id AND is_active = TRUE
        
        UNION ALL
        
        -- 递归扩展
        SELECT tr.from_station_id, tr.to_station_id, r.hop + 1
        FROM trade_routes tr
        JOIN ripple r ON tr.from_station_id = r.to_station_id
        WHERE r.hop < 3 AND tr.is_active = TRUE
    )
    UPDATE station_inventory si
    SET base_price = base_price + v_intensity * (1.0 / hop) * (1.0 / ss.independence_factor),
        last_ripple_time = CURRENT_TIMESTAMP
    FROM ripple r
    JOIN space_stations ss ON r.to_station_id = ss.station_id
    WHERE si.station_id = r.to_station_id AND si.goods_id = p_goods_id;
END;
$$ LANGUAGE plpgsql;
```

### 3.3 通缉可疑度视图（窗口函数）

```sql
CREATE OR REPLACE VIEW v_wanted_analysis AS
WITH recent_tx AS (
    SELECT 
        player_id,
        COUNT(*) OVER w AS tx_count_10,
        SUM(total_amount) OVER w AS amount_sum_5,
        SUM(CASE WHEN g.is_contraband THEN 1 ELSE 0 END) OVER w AS contraband_count
    FROM transaction_logs tl
    JOIN goods g ON tl.goods_id = g.goods_id
    WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    WINDOW w AS (PARTITION BY player_id ORDER BY created_at 
                 ROWS BETWEEN 9 PRECEDING AND CURRENT ROW)
)
SELECT 
    player_id,
    tx_count_10 * 5 + amount_sum_5 * 0.01 + contraband_count * 50 AS suspicious_score
FROM recent_tx;
```

### 3.4 交易触发器（Trigger）

```sql
CREATE OR REPLACE FUNCTION trg_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. 触发涟漪传播
    PERFORM fn_ripple_price(NEW.station_id, NEW.goods_id, NEW.trade_type, NEW.quantity);
    
    -- 2. 更新通缉可疑度
    INSERT INTO wanted_list (player_id, suspicious_score, is_active)
    SELECT player_id, suspicious_score, TRUE
    FROM v_wanted_analysis
    WHERE player_id = NEW.player_id
    ON CONFLICT (player_id) DO UPDATE
    SET suspicious_score = EXCLUDED.suspicious_score,
        wanted_level = CASE 
            WHEN EXCLUDED.suspicious_score >= 200 THEN 3
            WHEN EXCLUDED.suspicious_score >= 150 THEN 2
            WHEN EXCLUDED.suspicious_score >= 100 THEN 1
            ELSE 0
        END,
        issued_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_transaction_after_insert
AFTER INSERT ON transaction_logs
FOR EACH ROW
EXECUTE FUNCTION trg_after_transaction();
```

### 3.5 垄断判定存储过程

```sql
CREATE OR REPLACE FUNCTION fn_check_monopoly()
RETURNS TABLE(player_id BIGINT, goods_id BIGINT, hold_rate DOUBLE PRECISION) AS $$
BEGIN
    RETURN QUERY
    WITH total_holdings AS (
        SELECT pc.player_id, pc.goods_id, SUM(pc.quantity) AS qty
        FROM player_cargo pc
        GROUP BY pc.player_id, pc.goods_id
        UNION ALL
        SELECT wi.player_id, wi.goods_id, SUM(wi.quantity) AS qty
        FROM warehouse_inventory wi
        GROUP BY wi.player_id, wi.goods_id
    ),
    player_total AS (
        SELECT player_id, goods_id, SUM(qty) AS total_qty
        FROM total_holdings
        GROUP BY player_id, goods_id
    ),
    galaxy_total AS (
        SELECT goods_id, 
               SUM(stock_quantity) + COALESCE(SUM(th.total_qty), 0) AS total_galaxy
        FROM station_inventory si
        LEFT JOIN (SELECT goods_id, SUM(qty) AS total_qty FROM total_holdings GROUP BY goods_id) th
        ON si.goods_id = th.goods_id
        GROUP BY si.goods_id
    )
    SELECT pt.player_id, pt.goods_id, 
           pt.total_qty::DOUBLE PRECISION / gt.total_galaxy AS hold_rate
    FROM player_total pt
    JOIN galaxy_total gt ON pt.goods_id = gt.goods_id
    WHERE pt.total_qty::DOUBLE PRECISION / gt.total_galaxy >= 0.8;
END;
$$ LANGUAGE plpgsql;
```

---

## 四、里程碑计划

| 阶段 | 目标 | 预计周期 | 关键交付物 |
|------|------|---------|-----------|
| **迭代1：基础玩法闭环** | 完成交易、移动、价格展示 | 1-2周 | 可完成单次买卖的完整流程 |
| **迭代2：机制拓展** | 涟漪传播、通缉系统、事件触发 | 2周 | 数据库触发器与存储过程教学展示就绪 |
| **迭代3：实时优化** | WebSocket 推送、物化视图、前端性能 | 1周 | 价格实时同步，无闪烁刷新 |
| **迭代4：教学演示** | 执行计划可视化、事务回滚演示、最终评分 | 1周 | 完整的课程演示脚本与截图 |

---

## 五、前后端协同要点

| 功能模块 | 前端任务 | 后端任务 | 数据库任务 |
|---------|---------|---------|-----------|
| 登录/开局 | 昵称输入、创建按钮 | `POST /api/games` 创建玩家与初始化库存 | `INSERT INTO players` + `INSERT INTO player_cargo` |
| 星图浏览 | Canvas 渲染节点与连线 | `GET /api/stations` 返回坐标与连接 | `SELECT * FROM space_stations JOIN trade_routes` |
| 价格查询 | 表格展示动态价格 | 调用价格视图返回 JSON | `v_station_prices` 视图实时计算 |
| 执行交易 | 表单提交、乐观更新 | 事务内执行存储过程 | `fn_execute_trade()` + 触发器 |
| 涟漪效果 | 价格变化动画 | WebSocket 广播 | `fn_ripple_price()` 递归CTE |
| 移动航行 | 点击目标站点 | 校验航线、扣费、概率触发事件 | `SELECT is_active FROM trade_routes` |
| 遭遇事件 | 弹窗、选择按钮 | 调用决策存储过程 | `fn_apply_choice()` |
| 通缉状态 | 警告图标、时间惩罚 | 窗口函数查询可疑度 | `v_wanted_analysis` + 触发器 |
| 垄断判定 | 进度条显示持有率 | APScheduler 定时调用 | `fn_check_monopoly()` |
| 游戏结算 | 胜利/失败画面 | 返回结算评分 | `UPDATE players SET game_status` |

---

## 六、风险与注意事项

1. **OpenGauss 兼容性**：OpenGauss-lite 5.0.3 不支持 `UNLISTEN`，已通过异常捕获绕过；部分高版本 PostgreSQL 语法（如 `MERGE INTO`）不可用，需用 `INSERT ... ON CONFLICT` 替代
2. **性能瓶颈**：动态价格视图每次查询都重新计算，商品和站点数量增加后可能成为瓶颈；迭代3阶段考虑引入物化视图或 Redis 缓存
3. **事务超时**：涟漪传播涉及递归CTE，最大深度限制为3跳；若贸易路线图过于复杂，需增加超时控制
4. **前端状态一致性**：乐观更新策略下，若后端事务回滚，前端需及时回滚状态；建议交易结果通过 WebSocket 推送而非仅依赖 HTTP 响应
5. **课程演示准备**：所有数据库对象（表、视图、触发器、存储过程）需附带 `COMMENT`，便于 `\d+` 和 `
\sf` 展示教学注释

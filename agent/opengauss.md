# OpenGauss 接入教程

## 1. 概述

**OpenGauss** 是一款华为开源的关系型数据库管理系统，深度兼容 PostgreSQL 协议与语法。本项目后端已基于 `asyncpg`（高性能异步 PostgreSQL 驱动）完成数据库连接与事务管理框架，因此接入 OpenGauss 的核心工作仅为：替换连接地址、调整少量方言差异、初始化表结构。

> 项目当前技术栈：FastAPI + asyncpg + SQLAlchemy（可选）。asyncpg 对 PostgreSQL/OpenGauss 协议原生支持良好，是首选驱动。

---

## 2. 环境准备

### 2.1 安装 OpenGauss 客户端或服务器

#### 方式 A：本地/服务器安装 OpenGauss

参考官方文档选择对应版本的安装包：
- 开源社区版下载：https://opengauss.org/zh/download/
- 安装指南：https://docs.opengauss.org/zh/docs/5.1.0/docs/InstallationGuide/InstallationGuide.html

常用安装方式：
- **Docker 一键启动（推荐开发环境）**
  ```bash
  docker run --name opengauss \
    --privileged=true \
    -d -p 5432:5432 \
    -e GS_PASSWORD=YourPassword@123 \
    opengauss/opengauss:5.1.0
  ```

- **yum/apt 安装（生产服务器）**
  参照官方安装指南执行预安装脚本、创建用户、初始化数据库等步骤。

#### 方式 B：远程已有 OpenGauss 实例

确保你的开发环境能够访问该实例的 IP 与端口（默认 **5432**），并提前创建好项目专用数据库与用户。

### 2.2 确认 Python 驱动

项目已安装 `asyncpg`，无需额外驱动。若后续需要 ORM 方式操作，可补充安装 `sqlalchemy[asyncio]` + `asyncpg`：

```bash
pip install asyncpg sqlalchemy[asyncio]
```

---

## 3. 连接配置

### 3.1 修改后端配置文件

编辑 `backend/app/config.py`：

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # OpenGauss 连接字符串（PostgreSQL 兼容格式）
    database_url: str = (
        "postgresql://username:password@host:port/dbname"
    )
    app_name: str = "星际贸易模拟游戏后端"
    debug: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
```

### 3.2 推荐的环境变量方式（.env）

在项目根目录创建 `backend/.env`：

```dotenv
DATABASE_URL=postgresql://commercial_user:YourPassword@123@127.0.0.1:5432/commercial_game
DEBUG=True
```

启动时 `pydantic-settings` 会自动读取该文件，避免硬编码敏感信息。

### 3.3 DSN 格式说明

```
postgresql://用户名:密码@主机地址:端口/数据库名?参数=值
```

示例：
```
postgresql://game_admin:Admin@123@192.168.1.100:5432/commercial_game?sslmode=disable
```

常用参数：
| 参数 | 说明 |
|------|------|
| `sslmode` | `disable` / `require` / `verify-ca` |
| `connect_timeout` | 连接超时秒数，如 `10` |
| `application_name` | 连接标识，如 `commercial_game` |

---

## 4. 与现有代码的对接

### 4.1 连接池（已就绪）

`backend/app/db/connection.py` 中已封装好 asyncpg 连接池与事务上下文：

```python
@asynccontextmanager
async def transaction():
    async with get_connection() as conn:
        tr = conn.transaction()
        await tr.start()
        try:
            yield conn
            await tr.commit()
        except Exception:
            await tr.rollback()
            raise
```

**接入 OpenGauss 后无需修改此文件**，asyncpg 的 `create_pool()` 直接支持 PostgreSQL/OpenGauss 协议。

### 4.2 服务层调用（已就绪）

所有 Service 均通过 `transaction()` 或 `get_connection()` 获取连接，示例：

```python
from app.db.connection import transaction

class TradeService:
    @staticmethod
    async def execute_trade(req: TradeRequest) -> TradeResult:
        async with transaction() as conn:
            row = await conn.fetchrow("SELECT ...", req.playerId)
            ...
```

### 4.3 需要关注的方言差异

OpenGauss 与 PostgreSQL 语法高度一致，但仍有以下细节需要留意：

| 场景 | PostgreSQL | OpenGauss | 处理建议 |
|------|-----------|-----------|----------|
| 自增主键 | `SERIAL` / `GENERATED ALWAYS` | `BIGSERIAL` / 兼容 | 均可正常使用 |
| 时间类型 | `TIMESTAMPTZ` | 完全兼容 | 无需改动 |
| 数组/JSON | 原生支持 | 原生支持 | 无需改动 |
| 窗口函数 | `ROW_NUMBER()` / `RANK()` | 完全兼容 | 通缉系统可直接使用 |
| 存储过程 | `CREATE OR REPLACE FUNCTION` | 语法一致，部分系统函数差异 | 测试后再上线 |
| 事务隔离 | `READ COMMITTED`（默认） | 默认 `READ COMMITTED` | 符合项目需求 |

> 项目当前 SQL 均为标准 PostgreSQL 语法，预计无需大量修改即可在 OpenGauss 上运行。

---

## 5. 数据库初始化

### 5.1 创建数据库与用户

以 `omm`（OpenGauss 默认管理员）或具有 `CREATEDB` 权限的用户登录：

```sql
-- 创建项目数据库
CREATE DATABASE commercial_game
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';

-- 创建项目专用用户（推荐最小权限原则）
CREATE USER commercial_user WITH PASSWORD 'YourPassword@123';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE commercial_game TO commercial_user;
```

### 5.2 核心表结构示例

以下 SQL 在项目迭代阶段可用于初始化 OpenGauss 数据表：

```sql
-- 玩家表
CREATE TABLE players (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    credits BIGINT NOT NULL DEFAULT 10000,
    planet_id BIGINT NOT NULL DEFAULT 1,
    wanted_level INT NOT NULL DEFAULT 0,
    monopoly_victory BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 星球/星系表
CREATE TABLE planets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL,
    faction VARCHAR(32) NOT NULL
);

-- 星系连接表
CREATE TABLE planet_connections (
    from_planet_id BIGINT NOT NULL REFERENCES planets(id),
    to_planet_id BIGINT NOT NULL REFERENCES planets(id),
    PRIMARY KEY (from_planet_id, to_planet_id)
);

-- 商品表
CREATE TABLE commodities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    base_price INT NOT NULL,
    illegal BOOLEAN NOT NULL DEFAULT FALSE
);

-- 星球库存与实时价格
CREATE TABLE planet_market (
    planet_id BIGINT NOT NULL REFERENCES planets(id),
    commodity_id BIGINT NOT NULL REFERENCES commodities(id),
    buy_price INT NOT NULL,
    sell_price INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    PRIMARY KEY (planet_id, commodity_id)
);

-- 玩家货仓
CREATE TABLE player_cargo (
    player_id BIGINT NOT NULL REFERENCES players(id),
    commodity_id BIGINT NOT NULL REFERENCES commodities(id),
    quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, commodity_id)
);

-- 交易日志（触发涟漪与通缉计算的数据源）
CREATE TABLE transaction_log (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(id),
    planet_id BIGINT NOT NULL REFERENCES planets(id),
    commodity_id BIGINT NOT NULL REFERENCES commodities(id),
    quantity INT NOT NULL,
    trade_type VARCHAR(8) NOT NULL CHECK (trade_type IN ('buy', 'sell')),
    unit_price INT NOT NULL,
    total_amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 事件模板
CREATE TABLE event_templates (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 事件选项
CREATE TABLE event_choices (
    id BIGSERIAL PRIMARY KEY,
    event_template_id BIGINT NOT NULL REFERENCES event_templates(id),
    label VARCHAR(128) NOT NULL,
    outcome_description TEXT,
    effect_sql TEXT
);

-- 垄断阈值配置
CREATE TABLE monopoly_thresholds (
    commodity_id BIGINT PRIMARY KEY REFERENCES commodities(id),
    threshold INT NOT NULL DEFAULT 1000
);

-- 索引优化
CREATE INDEX idx_tx_log_player ON transaction_log(player_id);
CREATE INDEX idx_tx_log_time ON transaction_log(created_at);
CREATE INDEX idx_player_cargo_player ON player_cargo(player_id);
```

---

## 6. 验证连接

### 6.1 直接测试

确保 OpenGauss 服务已启动，然后执行：

```bash
cd backend
set PYTHONPATH=.
python -c "
import asyncio
from app.db.connection import get_connection

async def test():
    async with get_connection() as conn:
        row = await conn.fetchrow('SELECT version()')
        print('Connected to:', row['version'])

asyncio.run(test())
"
```

成功输出示例：
```
Connected to: (openGauss 5.1.0 build ...) PostgreSQL 9.2.4 (openGauss 5.1.0 build ...) compatible
```

### 6.2 启动完整后端

```bash
cd backend
python start.py
```

若控制台输出 `Application startup complete.` 且无数据库连接报错，即表示接入成功。

---

## 7. 常见问题

### Q1：asyncpg 报错 `password authentication failed`
- 检查 `.env` 中的 `DATABASE_URL` 密码是否正确。
- OpenGauss 默认密码策略较严格，确保密码复杂度达标。

### Q2：连接超时或拒绝连接
- 确认 OpenGauss 服务已启动且监听 `0.0.0.0:5432`。
- 检查防火墙/安全组是否放行了 5432 端口。
- 查看 OpenGauss `pg_hba.conf` 是否允许你的客户端 IP 访问。

### Q3：某些 SQL 在 OpenGauss 上报语法错误
- OpenGauss 5.x 系列与 PostgreSQL 9.2 内核兼容，个别高版本 PG 语法（如 `MERGE INTO`、`SELECT DISTINCT ON`）可能不支持。
- 建议将复杂逻辑放在后端 Python 中处理，或使用 OpenGauss 兼容的等价写法。

### Q4：事务隔离级别
- OpenGauss 默认 `READ COMMITTED`，满足本项目需求。
- 如需更高的隔离级别，可在 `transaction()` 中显式设置：
  ```python
  await conn.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
  ```

---

## 8. 后续迭代建议

| 迭代 | 数据库相关任务 |
|------|-------------|
| 迭代1（基础玩法） | 初始化上述核心表，填充星球/商品 Mock 数据，完成交易触发器的原子写入 |
| 迭代2（机制拓展） | 编写 CTE 或视图实现通缉可疑度计算；定时任务调用存储过程执行垄断判定 |
| 迭代3（实时优化） | 创建 `planet_market` 的物化视图或缓存表，降低高频价格查询压力 |
| 迭代4（教学演示） | 利用 OpenGauss 的 `EXPLAIN` 与执行计划可视化，演示触发器与事务回滚 |

---

## 9. 参考链接

- OpenGauss 官方文档：https://docs.opengauss.org/zh/
- asyncpg 文档：https://magicstack.github.io/asyncpg/current/
- PostgreSQL DSN 格式：https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING

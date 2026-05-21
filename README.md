# 星际贸易模拟游戏

## 项目简介
基于 React + FastAPI + OpenGauss 的星际贸易模拟游戏，核心教学展示点为"触发器/存储过程"和"窗口函数"在数据库中的实际应用。

## 项目结构

```
commercial_game/
├── agent/                    # 设计文档与阅读材料（给开发者参考）
│   ├── ai给出的项目设计.pdf
│   ├── frontend.md
│   ├── backend.md
│   ├── opengauss.md
│   ├── v0.1_tasks.json
│   └── development_roadmap.md
├── frontend/                 # React + TypeScript 前端
│   ├── src/
│   │   ├── components/       # UI 组件
│   │   ├── pages/            # 页面
│   │   ├── store/            # Redux 状态管理
│   │   ├── api/              # HTTP + WebSocket 封装
│   │   └── canvas/           # Canvas 星图渲染
│   └── package.json
├── backend/                  # FastAPI + asyncpg 后端
│   ├── app/
│   │   ├── api/              # 路由与 WebSocket
│   │   ├── db/               # 数据库连接 + 建表 SQL
│   │   ├── schemas/          # Pydantic 数据模型
│   │   ├── services/         # 业务逻辑层
│   │   ├── config.py         # 配置（数据库连接等）
│   │   └── main.py           # 应用入口
│   ├── scripts/
│   │   └── init_database.py  # 数据库一键初始化脚本
│   ├── requirements.txt
│   └── .env                  # 环境变量（需自行创建）
├── team_assignment.md        # 团队分工
└── README.md                 # 本文件
```

---

## 环境要求

- Python 3.10+
- Node.js 18+
- OpenGauss 5.0+ 或 PostgreSQL 14+
- Docker（用于运行 OpenGauss 容器）

---

## 快速开始

### 1. 克隆项目

```bash
git clone <仓库地址>
cd commercial_game
```

### 2. 启动数据库

如果你使用 Docker 运行 OpenGauss：

```bash
docker run --name opengauss \
  -e GS_PASSWORD=database@123 \
  -e GS_USERNAME=shu \
  -e GS_DB=opengauss_commercial_game \
  -p 5432:5432 \
  -d enmotech/opengauss-lite:latest
```

如果使用本地 PostgreSQL，请自行创建数据库 `opengauss_commercial_game`。

### 3. 配置后端

进入 backend 目录：

```bash
cd backend
```

创建 `.env` 文件（可参考 `.env.example`）：

```env
DATABASE_URL=postgresql://<用户名>:<密码>@127.0.0.1:5432/<数据库名>
DEBUG=True
```

> **注意**：如果密码中包含 `@` 等特殊字符，需要进行 URL 编码（如 `@` → `%40`）。

安装依赖（使用本地环境，不创建虚拟环境）：

```bash
pip install -r requirements.txt
```

### 4. 初始化数据库

**一键建表并填充 Mock 数据：**

```bash
python scripts/init_database.py
```

执行后会看到：
- 执行的 SQL 语句数量
- 13 张数据表的创建状态
- 每张表的行数统计（如 20 stations, 8 goods 等）

> 如果提示权限不足（`permission denied for schema public`），需要以管理员身份执行：
> ```bash
> docker exec opengauss bash -c "su - omm -c \"gsql -d <数据库名> -p 5432 -c 'GRANT ALL ON SCHEMA public TO <用户名>;'\""
> ```

### 5. 启动后端服务

```bash
python start.py
```

服务将运行在 `http://0.0.0.0:8000`
- API 文档：`http://localhost:8000/docs`
- 健康检查：`http://localhost:8000/health`

### 6. 启动前端

新开一个终端：

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 `http://localhost:5173`

---

## 数据库结构概览

| 表名 | 说明 |
|------|------|
| `space_stations` | 空间站/星球（贸易节点） |
| `goods` | 可交易商品定义 |
| `players` | 游戏参与者 |
| `trade_routes` | 空间站间有向贸易路线 |
| `station_inventory` | 站点库存与基准价格 |
| `player_cargo` | 玩家飞船货舱 |
| `warehouse_inventory` | 玩家仓库寄存 |
| `transaction_logs` | 交易记录（涟漪与通缉的触发源） |
| `galaxy_events` | 世界动态事件定义 |
| `event_effects` | 事件影响规则 |
| `event_choices` | 事件决策选项 |
| `player_encounters` | 玩家事件交互记录 |
| `wanted_list` | 玩家通缉状态 |

---

## 常见问题

**Q: OpenGauss-lite 连接时报 `UNLISTEN statement is not yet supported`？**  
A: 已在 `app/db/connection.py` 中通过异常捕获兼容处理，不影响正常使用。

**Q: 如何重置数据库？**  
A: 直接重新运行 `python scripts/init_database.py` 即可，SQL 脚本已包含 `DROP TABLE IF EXISTS`。

**Q: 想修改 Mock 数据？**  
A: 编辑 `backend/app/db/init_db.sql` 底部的 `INSERT` 语句，然后重新运行初始化脚本。

---

## 团队成员

| 角色 | 代号 | 职责 |
|------|------|------|
| 前端开发 | FE | 全部前端界面、交互、状态管理 |
| 后端组长 | BE-Lead | 后端架构、API 接口、定时任务、联调 |
| 后端组员 | BE-Dev | 数据库视图/存储过程/触发器、性能优化 |

详见 `team_assignment.md`

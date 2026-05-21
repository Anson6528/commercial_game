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
git clone https://github.com/mjl2004/commercial_game.git
cd commercial_game
```

### 2. 启动数据库

请使用 Docker 运行 OpenGauss：
如果电脑中没有 Docker，可以安装 Docker Desktop（https://www.docker.com/products/docker-desktop/）。
安装 Docker 的具体步骤可以参考教程：https://blog.csdn.net/weixin_52286364/article/details/150379121, 执行到第六步
,在终端中输入 docker --version 来验证 Docker 是否安装成功。
然后在终端中执行以下命令来创建一个 OpenGauss 容器：


```bash
docker run --name opengauss \
  --privileged=true \
  -e GS_PASSWORD=Database@123 \
  -p 5432:5432 \
  -d enmotech/opengauss-lite:latest
```
注意：上述命令中设置了密码为 `Database@123`，端口号是 5432。这些参数是可以自行修改的，但为了保持一致性，建议大家使用相同的值，否则会影响项目中的数据库连接。还有就是上一步需要翻墙。

然后等待容器启动完成，可以通过以下命令查看容器状态：

```bash
docker ps -a
```
如果看到 `opengauss` 容器的状态是 `Up`，PORTS 显示 0.0.0.0:5432->5432/tcp，说明数据库已经成功启动了。
然后进入容器,创建开发数据库和应用用户：

```bash
docker exec -it opengauss bash
su - omm
gsql -d postgres
CREATE DATABASE opengauss_commercial_game;
CREATE USER shu WITH PASSWORD 'database@123';
GRANT ALL PRIVILEGES ON DATABASE opengauss_commercial_game TO shu;
\c opengauss_commercial_game
GRANT USAGE, CREATE ON SCHEMA public TO shu;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO shu;
```


如果使用本地 PostgreSQL，请自行创建数据库 `opengauss_commercial_game`。

### 3. 配置后端

进入 backend 目录：

```bash
cd backend
```

创建 `.env` 文件（可参考 `.env.example`,如果已经有了就不用创建）：

```env
DATABASE_URL=postgresql://<用户名>:<密码>@127.0.0.1:5432/<数据库名>
DEBUG=True
```

> **注意**：如果密码中包含 `@` 等特殊字符，需要进行 URL 编码（如 `@` → `%40`）。

安装依赖（使用本地环境，不创建虚拟环境）：

```bash
cd backend
pip install -r requirements.txt
```

### 4. 初始化数据库

**一键建表并填充 Mock 数据：**

```bash
cd backend
python scripts/init_database.py
```

执行后会看到：
- 执行的 SQL 语句数量
- 13 张数据表的创建状态
- 每张表的行数统计（如 20 stations, 8 goods 等）

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

## 代码提交规范

大家在开发过程中请遵循以下 Git 工作流和提交规范，从github上将代码拉下来，自己开发的过程中，随时都可以将自己目前的进度提交到
github仓库里(就提交到我的仓库里),但是注意提交的时候最好自己创建一个feature分支，不要动主分支，以防代码混乱：
- **分支策略**：主分支 `main`（保护分支），个人功能分支 `feature/<自己的名字>`,如 `feature/mjl`。
- **提交信息**：`<类型>: <描述>`，如 `feat: 完成交易触发器`
提交信息这里大家可以参考这个网址里的规范：https://blog.csdn.net/chenyajundd/article/details/139322838

## 团队成员

| 角色 | 代号 |
|------|------|
| 前端主程 | FC |
| 前端美术/UI | FA |
| 后端 API | BA |
| 后端数据库 | BD |

详见 `agent/team_assignment.md`

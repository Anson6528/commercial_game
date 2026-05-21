# 星际贸易模拟游戏 - 团队分工方案（4人）

> 调整说明：前端工作由 1 人统一负责，后端拆分为 3 人（架构+数据库对象+测试优化），共 4 人。

## 团队构成

| 角色 | 代号 | 核心技能要求 |
|------|------|-------------|
| 前端开发 | FE | React + TypeScript + Canvas + Redux + MUI |
| 后端组长 | BE-Lead | FastAPI + 架构设计 + API 开发 + 联调统筹 |
| 后端组员1 | BE-Dev1 | SQL + OpenGauss 存储过程/触发器/视图 |
| 后端组员2 | BE-Dev2 | 数据库测试 + 性能优化 + 运维部署 |

---

## 一、前端开发（FE）

> 负责全部前端界面、交互、状态管理、API 对接、WebSocket 通信。

### 核心模块

| 任务编号 | 任务名称 | 描述 | 预计工期 |
|---------|---------|------|---------|
| FE-01 | Canvas 星图渲染引擎 | 完成 `StarMap.tsx`：绘制 20 个空间站节点（圆形+名称）、42 条贸易路线（有向线段+箭头）、玩家位置高亮动画、航线状态可视化（激活/关闭用虚线/灰色） | 3 天 |
| FE-02 | 前端状态管理 | 完善全部 Redux slices：`playerSlice`、`marketSlice`、`eventSlice`、`starMapSlice`，补充 reducer、actions、selectors | 2 天 |
| FE-03 | WebSocket 客户端 | 升级 `frontend/src/api/websocket.ts`：频道订阅/取消、心跳重连、事件监听回调注册、价格推送自动更新 Redux | 2 天 |
| FE-04 | 交易面板 | 完成 `TradeForm.tsx`：商品下拉选择、数量输入、实时价格预览、交易金额计算、买入/卖出按钮、成功/失败 Toast | 2 天 |
| FE-05 | 玩家信息面板 | 完成 `PlayerPanel.tsx`：资金显示、当前站点、货舱占用率（进度条）、通缉等级图标、仓库入口 | 1 天 |
| FE-06 | 交易历史 | 完成 `TransactionLog.tsx`：按时间倒序展示记录、筛选（买入/卖出/全部）、分页/虚拟滚动 | 1 天 |
| FE-07 | 事件弹窗系统 | 完成 `EventModal.tsx`：强制弹窗（遭遇事件）、全局 Toast 通知（市场/航线事件）、决策按钮、结果动画 | 2 天 |
| FE-08 | 结算界面 | 胜利画面（垄断结算）、失败画面（破产/超时）、评分公式展示 | 2 天 |
| FE-09 | HTTP API 对接 | 对接全部后端接口：玩家状态、站点价格、执行交易、执行移动、事件决策、通缉状态 | 2 天 |
| FE-10 | MUI 主题定制 | 科幻风格配色（深蓝+霓虹青）、按钮/输入框/卡片样式、暗色主题 | 1 天 |
| FE-11 | 响应式布局 | 适配 1920×1080、1366×768，最小 1280×720 | 1 天 |
| FE-12 | 前端性能优化 | Canvas requestAnimationFrame、虚拟列表、组件懒加载 | 迭代3阶段 |

### 交付物
- `frontend/src/canvas/StarMap.tsx`
- `frontend/src/components/TradeForm.tsx`
- `frontend/src/components/PlayerPanel.tsx`
- `frontend/src/components/TransactionLog.tsx`
- `frontend/src/components/EventModal.tsx`
- `frontend/src/pages/MainPage.tsx`
- 全部 Redux store slices
- `frontend/src/api/http.ts` + `frontend/src/api/websocket.ts`
- `frontend/src/App.tsx` + `frontend/src/index.css`（主题定制）

---

## 二、后端组长（BE-Lead）

> 负责后端架构设计、API 路由、服务层逻辑、定时任务、WebSocket 服务端、前后端联调统筹。

### 核心模块

| 任务编号 | 任务名称 | 描述 | 预计工期 |
|---------|---------|------|---------|
| BE-L01 | 动态价格查询接口 | `GET /api/stations/{station_id}/prices`：调用 `v_station_prices` 视图返回实时价格 JSON | 2 天 |
| BE-L02 | 交易执行接口 | `POST /api/trade`：事务内完成校验→更新资金→更新货舱→更新库存→写入日志→触发涟漪→更新通缉 | 3 天 |
| BE-L03 | 玩家移动接口 | `POST /api/move`：校验航线、扣运输成本、更新 `current_station_id`、30% 概率触发遭遇事件 | 2 天 |
| BE-L04 | 游戏生命周期管理 | `POST /api/games`（开局）、`GET /api/games/{id}/status`（状态）、`DELETE /api/games/{id}`（放弃） | 2 天 |
| BE-L05 | 定时任务调度 | APScheduler：垄断判定（30秒）、通缉衰减（10秒）、事件触发（45秒平均）、超时检测（60秒） | 2 天 |
| BE-L06 | WebSocket 服务端 | 升级 `websocket.py`：频道管理、价格广播、事件广播、通缉定向推送、在线状态维护 | 2 天 |
| BE-L07 | 服务层重构 | `TradeService`、`WantedService`、`MonopolyService`、`EventService` 从占位代码改为调用数据库对象 | 2 天 |
| BE-L08 | 后端联调统筹 | 与 FE 对接 API、提供 Swagger 文档、快速修复接口问题、协调数据库对象变更 | 贯穿全程 |

### 交付物
- `backend/app/api/routes.py`（完整 API 路由）
- `backend/app/api/websocket.py`（完整 WebSocket 服务端）
- `backend/app/services/*.py`（完整服务层）
- `backend/app/main.py`（APScheduler 集成）
- Swagger UI 自动生成的 API 文档

---

## 三、后端组员1（BE-Dev1）

> 负责全部数据库对象开发：视图、存储过程、触发器。这是项目的核心教学展示点。

### 核心模块

| 任务编号 | 任务名称 | 描述 | 预计工期 |
|---------|---------|------|---------|
| BE-D1-01 | 动态价格视图 | `v_station_prices`：六维因子合成（基准价 × 库存弹性 × 事件系数 × 运输溢价 × 违禁品系数 × 通缉惩罚） | 2 天 |
| BE-D1-02 | 涟漪传播存储过程 | `fn_ripple_price()`：递归CTE遍历 `trade_routes`（最大3跳），按衰减公式更新关联站点 `base_price` | 2 天 |
| BE-D1-03 | 通缉可疑度视图 | `v_wanted_analysis`：窗口函数（`COUNT OVER` + `SUM OVER` + 条件聚合）计算最近交易 `suspicious_score` | 2 天 |
| BE-D1-04 | 交易触发器 | `tg_transaction_after_insert`：AFTER INSERT ON `transaction_logs` 时自动调用涟漪函数 + 更新通缉表 | 2 天 |
| BE-D1-05 | 垄断判定存储过程 | `fn_check_monopoly()`：UNION ALL 聚合 `player_cargo` + `warehouse_inventory`，计算全星系持有率 ≥80% | 2 天 |
| BE-D1-06 | 事件决策存储过程 | `fn_apply_choice()`：根据选项成功率随机判定、执行成功/失败影响、更新玩家遭遇记录 | 2 天 |
| BE-D1-07 | 数据初始化脚本 | 维护 `backend/app/db/init_db.sql`：表结构 + Mock 数据 + 所有视图/存储过程/触发器，确保幂等性 | 1 天 |
| BE-D1-08 | 教学注释 | 所有数据库对象添加 `COMMENT ON TABLE/COLUMN/FUNCTION`，确保 `\d+` 和 `\sf` 输出教学说明 | 1 天 |

### 交付物
- `backend/app/db/init_db.sql`（完整版，含全部数据库对象）
- 可独立执行的数据库对象定义脚本
- 数据库对象关系图（ER 图补充）

---

## 四、后端组员2（BE-Dev2）

> 负责数据库测试、性能优化、执行计划分析、部署运维、CI/CD 配置。

### 核心模块

| 任务编号 | 任务名称 | 描述 | 预计工期 |
|---------|---------|------|---------|
| BE-D2-01 | 数据库测试用例 | 编写 SQL 测试脚本：验证触发器正确性、存储过程边界条件、事务回滚行为、窗口函数结果 | 2 天 |
| BE-D2-02 | 性能基准测试 | 使用 `EXPLAIN ANALYZE` 分析高频查询执行计划：价格视图、涟漪传播、垄断判定 | 2 天 |
| BE-D2-03 | 索引优化 | 为 `transaction_logs`、`station_inventory`、`wanted_list` 添加高频查询索引 | 1 天 |
| BE-D2-04 | 物化视图评估 | 评估动态价格视图是否适合改为物化视图（MATERIALIZED VIEW）+ 定时刷新策略 | 1 天 |
| BE-D2-05 | 数据库迁移方案 | 引入 Alembic 或 Flyway 管理数据库版本迁移，替代纯 SQL 初始化 | 迭代3阶段 |
| BE-D2-06 | 压力测试 | 模拟多玩家并发交易，测试连接池、事务隔离级别、锁竞争情况 | 迭代3阶段 |
| BE-D2-07 | Docker Compose | 编写 `docker-compose.yml`：一键启动 OpenGauss + 后端 + 前端 | 2 天 |
| BE-D2-08 | 部署文档 | 编写生产环境部署手册、环境变量配置清单、故障排查指南 | 1 天 |

### 交付物
- 数据库测试脚本（`backend/tests/test_db.sql` 或 Python 测试）
- 执行计划分析报告
- `docker-compose.yml`
- 部署运维文档
- 性能优化建议书

---

## 协作流程

### Git 工作流
- **主分支**：`main`（保护分支，仅通过 PR 合并）
- **开发分支**：`dev`（每日集成）
- **个人分支**：`feature/FE-01-canvas`、`feature/BE-L02-trade` 等
- **提交规范**：`<类型>(<模块>): <描述>`，如 `feat(canvas): 完成星图节点渲染`

### 接口约定
- 所有 API 格式遵循 `backend/app/schemas/*.py` 中的 Pydantic 模型
- 前端调用前先封装到 `frontend/src/api/*.ts`
- 接口变更需提前通知并更新 Swagger 文档

### 代码审查
- 前端代码：FE 自我审查 + BE-Lead 抽查 API 调用规范
- 后端代码：BE-Lead 审查 BE-Dev1/BE-Dev2 的 PR
- 数据库脚本：BE-Dev1 提交后，BE-Lead 审查逻辑，FE 审查注释清晰度（教学展示用）

### 每日站会（建议）
- 时间：每晚 21:00（线上）
- 内容：昨日完成 / 今日计划 / 阻塞问题
- 记录：由 BE-Lead 维护每日进度文档

---

## 里程碑

| 里程碑 | 截止时间 | 验收标准 | 关键交付人 |
|--------|---------|---------|-----------|
| 迭代1：基础玩法闭环 | 第2周末 | 前端可渲染星图+价格表，后端可执行真实交易，数据库触发器可用 | FE + BE-Lead |
| 迭代2：机制拓展 | 第4周末 | 涟漪传播、通缉系统、事件系统全部联调通过 | BE-Dev1 + BE-Lead |
| 迭代3：实时优化 | 第5周末 | WebSocket 推送价格、前端无闪烁、数据库性能达标 | FE + BE-Dev2 |
| 迭代4：教学演示 | 第6周末 | 完整课程演示脚本、所有数据库对象带注释、项目文档齐全 | BE-Dev1 |
| 最终交付 | 第6周末 | 可运行的完整游戏 + 演示视频/截图 + 技术文档 | 全员 |

---

## 风险与应急预案

| 风险 | 影响 | 应对措施 |
|------|------|---------|
| OpenGauss 语法兼容问题 | BE-Dev1 开发受阻 | 提前用测试脚本验证每条 SQL；复杂逻辑拆分为 Python 实现 |
| Canvas 性能不达标 | 星图卡顿 | FE 提前做基准测试，必要时改用 SVG 或分层渲染 |
| 前后端接口不匹配 | 联调延期 | 迭代1开始前 FE + BE-Lead 共同敲定 API 规范，Swagger 自动生成 |
| 数据库触发器调试困难 | BE-Dev1 进度滞后 | BE-Lead 协助用 Docker 内 `gsql` 直接调试；保留触发器开关便于测试 |
| 多人同时改 init_db.sql | 冲突频繁 | BE-Dev1 负责统一维护，其他人通过 PR 提交变更 |
| 课程演示临时变更需求 | 最后一周返工 | 迭代4预留 2 天缓冲；所有对象从 v0.1 就附带教学注释 |

# 星际贸易模拟游戏 - 团队分工方案（4人）

> 分工原则：前端 2 人（含美术资源），后端 2 人（API 服务层 + 数据库对象），不设组长层级，四人平行协作。

## 团队构成

| 代号 | 方向 | 核心职责 |
|------|------|---------|
| **FE-Core** | 前端主程 | Canvas 渲染引擎、Redux 状态架构、WebSocket 客户端、API 对接、性能优化 |
| **FE-Art** | 前端美术/UI | 全部 2D 美术资源、UI 组件开发、动画与特效、MUI 主题与全局样式 |
| **BE-API** | 后端 API | FastAPI 路由、服务层逻辑、定时任务、WebSocket 服务端、前后端联调 |
| **BE-DB** | 后端数据库 | 全部数据库对象（视图/存储过程/触发器）、数据初始化、性能优化、测试验证 |

---

## 一、FE-Core（前端主程）

> 负责前端技术架构、核心渲染、状态管理、网络通信、性能优化。

### 1.1 星图渲染引擎

| 编号 | 任务 | 说明 |
|------|------|------|
| FC-01 | Canvas 基础框架 | 搭建 `frontend/src/canvas/StarMap.tsx`，封装 Canvas 上下文管理、坐标系转换、缩放/平移交互 |
| FC-02 | 空间站节点绘制 | 读取后端 `/api/stations` 数据，绘制 20 个圆形节点（使用 FE-Art 提供的图标）、显示名称与坐标标签 |
| FC-03 | 贸易路线绘制 | 读取 `trade_routes` 数据，绘制有向线段（带箭头），激活航线实线高亮，关闭航线虚线灰色 |
| FC-04 | 玩家位置标记 | 当前玩家所在空间站用动态脉冲动画高亮，飞船图标（FE-Art 提供）悬浮显示 |
| FC-05 | 交互功能 | 鼠标悬停显示空间站 tooltip（名称/坐标/安全等级）、点击节点选中并弹出移动确认面板 |
| FC-06 | 航线动画效果 | 飞船沿航线移动的轨迹动画（贝塞尔曲线插值）、跃迁/折跃特效（与 FE-Art 配合） |

### 1.2 状态管理与数据同步

| 编号 | 任务 | 说明 |
|------|------|------|
| FC-07 | Redux 架构完善 | 完善 `playerSlice`（玩家状态含通缉）、`marketSlice`（动态价格缓存）、`starMapSlice`（节点选中/航线状态）、`eventSlice`（事件队列），编写完整 reducer + actions + selectors |
| FC-08 | 数据持久化 | `redux-persist` 配置：页面刷新后保留玩家登录态、当前对局信息 |
| FC-09 | 乐观更新机制 | 交易提交后立即更新 Redux 状态，后端返回失败时回滚并弹出错误提示 |
| FC-10 | 轮询机制 | 每 3 秒轮询玩家状态、所在站点价格、通缉状态；轮询与 WebSocket 推送互补 |

### 1.3 网络通信

| 编号 | 任务 | 说明 |
|------|------|------|
| FC-11 | HTTP API 封装 | 完善 `frontend/src/api/http.ts`：统一错误处理、请求拦截（加 token/玩家ID）、响应类型定义 |
| FC-12 | WebSocket 客户端 | 升级 `frontend/src/api/websocket.ts`：连接管理、心跳重连（断线 3 秒内自动重连）、频道订阅/取消、事件监听回调注册、价格推送自动 dispatch |
| FC-13 | API 对接 | 对接全部后端接口：玩家状态查询、站点价格查询、执行交易、执行移动、事件决策提交、通缉状态查询、游戏开局/放弃 |

### 1.4 核心页面与布局

| 编号 | 任务 | 说明 |
|------|------|------|
| FC-14 | 主页面框架 | `MainPage.tsx` 三栏布局：左侧玩家信息 + 交易面板、中间 Canvas 星图、右侧交易历史 + 事件日志 |
| FC-15 | 响应式适配 | 窗口缩放时重新计算 Canvas 尺寸与节点坐标，最小适配 1280×720 |
| FC-16 | 路由配置 | 登录页 → 游戏主页面 → 结算页，React Router 配置 + 路由守卫（未开局跳转登录） |

### 1.5 性能优化

| 编号 | 任务 | 说明 |
|------|------|------|
| FC-17 | Canvas 性能 | `requestAnimationFrame` 节流渲染、节点离屏检测、视口外节点不绘制 |
| FC-18 | 虚拟滚动 | `TransactionLog` 超过 100 条时启用虚拟滚动 |
| FC-19 | 构建优化 | Vite 代码分割、懒加载（结算页/事件弹窗）、Tree Shaking |

**FE-Core 交付物**
- `frontend/src/canvas/StarMap.tsx`（完整可交互星图）
- `frontend/src/store/`（全部完善后的 slices）
- `frontend/src/api/http.ts` + `frontend/src/api/websocket.ts`
- `frontend/src/pages/MainPage.tsx`（完整布局框架）
- `frontend/src/App.tsx` + 路由配置

---

## 二、FE-Art（前端美术/UI）

> 负责全部 2D 美术资源、UI 组件视觉实现、动画特效、主题风格统一。

### 2.1 美术资源制作

> 使用工具建议：Figma（UI 设计）、Aseprite（像素画）、Blender（2D 渲染）或 Midjourney/Stable Diffusion（AI 生成后精修）。

| 编号 | 资源 | 规格 | 说明 |
|------|------|------|------|
| FA-01 | 飞船图标 | 64×64 px PNG，透明背景 | 玩家飞船，至少 3 种变体（默认/升级/通缉状态），用于星图标记 |
| FA-02 | 空间站节点图标 | 48×48 px PNG，透明背景 | 至少 3 种风格（贸易站/矿场/黑市），对应不同安全等级 |
| FA-03 | 商品图标 ×8 | 32×32 px PNG，透明背景 | 标准矿石、高能晶体、精密零件、星际芯片、医疗药剂、生物样本、暗物质核心、走私艺术品 |
| FA-04 | 违禁品标记 | 16×16 px PNG | 红色骷髅/警告图标，叠加在违禁品商品上 |
| FA-05 | 通缉等级图标 ×3 | 32×32 px PNG | 等级1（监视眼）、等级2（调查锁）、等级3（扣留手铐） |
| FA-06 | 事件类型图标 ×3 | 48×48 px PNG | 市场事件（图表）、航线事件（断裂链路）、遭遇事件（感叹号） |
| FA-07 | 货币图标 | 24×24 px PNG | 星际信用点符号，用于资金显示 |
| FA-08 | 货舱图标 | 24×24 px PNG | 包裹/集装箱图标 |
| FA-09 | 界面背景图 | 1920×1080 JPG | 深空星空背景，暗色调，可平铺 |
| FA-10 | 面板纹理 | 可平铺 PNG | 科幻风格 HUD 面板边框、扫描线纹理 |
| FA-11 | 按钮状态图 | 九宫格切图 PNG | 默认/悬停/按下/禁用四种状态 |
| FA-12 | 加载动画帧 | 8 帧 PNG 序列 | 飞船跃迁 Loading Spinner |
| FA-13 | 胜利/失败插图 | 800×600 PNG | 垄断胜利（星际帝国）、破产失败（废弃飞船）、超时（沙漏星系） |
| FA-14 | 交易特效帧 | 8 帧 PNG 序列 | 买入（绿光扩散）、卖出（金光收敛） |
| FA-15 | 涟漪波纹动画 | 8 帧 PNG 序列 | 价格涟漪传播的同心圆波纹效果 |

**资源存放路径**：`frontend/public/assets/` 或 `frontend/src/assets/`

### 2.2 UI 组件开发

| 编号 | 组件 | 说明 |
|------|------|------|
| FA-16 | `TradeForm` 交易面板 | 使用 FE-Art 提供的商品图标、货币图标；下拉选择器带图标预览、数量步进器、交易预览区（显示利润/亏损颜色区分） |
| FA-17 | `PlayerPanel` 玩家信息 | 头像占位区、资金显示（带货币图标）、货舱进度条（彩色分段：绿色安全/黄色预警/红色满载）、通缉图标、当前站点名称 |
| FA-18 | `TransactionLog` 交易历史 | 时间轴样式、每条记录带商品图标、买入卖出颜色区分（绿买红卖）、金额右对齐、悬停显示详细 |
| FA-19 | `EventModal` 事件弹窗 | 模态框带事件类型图标、描述文本区、二选一/三选一决策按钮（带悬停效果）、结果展示动画（成功/失败图标飞入） |
| FA-20 | `SettlementScreen` 结算界面 | 胜利/失败插图全屏展示、评分逐项列出（带动画计数）、重玩/返回按钮 |
| FA-21 | `ToastNotification` 全局通知 | 市场事件（蓝色）、航线事件（橙色）、通缉升级（红色）、交易成功（绿色）四种主题样式 |
| FA-22 | `WarehousePanel` 仓库面板 | 各站点仓库商品列表、数量显示、取货按钮 |
| FA-23 | `WantedBadge` 通缉徽章 | 动态闪烁的通缉等级展示、悬停显示具体原因 |
| FA-24 | `PriceTag` 价格标签 | 星图上每个空间站旁的价格摘要气泡（显示涨跌箭头） |

### 2.3 主题与样式系统

| 编号 | 任务 | 说明 |
|------|------|------|
| FA-25 | MUI 主题定制 | `createTheme` 配置：主色 `#00d4aa`（霓虹青）、辅色 `#ff6b35`（警报橙）、背景 `#0a0e27`（深空蓝）、字体 Orbitron/Roboto |
| FA-26 | 全局 CSS 变量 | `:root` 定义颜色/阴影/间距 CSS 变量，供 MUI 和非 MUI 组件统一使用 |
| FA-27 | 暗色主题 | 确保所有组件在深色背景下可读性良好、对比度符合 WCAG 标准 |
| FA-28 | 字体加载 | 引入科幻风格字体（Google Fonts: Orbitron 用于标题、Roboto Mono 用于数字） |

### 2.4 动画与特效

| 编号 | 任务 | 说明 |
|------|------|------|
| FA-29 | 交易成功动画 | 金币飞散粒子效果（Canvas 或 CSS 动画） |
| FA-30 | 飞船跃迁动画 | 飞船沿航线移动时的拖尾光效、到达时的空间扭曲扩散 |
| FA-31 | 事件触发特效 | 全屏边缘红色闪烁（遭遇）、金色边框流动（市场利好）、蓝色链路脉冲（航线变更） |
| FA-32 | 价格跳动动画 | 数字变化时的滚动计数效果（类似老虎机） |
| FA-33 | 涟漪传播可视化 | 星图上交易完成后，相邻站点半径扩散的波纹动画 |

**FE-Art 交付物**
- `frontend/public/assets/` 全部美术资源文件
- `frontend/src/components/` 全部 UI 组件（视觉实现）
- `frontend/src/index.css` + MUI theme 配置文件
- 动画/特效 CSS/Canvas 实现代码

---

## 三、BE-API（后端 API + 服务层）

> 负责 FastAPI 路由、业务逻辑服务层、定时任务、WebSocket 服务端、与前端联调。

### 3.1 API 路由开发

| 编号 | 接口 | 说明 |
|------|------|------|
| BA-01 | `POST /api/games` | 开局：创建玩家、初始化货舱、返回玩家ID与初始状态 |
| BA-02 | `GET /api/games/{game_id}/status` | 查询对局状态（进行中/已结束/超时） |
| BA-03 | `DELETE /api/games/{game_id}` | 放弃对局：标记状态并清理资源 |
| BA-04 | `GET /api/players/{player_id}` | 查询玩家完整状态（资金、货舱、通缉、位置） |
| BA-05 | `GET /api/stations` | 返回全部空间站坐标与连接关系（供星图渲染） |
| BA-06 | `GET /api/stations/{station_id}/prices` | 查询当前站点全部商品的实时价格（调用 `v_station_prices` 视图） |
| BA-07 | `GET /api/stations/{station_id}/routes` | 返回从当前站点可达的航线列表及运输成本 |
| BA-08 | `POST /api/trade` | 执行交易：校验→事务执行→返回更新后状态；请求体含 player_id, goods_id, quantity, trade_type |
| BA-09 | `POST /api/move` | 玩家移动：校验航线→扣费→更新位置→30%概率触发遭遇事件→返回新位置与触发事件 |
| BA-10 | `POST /api/events/{event_id}/choose` | 事件决策：提交选项ID→调用存储过程判定→返回结果与状态变更 |
| BA-11 | `GET /api/players/{player_id}/wanted` | 查询通缉状态（等级、可疑度、原因） |
| BA-12 | `GET /api/players/{player_id}/logs` | 分页查询交易历史（支持 limit/offset、trade_type 筛选） |
| BA-13 | `GET /api/players/{player_id}/warehouse` | 查询玩家全部仓库库存 |
| BA-14 | `POST /api/warehouse/withdraw` | 从仓库取货到飞船 |
| BA-15 | `GET /api/events/active` | 查询当前生效的全局事件列表 |
| BA-16 | `GET /api/leaderboard` | 排行榜：按最终评分排序的历史对局记录 |

### 3.2 服务层实现

| 编号 | 服务 | 说明 |
|------|------|------|
| BA-17 | `TradeService` | 交易校验逻辑（资金/库存/货舱空间）、加权平均成本计算、事务编排 |
| BA-18 | `WantedService` | 查询通缉状态、计算通缉惩罚系数（影响价格） |
| BA-19 | `MonopolyService` | 调用 `fn_check_monopoly()`、更新游戏状态为 WON、计算最终评分 |
| BA-20 | `EventService` | 事件生成逻辑（随机选择事件类型与目标）、遭遇事件概率计算 |
| BA-21 | `PriceService` | 封装价格查询逻辑，处理缓存策略（若迭代3引入 Redis） |
| BA-22 | `PlayerService` | 玩家状态管理、货舱容量计算、仓库操作逻辑 |
| BA-23 | `RouteService` | 航线图查询、最短路径计算（Dijkstra，用于高级功能） |

### 3.3 定时任务（APScheduler）

| 编号 | 任务 | 周期 | 说明 |
|------|------|------|------|
| BA-24 | 垄断判定 | 30 秒 | 调用 `fn_check_monopoly()`，若持有率 ≥80% 则标记 `game_status = 'WON'` 并广播 |
| BA-25 | 通缉衰减 | 10 秒 | 所有玩家 `suspicious_score -= 5`，若 ≤0 则清除通缉 |
| BA-26 | 事件批量触发 | 平均 45 秒 | 随机生成 `MARKET`/`ROUTE` 类型全局事件，插入 `galaxy_events` 并广播 |
| BA-27 | 超时检测 | 60 秒 | 检查 `game_start_time`，超过 600 秒未结束则标记 `'TIMEUP'` 并广播 |
| BA-28 | 事件过期清理 | 60 秒 | 将 `expired_at < NOW()` 的事件标记为失效 |

### 3.4 WebSocket 服务端

| 编号 | 功能 | 说明 |
|------|------|------|
| BA-29 | 连接管理 | 维护 `player_id → websocket` 映射，断线清理 |
| BA-30 | 频道订阅 | 支持 `{ "type": "subscribe", "channel": "station_1" }` 订阅特定站点价格 |
| BA-31 | 价格广播 | 交易完成后向订阅了相关站点的客户端推送 `{ "type": "price_update", "station_id": 1, "goods_id": 2, "new_price": 150 }` |
| BA-32 | 事件广播 | 全局事件生成时广播给所有连接：`{ "type": "global_event", "event": {...} }` |
| BA-33 | 定向推送 | 遭遇事件/通缉变化仅推送给对应玩家：`{ "type": "encounter", "event_id": 5 }` |
| BA-34 | 状态广播 | 游戏结算时广播给所有在线玩家：`{ "type": "game_over", "winner": {...} }` |

### 3.5 联调与文档

| 编号 | 任务 | 说明 |
|------|------|------|
| BA-35 | Swagger 文档 | 确保所有路由正确注册，Swagger UI `/docs` 自动生成完整文档 |
| BA-36 | API 测试 | 使用 `pytest` + `httpx` 编写接口自动化测试 |
| BA-37 | 联调支持 | 配合 FE-Core 对接 API、实时修复接口问题、提供 mock 数据 |
| BA-38 | 错误处理 | 统一异常处理中间件，返回结构化错误 `{ "code": "INSUFFICIENT_FUNDS", "message": "..." }` |

**BE-API 交付物**
- `backend/app/api/routes.py`（全部 16+ 个路由）
- `backend/app/api/websocket.py`（完整 WebSocket 服务端）
- `backend/app/services/*.py`（全部服务层）
- `backend/app/main.py`（APScheduler 集成）
- `backend/tests/test_api.py`（接口测试）

---

## 四、BE-DB（后端数据库）

> 负责全部数据库对象（表、视图、存储过程、触发器）、数据初始化、性能优化、测试验证。这是课程的核心教学展示点。

### 4.1 数据库对象开发

| 编号 | 对象 | 类型 | 说明 |
|------|------|------|------|
| BD-01 | `v_station_prices` | 视图 | 六维因子合成动态价格：基准价 × 库存弹性系数 × 事件影响系数 × 运输溢价 × 违禁品系数 × 通缉惩罚系数 |
| BD-02 | `fn_ripple_price` | 存储过程 | 递归CTE遍历 `trade_routes`（最大3跳），按 `v_intensity * (1/hop) * (1/independence_factor)` 衰减更新关联站点 `base_price` |
| BD-03 | `v_wanted_analysis` | 视图 | 窗口函数：最近10笔交易 `COUNT OVER` + 最近5笔金额 `SUM OVER` + 违禁品计数，合成 `suspicious_score` |
| BD-04 | `tg_transaction_after_insert` | 触发器 | AFTER INSERT ON `transaction_logs`：自动调用 `fn_ripple_price` + 更新 `wanted_list` |
| BD-05 | `fn_check_monopoly` | 存储过程 | UNION ALL 聚合 `player_cargo` + `warehouse_inventory`，计算每种商品全星系持有率，返回 ≥80% 的记录 |
| BD-06 | `fn_apply_choice` | 存储过程 | 事件决策：根据 `success_rate` 随机判定、执行成功/失败影响（更新资金/库存/通缉）、写入 `player_encounters` |
| BD-07 | `fn_calculate_score` | 存储过程 | 结算评分：`资金×0.5 + 区域垄断数×5000 + 交易次数×100 + 事件数×200` |
| BD-08 | `v_player_holdings` | 视图 | 聚合玩家货舱 + 仓库，显示每种商品的总持有量与全星系占比 |
| BD-09 | `v_station_summary` | 视图 | 每个空间站的安全等级、独立因子、连接数、商品种类数汇总 |

### 4.2 数据初始化与维护

| 编号 | 任务 | 说明 |
|------|------|------|
| BD-10 | `init_db.sql` 维护 | 维护 `backend/app/db/init_db.sql`：表结构 + 约束 + Mock 数据 + 全部视图/存储过程/触发器，确保可重复执行（幂等性） |
| BD-11 | 数据库版本管理 | 引入 Alembic 管理迁移脚本，替代纯 SQL 手动维护（迭代3） |
| BD-12 | Mock 数据扩充 | 为 `galaxy_events`、`event_effects`、`event_choices` 预置 5+ 组完整事件模板 |
| BD-13 | 数据备份脚本 | 提供 `pg_dump` / `gs_dump` 备份命令，用于课程演示前快速恢复初始状态 |

### 4.3 教学注释

| 编号 | 任务 | 说明 |
|------|------|------|
| BD-14 | 表注释 | 所有 13 张表添加 `COMMENT ON TABLE`，说明业务含义与教学展示目的 |
| BD-15 | 列注释 | 关键列（如 `independence_factor`、`suspicious_score`、`game_status`）添加 `COMMENT ON COLUMN` |
| BD-16 | 函数注释 | 所有存储过程/触发器添加 `COMMENT ON FUNCTION`，说明算法原理与参数含义 |
| BD-17 | 执行计划注释 | 在 `init_db.sql` 末尾添加注释块，标注每个对象对应的课程知识点（如"BD-02 对应递归CTE教学"） |

### 4.4 性能优化

| 编号 | 任务 | 说明 |
|------|------|------|
| BD-18 | 索引设计 | `transaction_logs(player_id, created_at)`、`wanted_list(player_id)`、`station_inventory(station_id)` 等高频查询索引 |
| BD-19 | 执行计划分析 | `EXPLAIN ANALYZE` 分析 `v_station_prices`、`fn_ripple_price`、`fn_check_monopoly`，输出报告 |
| BD-20 | 物化视图评估 | 评估 `v_station_prices` 是否适合改为 `MATERIALIZED VIEW` + `REFRESH` 策略 |
| BD-21 | 递归CTE优化 | 确保 `fn_ripple_price` 的递归深度受控（`hop < 3`），避免循环图导致无限递归 |
| BD-22 | 连接池调优 | 根据并发玩家数调整 `asyncpg` 连接池 `min_size`/`max_size` |

### 4.5 数据库测试

| 编号 | 任务 | 说明 |
|------|------|------|
| BD-23 | 触发器测试 | 验证 `tg_transaction_after_insert`：插入交易记录后，涟漪传播范围是否正确、通缉分数是否累加 |
| BD-24 | 存储过程测试 | `fn_ripple_price` 边界：传播3跳后停止、关闭航线不传播；`fn_check_monopoly` 边界：恰好80%与79.9% |
| BD-25 | 视图测试 | `v_station_prices` 各因子独立验证（库存弹性、事件系数、通缉惩罚分别生效）；`v_wanted_analysis` 窗口范围验证 |
| BD-26 | 事务测试 | 模拟并发交易，验证事务隔离级别、锁竞争、死锁检测 |
| BD-27 | 约束测试 | 验证 CHECK 约束：违禁品类别一致性、通缉等级 0-3、游戏状态枚举、库存非负 |

**BE-DB 交付物**
- `backend/app/db/init_db.sql`（完整版，含全部数据库对象与 Mock 数据）
- `backend/tests/test_db.py` 或 `backend/tests/test_db.sql`（数据库测试脚本）
- 执行计划分析报告
- 数据库对象关系图（ER 图）
- 数据库备份/恢复脚本

---

## 五、四人协作接口

### 前端两人协作

| 协作点 | FE-Core | FE-Art |
|--------|---------|--------|
| 星图节点图标 | 提供渲染坐标与事件回调 | 提供 `station_*.png` 图标与尺寸规范 |
| 飞船动画 | 编写 Canvas 动画循环与插值逻辑 | 提供飞船 spritesheet 与关键帧 |
| 商品展示 | 在 `TradeForm` 中预留图标 `<img>` 槽位 | 提供 `goods_*.png` 并定义命名规范 |
| 主题变量 | 在 TSX 中使用 MUI theme | 定义 theme 配置与全局 CSS 变量 |
| 事件弹窗 | 控制弹窗打开/关闭逻辑与数据流 | 设计弹窗视觉样式与按钮动效 |
| 特效触发 | 在交易/移动/事件代码中调用特效函数 | 实现特效 CSS/Canvas 函数 |

### 后端两人协作

| 协作点 | BE-API | BE-DB |
|--------|--------|-------|
| 价格查询 | `routes.py` 中调用 `v_station_prices` | 创建并优化 `v_station_prices` 视图 |
| 交易接口 | `TradeService` 编排事务逻辑 | 创建触发器确保 AFTER INSERT 执行 |
| 涟漪传播 | `TradeService` 中 `PERFORM fn_ripple_price()` | 实现 `fn_ripple_price` 递归CTE |
| 垄断判定 | APScheduler 定时调用存储过程 | 实现 `fn_check_monopoly` |
| 数据模型 | `schemas/*.py` 定义 Pydantic 模型 | 确保数据库列类型与 schema 匹配 |
| 联调问题 | 若接口返回慢，排查 SQL 执行时间 | 提供 `EXPLAIN` 分析协助优化 |
| 初始化 | `scripts/init_database.py` 执行 SQL | 维护 `init_db.sql` 确保可执行 |

### 前后端协作

| 协作点 | 前端（FE-Core） | 后端（BE-API） |
|--------|----------------|---------------|
| API 规范 | 按 Swagger 文档调用 | Swagger 自动生成并保持更新 |
| WebSocket 协议 | 按约定格式发送 subscribe | 按约定格式广播 price_update |
| 错误处理 | 根据 `code` 字段显示中文提示 | 返回结构化错误含 `code` + `message` |
| 数据格式 | 按 Pydantic 模型解析响应 | `schemas/*.py` 定义响应模型 |

---

## 六、开发里程碑

| 阶段 | 截止时间 | 验收标准 | 主要交付人 |
|------|---------|---------|-----------|
| **迭代1：基础闭环** | 第2周末 | 星图可渲染、价格可查询、交易可执行、数据库存储过程可用 | FE-Core + BE-API + BE-DB |
| **迭代2：美术+机制** | 第4周末 | 全部美术资源就位、涟漪传播可视化、通缉系统联调通过、事件弹窗可用 | FE-Art + BE-DB |
| **迭代3：实时优化** | 第5周末 | WebSocket 推送价格无闪烁、前端动画流畅、数据库性能达标 | FE-Core + BE-API |
| **迭代4：教学演示** | 第6周末 | 完整课程演示脚本、所有数据库对象带教学注释、可独立运行演示 | BE-DB + FE-Art |
| **最终交付** | 第6周末 | 可运行完整游戏 + 演示 PPT/视频 + 部署文档 | 全员 |

---

## 七、Git 工作流与规范

### 分支策略
- `main`：保护分支，仅通过 PR 合并，随时可运行
- `dev`：每日集成，四人代码合并至此
- `feature/FC-01-canvas`、`feature/FA-03-goods-icons`、`feature/BA-08-trade-api`、`feature/BD-02-ripple`：个人功能分支

### 提交规范
```
<类型>(<模块>): <描述>

类型：feat / fix / docs / style / refactor / test / chore
模块：canvas / ui / api / db / trade / event / ws / asset

示例：
feat(canvas): 完成星图节点渲染与点击交互
fix(db): 修复涟漪传播递归CTE无限循环问题
asset(goods): 添加8种商品图标PNG
```

### 代码审查
- FE-Core 审查 FE-Art 的 PR（关注性能与代码规范）
- FE-Art 审查 FE-Core 的 PR（关注 UI 槽位预留与样式一致性）
- BE-API 审查 BE-DB 的 PR（关注接口兼容性）
- BE-DB 审查 BE-API 的 PR（关注 SQL 调用正确性）
- 数据库脚本变更：必须经过 BE-DB 审查后才能合并到 `dev`

---

## 八、风险与应急预案

| 风险 | 影响 | 应对措施 | 负责 |
|------|------|---------|------|
| OpenGauss 语法不兼容 | BE-DB 开发受阻 | 复杂逻辑先用 Python 实现，后续再转 SQL；保留触发器开关便于调试 | BE-DB + BE-API |
| 美术资源制作耗时超预期 | FE-Art 进度滞后 | 先用 MUI 默认图标占位，后续替换；或使用 AI 生成（Midjourney/SD）加速 | FE-Art |
| Canvas 星图性能差 | 前端卡顿 | FE-Core 提前做基准测试；必要时改用 SVG + CSS 动画；或降低节点重绘频率 | FE-Core |
| 前后端接口频繁变更 | 联调延期 | 迭代1第一周 FE-Core + BE-API 共同敲定 Swagger 接口契约，之后冻结变更 | FE-Core + BE-API |
| 多人同时改 `init_db.sql` | 冲突频繁 | BE-DB 统一维护，其他人通过 PR 提交变更，由 BE-DB 合并 | BE-DB |
| 数据库事务超时 | 交易卡顿 | 涟漪传播限制为 3 跳；大事务拆分为小事务；必要时降级为异步涟漪 | BE-DB + BE-API |
| 课程演示临时改需求 | 最后一周返工 | 迭代4预留 3 天缓冲；所有数据库对象从 v0.1 就附带教学注释 | 全员 |

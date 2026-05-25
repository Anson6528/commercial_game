# 前端开发详细任务规划（基于 frontend_detail.md v1.0）

> **生成日期**: 2026-05-25  
> **依据**: `agent/frontend_detail.md`（游戏机制+界面设计）+ `agent/team_assignment.md`（角色分工）  
> **角色**: FE-Core（前端主程）+ FE-Art（前端美术/UI）  
> **注意**: 本规划替代 `team_assignment.md` 中前端部分的任务编号体系，两角色任务重新编排。

---

## 0. 关键设计变更摘要（相对于原 PDF 设计）

| 维度 | 原设计 | 新设计 (frontend_detail.md) |
|------|--------|---------------------------|
| 游戏节奏 | 10 分钟实时倒计时 | 行动点制（非实时回合制） |
| 状态同步 | 轮询 + WebSocket 推送 | 增量补丁协议（POST /api/action → patch） |
| 渲染引擎 | Canvas 2D | PixiJS WebGL |
| 布局 | 三栏布局（左面板/星图/右面板） | 驾驶舱四分区 HUD（上/右/下/中） |
| 摄像操控 | 无（静态视图） | WASD 平移 + 滚轮缩放 |
| 交易界面 | 侧边栏表单 | 底部上推居中模态（左商品/右货舱） |
| 移动流程 | 点击即移动 | 两次点击确认 → 飞行动画 → 遭遇判定 |
| 仓库面板 | 独立组件 | 右侧滑出宽面板（左货舱/右仓库） |
| 页面层级 | 游戏主页 | 三层：登录 → 大厅 → 游戏场景 |
| 开发者面板 | 无 | Ctrl+Shift+~ 左侧滑出（SQL流/事务/涟漪回溯） |

---

## 1. 项目文件结构（目标状态）

```
frontend/
├── index.html                    # 入口 HTML（挂载 PixiJS + React）
├── public/assets/                # FE-Art 美术资源（PNG/Spritesheet）
│   ├── goods/                    # 商品图标 ×8 (FA-03)
│   ├── stations/                 # 空间站精灵图 (FA-02)
│   ├── ships/                    # 飞船精灵图 ×3 (FA-01)
│   ├── icons/                    # UI 图标（货币/货舱/违禁品等）(FA-04~08)
│   ├── backgrounds/              # 背景图/面板纹理 (FA-09~10)
│   └── fx/                       # 特效帧序列 (FA-12/14/15)
├── src/
│   ├── engine/                   # [FC] PixiJS 渲染引擎
│   │   ├── StarMap.ts            # 星图主场景（背景/粒子/节点/航道）
│   │   ├── Camera.ts             # WASD + 滚轮 + 拖拽相机控制
│   │   ├── NodeRenderer.ts       # 空间站节点绘制（伪3D精灵）
│   │   ├── RouteRenderer.ts      # 航道绘制（有向线段/封锁虚线）
│   │   ├── ShipAnimator.ts       # 飞船沿航道飞行动画（贝塞尔+拖尾）
│   │   ├── RippleRenderer.ts     # 涟漪脉冲特效（节点光环扩散）
│   │   └── RegionOverlay.ts      # 区域垄断染色视图
│   ├── state/                    # [FC] 全局状态管理
│   │   ├── gameState.ts          # GameState 类型定义 + 初始值
│   │   ├── patchReducer.ts       # 增量 patch 深合并 reducer
│   │   ├── actions.ts            # 异步 action（move/trade/event/warehouse）
│   │   └── useGameState.ts       # 状态读写 hooks + selectors
│   ├── api/                      # [FC] 网络通信层
│   │   ├── http.ts               # HTTP 客户端（POST /api/action 等）
│   │   ├── contracts.ts          # API 请求/响应 TypeScript 类型
│   │   └── errorHandler.ts       # 网络错误 → 强制返回大厅
│   ├── pages/                    # 页面级组件
│   │   ├── LoginScreen.tsx       # [FA] 登录界面
│   │   ├── LobbyScreen.tsx       # [FA] 大厅界面（开始/排行榜/设置）
│   │   └── GameScene.tsx         # [FC+FA] 游戏主场景容器
│   ├── hud/                      # [FA] HUD 层组件（驾驶舱叠加层）
│   │   ├── TopHUD.tsx            # 上侧边栏（资金/状态/年份/行动点/结束）
│   │   ├── RightCargoPanel.tsx   # 右侧货舱快捷栏
│   │   ├── BottomInfoBar.tsx     # 下侧边栏（垄断迷你条/站点名/悬停信息）
│   │   └── RegionViewToggle.tsx  # 区域视图切换按钮
│   ├── modals/                   # [FA] 模态弹窗层
│   │   ├── TradeModal.tsx        # 交易界面（底部上推→居中，左右分栏）
│   │   ├── MiniTradePanel.tsx    # 小交易详情（趋势图+比价+输入+Switch）
│   │   ├── EncounterModal.tsx    # 遭遇事件全屏模态
│   │   ├── WarehousePanel.tsx    # 仓库管理宽面板（右侧滑出）
│   │   ├── SettlementScreen.tsx  # 结算界面（全屏覆盖）
│   │   └── DevPanel.tsx          # 开发者/评审面板（左侧滑出）
│   ├── fx/                       # [FA] 动画与特效
│   │   ├── AnimatedNumber.ts     # 数字滚动计数
│   │   ├── TradeParticles.ts     # 金币飞散粒子
│   │   ├── ScreenFlash.ts        # 全屏事件闪烁/边框流动/脉冲
│   │   ├── LoadingSpinner.ts     # 鹰角式科技加载动画
│   │   ├── WorldEventToast.ts    # 世界事件边缘通知条
│   │   └── ShipTrail.ts          # 飞船拖尾光效粒子
│   ├── theme/                    # [FA] 主题系统
│   │   ├── theme.ts              # MUI createTheme
│   │   ├── colors.ts             # 色彩常量（科技蓝 #00d4ff / 青绿 #05ffa1 等）
│   │   └── global.css            # CSS 变量 + 全局样式 + 字体
│   ├── shared/                   # 共享工具（两角色共用）
│   │   ├── types.ts              # 全局 TypeScript 类型
│   │   └── utils.ts              # 格式化/数学工具
│   ├── App.tsx                   # [FC] 路由配置
│   └── main.tsx                  # 入口 + Provider 挂载
```

---

## 二、FE-Core 任务清单（前端主程）

> **职责**: PixiJS 渲染引擎、全局状态管理（GameState + patch 合并）、API 通信层、页面路由、移动/交易流程编排、性能优化。  
> **编号前缀**: `GC`（Game Core）

### 2.1 PixiJS 星图渲染引擎

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-01 | PixiJS 项目集成 | 安装 `pixi.js`，在 `GameScene.tsx` 中初始化 PixiJS Application，挂载到 DOM，管理 PixiJS ↔ React 生命周期同步（useEffect 创建/销毁） | — |
| GC-02 | Camera 相机系统 | 实现 WASD 平移（keydown 持续移动）+ 鼠标滚轮缩放（以鼠标位置为焦点）+ 鼠标拖拽平移。缩放范围 0.5x ~ 3x。相机矩阵应用到 PixiJS 舞台。 | GC-01 |
| GC-03 | 星空背景渲染 | 深色星空渐变背景 + 随机星点粒子（PixiJS ParticleContainer）+ 远处星云光晕（径向渐变 sprite）。粒子缓慢移动营造深度感。 | GC-01 |
| GC-04 | 空间站节点绘制 | 读取 `GameState.stations`，为每个站点创建 PixiJS Container：包含精灵图（FE-Art 提供，先占位）+ 名称标签（PixiJS Text 或 HTML overlay）+ 安全等级颜色区分。支持高亮/选中/呼吸灯状态切换。 | GC-01, FA-02 |
| GC-05 | 航道绘制 | 读取 `GameState.routes`，为每条航道创建 PixiJS Graphics 线段：正常=淡蓝色细线，封锁=红色虚线。激活航道绘制方向箭头（三角形）。支持高亮态（橙色粗线）。 | GC-01 |
| GC-06 | 玩家当前位置标记 | 读取 `GameState.player.current_station_id`，在对应站点渲染呼吸灯光晕（PixiJS 滤镜或 sprite 动画）+ 飞船图标悬浮。 | GC-04 |
| GC-07 | 相邻站点提示 | 从当前站点向所有相邻可达站点绘制淡橙色虚线箭头 + 悬浮文字（`消耗 X 单位` + `航线状态`）。仅在玩家未选中目标时显示。 | GC-05 |
| GC-08 | 鼠标交互系统 | 在 PixiJS 舞台上处理 click / mousemove 事件：hover 站点时高亮+下发侧栏更新；click 相邻站点进入移动确认态；click 当前站点触发交易界面。需要将 PixiJS 坐标转换为 GameState 坐标。 | GC-02 |

### 2.2 移动流程

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-09 | 移动-阶段A：浏览预览 | 实现 frontend_detail.md 4.1 阶段A：当前站点到相邻站点的橙色虚线+消耗标注。hover 任意站点时更新 BottomInfoBar 显示站点名+预计消耗。 | GC-07, GC-08 |
| GC-10 | 移动-阶段B：选择目标 | 实现 4.1 阶段B：第一次点击相邻站点 → 该站点高亮边框+发光；当前站点→目标站点航道高亮；目标站点上方弹出确认 Tooltip（"再次点击确认移动"）。点击不同相邻站点切换目标。点击非相邻站点或空白取消。 | GC-08 |
| GC-11 | 移动-阶段C：确认移动 | 实现 4.1 阶段C：第二次点击同一站点 → 设置 `isProcessing=true` 锁定界面 → 调用 `POST /api/action { action_type: "move", payload: { target_station_id } }` → 同时在后台播放飞行动画。 | GC-09, GC-10 |
| GC-12 | 飞船跃迁动画 | PixiJS 实现：飞船 sprite 从当前站点沿航道贝塞尔曲线移动到目标站点。2 个动画阶段：①加速阶段（0-0.3s 缩放+发光）→ ②巡航阶段（沿航道插值移动+拖尾粒子）→ ③减速阶段（0.3s 缩放恢复+空间扭曲扩散）。总时长 1.5-2s。拖尾光效使用 FE-Art 提供的粒子配置。 | GC-11, FA-30 |
| GC-13 | 移动-遭遇事件判定 | 飞行动画播放期间，若后端 patch 中含 `encounter` 字段，则在动画中间点弹出 EncounterModal（覆盖层，动画继续背景播放）。玩家必须处理完遭遇事件才能继续。 | GC-12, FA-19 |
| GC-14 | 移动-状态结算 | 飞行动画结束后，按顺序应用 patch：①更新位置 `current_station_id` → ②扣除行动点 → ③应用遭遇事件结果（如有）→ ④推进世界回合 → ⑤更新垄断进度 → ⑥刷新航道状态。每个步骤间有 100ms 视觉延迟。解除 `isProcessing`。 | GC-12, GC-13 |

### 2.3 交易流程

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-15 | 交易-打开触发 | 玩家点击当前站点（非相邻站点）→ 调用 `POST /api/action { action_type: "trade", payload: { station_id } }` 获取该站点完整价格数据 → 打开 TradeModal。 | GC-08 |
| GC-16 | 交易-执行 | TradeModal 中玩家点击"执行交易"→ 调用 `POST /api/action { action_type: "trade", payload: { goods_id, quantity, trade_type, station_id } }` → 接收 patch → 更新 GameState → 触发涟漪动画 → 更新资金/HUD。 | GC-15 |
| GC-17 | 交易-锁定状态处理 | 根据 `station.goods[id].is_locked` 字段，在传递给 TradeModal 的数据中标记锁定商品。前端禁用锁定商品的交互。 | GC-15 |

### 2.4 仓库流程

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-18 | 仓库-存取操作 | 实现货舱→仓库（存入）和仓库→货舱（取出）的 API 调用：`POST /api/action { action_type: "warehouse_transfer", payload: { goods_id, quantity, direction } }`。应用 patch 更新货舱和仓库数据。 | — |

### 2.5 全局状态管理

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-19 | GameState 类型定义 | 根据 frontend_detail.md §11.3 定义完整的 `GameState` TypeScript 接口。包括 player, stations, routes, warehouse, monopoly_progress, active_events, world_turn。 | — |
| GC-20 | patchReducer | 实现深合并函数，将后端返回的 `patch` 对象合并到当前 GameState。处理嵌套对象合并、数组替换、删除字段（值为 null）。合并后返回新的 GameState 引用以触发 React 重渲染。 | GC-19 |
| GC-21 | useGameState hook | 轻量状态管理（使用 React Context + useReducer 或 Zustand）。暴露 `gameState`、`dispatch`、`applyPatch(patch)`、`isProcessing`。提供便捷 selector：`useCredits()`、`useCargo()`、`useMonopolyProgress()`、`useActiveEvents()`。 | GC-20 |
| GC-22 | 状态隔离与锁定 | `isProcessing` 状态下屏蔽所有玩家交互（除视角操控外）。在 UI 层通过 context 统一控制按钮 disabled 和模态拦截。 | GC-21 |

### 2.6 网络通信层

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-23 | HTTP 客户端 | 封装 `fetch` 或 `axios` 实例：baseURL 配置、统一超时（10s）、请求/响应拦截。POST /api/game/start 和 POST /api/action 两个核心端点。 | — |
| GC-24 | API 契约类型 | 根据 frontend_detail.md §11 定义请求/响应 TypeScript 类型：`ActionRequest`、`ActionResponse`、`StartGameResponse`、`EndGameResponse`。 | GC-19 |
| GC-25 | 错误处理 | 网络超时/失败 → 显示"连接中断"提示 → 1.5s 后强制返回大厅。后端返回业务错误（如 INSUFFICIENT_FUNDS）→ 显示红色横幅/提示，不关闭界面。 | GC-23 |

### 2.7 页面路由与游戏流程

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-26 | 路由配置 | React Router：`/login` → LoginScreen，`/lobby` → LobbyScreen，`/game` → GameScene。路由守卫：未登录无法访问 /game。简化方案：使用 state 切换代替路由（课程作业无需 URL 持久化）。 | — |
| GC-27 | 开局流程 | LobbyScreen 点击"开始游戏"→ 调用 `POST /api/game/start` → 获取初始完整 GameState → 初始化 PixiJS 星图 + HUD → 导航到 GameScene。 | GC-21, GC-23 |
| GC-28 | 结束流程 | 主动结束：TopHUD 点击"结束本局"→ 确认弹窗 → `POST /api/game/end` → 接收结算数据 → 显示 SettlementScreen。被动结束：收到 `game_status: 'WON'|'LOST'|'TIMEUP'` 的 patch → 自动弹出 SettlementScreen。 | GC-21, FA-20 |

### 2.8 世界回合与全局事件

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-29 | 世界回合推进表现 | patch 中 `world_turn_advanced: true` 时：上侧边栏行动点递减动画；若附带 `global_events` 变化，触发 WorldEventToast（如"⚠ 海盗封锁了航线"）。 | GC-21, FA-21 |
| GC-30 | 垄断进度更新 | patch 中 `monopoly_progress` 变化时，更新 BottomInfoBar 的 8 个迷你进度条。某商品达到 ≥80% 时触发绿色闪烁 + "垄断达成"横幅。 | GC-21, FA-24 |

### 2.9 开发者面板

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-31 | DevPanel 触发与数据 | 监听 `Ctrl+Shift+~` 组合键打开/关闭 DevPanel。收集最近 N 次 API 请求/响应的 SQL 语句流（后端需返回 debug 信息）。显示 GameState 快照。 | — |

### 2.10 性能与构建

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GC-32 | PixiJS 性能 | 节点离屏剔除：不在相机视口内的节点跳过渲染。ParticleContainer 用于星点/拖尾粒子。航道 Graphics 按需更新（仅 route 状态变化时重绘）。 | GC-02 |
| GC-33 | 构建优化 | Vite 代码分割：PixiJS 单独 chunk，懒加载 GameScene。Tree shaking MUI 图标。 | — |

---

## 三、FE-Art 任务清单（前端美术/UI）

> **职责**: 全部 2D 美术资源、UI 组件视觉实现、动画与特效、主题与全局样式。  
> **编号前缀**: `GA`（Game Art）

### 3.1 美术资源制作（美术资源先不做，仅列出）

| 编号 | 资源 | 规格 | 说明 |
|------|------|------|------|
| GA-01 | 飞船精灵图 | 3 帧 spritesheet（默认/加速/通缉态） | PixiJS AnimatedSprite |
| GA-02 | 空间站精灵图 ×3 | 球形/环形/菱形 PNG + 法线贴图 | 对应普通/枢纽/高危站点 |
| GA-03 | 商品图标 ×8 | 32×32 PNG | 8 种商品的交易界面/货舱图标 |
| GA-04 | 违禁品角标 | 16×16 PNG ×2 | 黄色警告 ⚠ + 红色锁定 ⛔ |
| GA-05 | 通缉等级图标 ×3 | 32×32 PNG | Lv1 监视眼/Lv2 调查锁/Lv3 扣留手铐 |
| GA-06 | 事件类型图标 ×3 | 48×48 PNG | 市场/航线/遭遇 |
| GA-07 | UI 图标组 | 24×24 PNG | 货币/货舱/行动点/时间/年份/结束/区域视图 |
| GA-08 | 星空背景 | 1920×1080 JPG | 深空蓝黑紫渐变+星云 |
| GA-09 | 面板纹理 | 可平铺 PNG | HUD 面板扫描线纹理 |
| GA-10 | 加载动画帧 | spritesheet | 嵌套正方形反向旋转 Loading |
| GA-11 | 胜利/失败插图 | 800×600 PNG | 星际帝国/废弃飞船/沙漏星系 |
| GA-12 | 粒子纹理 | 16×16 PNG | 飞行拖尾粒子/金币粒子/涟漪光环 |

### 3.2 主题与样式系统

| 编号 | 任务 | 详细说明 | 产出文件 |
|------|------|---------|---------|
| GA-13 | 色彩体系 | 更新 `theme/colors.ts`：背景 `#0a0f1e` / `#0d0b14`，主色 `#00d4ff`（科技蓝），辅色 `#05ffa1`（青绿），警告 `#ff9f1c`（黄橙），危险 `#ff2a6d`（玫红），文字 `#ffffff` / `#a0b0c0` / `#5a6a7a`。 | `theme/colors.ts` |
| GA-14 | MUI 主题 | 更新 `theme/theme.ts`：mode dark，修改 primary/secondary/error/warning/success 颜色为新色彩体系。字体：中文用 `Noto Sans SC`，英文数字用 `JetBrains Mono` 或 `Rajdhani`。标题用科技字重（600-700）。圆角统一 4px（鹰角式微圆角）。 | `theme/theme.ts` |
| GA-15 | 全局 CSS | 更新 `theme/global.css`：`--color-*` CSS 变量（与新色彩体系一致）、全局滚动条样式、`@keyframes` 基础动画库（fadeIn/slideUp/pulse/glow）、字体 @font-face 或 @import。 | `theme/global.css` |
| GA-16 | HUD 面板通用样式 | 定义 HUD 面板基类：半透明深色 bg `rgba(10,15,30,0.85)`、底部/顶部 1px 科技蓝发光边框（box-shadow）、内边距规范、字体大小阶梯。所有 HUD 组件共用此基类。 | `theme/global.css` |

### 3.3 页面级组件

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GA-17 | `LoginScreen` | 登录界面：居中登录卡片（昵称输入 + "进入游戏"按钮）。深色星空背景，简洁设计。不设复杂鉴权，仅为教学目的。 | GA-14 |
| GA-18 | `LobbyScreen` | 大厅界面：中央标题"星际货运垄断者"（Orbitron 大字）+ 3 个按钮（开始游戏 / 排行榜 / 退出）。排行榜为 modal 或侧出面板。 | GA-14 |
| GA-19 | `GameScene` | 游戏主场景容器：PixiJS Canvas 层（z=0）+ DOM HUD 层（z=10）+ DOM Modal 层（z=20）+ DOM Loading/Toast 层（z=30）。负责图层 z-index 管理和 isProcessing 锁定状态。**此组件由 FE-Core 主导结构，FE-Art 负责容器视觉**。 | GC-01, GA-16 |

### 3.4 HUD 层组件（驾驶舱叠加层）

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GA-20 | `TopHUD` | 上侧边栏：固定高度 64px，全宽。半透明背景+底部发光边框。从左到右：①资金（💰 + 等宽数字 + 变动跳动动画）②状态标签（自由探索/航行中/交易中/被扣留）③宇宙年份（装饰 `Y-2149`）④行动点进度条+剩余数字 ⑤结束按钮（红色科技风格，右上角）。Props 从 GameState 读取。 | GA-16, GC-21 |
| GA-21 | `RightCargoPanel` | 右侧货舱快捷栏：固定宽度 220px，从 TopHUD 下沿延伸至 BottomInfoBar 上沿。标题"货舱 CARGO 14/80"。垂直排列商品槽位（每个 60px 高）：有库存=图标+名称+数量+加权成本；空槽=虚线边框+"空仓"。违禁品显示黄色/红色角标。点击任意槽位 → 打开 WarehousePanel。 | GA-16 |
| GA-22 | `BottomInfoBar` | 下侧边栏：固定高度 110px，全宽。半透明背景+顶部发光边框。从左到右：①8 种商品垄断迷你进度条（横向排列，各含小图标+缩写+迷你进度条，颜色分段）②当前站点名（📍 格式）③鼠标悬停站点信息（动态更新）④"区域视图"按钮（左下角）。 | GA-16 |
| GA-23 | `RegionViewToggle` | 左下角按钮，点击切换星图为区域垄断染色视图（FE-Core 实现渲染，FE-Art 提供按钮样式+切换动画）。 | GA-22, GC-30 |

### 3.5 模态弹窗层组件

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| **GA-24** | `TradeModal` | **交易界面**（核心组件，frontend_detail.md §4.2）：<br>①**打开动画**：从屏幕底部 `translateY(100%)` 上滑至居中，耗时 300ms。<br>②**背景**：PixiJS Canvas 应用 CSS `filter: blur(8px)` + 暗化遮罩。<br>③**加载态**：鹰角式科技加载动画（GA-28）+ "正在连接贸易网络..."<br>④**正式界面**：宽度 960px 高度 640px，深色半透明面板 + 科技蓝边框 + 外发光。**左栏 60%**：本站商品市场（垂直列表，每卡片 88px：图标+名称+价格大字+库存+违禁品角标+锁定状态）。**右栏 40%**：飞船货舱（复用货舱快捷栏详细版）。<br>⑤**锁定商品**：灰显（grayscale 80% + opacity 50%）+ 🔒 图标。<br>⑥**价格变动**：原价格删除线 + 新价格彩色。<br>⑦**关闭**：点 ✕ 或点击遮罩 → 下移滑出。 | GA-03, GA-04, GA-16, GC-15 |
| **GA-25** | `MiniTradePanel` | **小交易详情**（点击商品卡片后弹出，frontend_detail.md §4.2 阶段C）：<br>覆盖在 TradeModal 上层居中。内容：①**上部**：价格趋势折线图（Canvas/SVG 迷你图，显示最近 N 次价格）②**中部**：相邻站点价格对比横条（3-4 个站点当前价）③**下部**：数量输入框（+/- 按钮）+ 买入/卖出 Switch + 预估总额实时计算。点击 "执行交易" 触发 GC-16。无二次确认弹窗。 | GA-24 |
| **GA-26** | `EncounterModal` | **遭遇事件模态**（frontend_detail.md §4.4）：<br>全屏居中模态，宽度 700px，高度自适应（min 400px）。科技风格抽象背景插画区（可用 CSS 渐变模拟）。标题+描述文本。选项按钮：全宽，标注机会成本（如"风险：+50 可疑度 | 收益：+20 单位违禁品"）。不可用选项灰显+原因标注。顶部/底部扫描线动画。选择后切换为结果页面（成功/失败图标+文本）→ 确认关闭。 | GA-06 |
| **GA-27** | `WarehousePanel` | **仓库管理面板**（frontend_detail.md §4.3）：<br>从右侧滑出宽面板（550px），动画 `translateX(100%)` → `translateX(0)` 300ms。左栏 50%：飞船货舱列表（图标/名称/数量/加权成本，底部容量 `14/80`）。右栏 50%：当前站点仓库（独立存储，显示数量+存放时间+预计取出税率）。操作：存入/取出按钮 + 数量输入。取出时显示税费扣除提示（`-120 CR`）。关闭：点 ✕ 或面板外 → 右滑收回。 | GA-21 |
| **GA-28** | `SettlementScreen` | **结算界面**（frontend_detail.md §5.2）：<br>全屏覆盖（z=500），纯黑或暗化背景。居中数据面板：标题"对局结算"+ 结果（胜利/破产/时间耗尽）+ 资金/垄断数/交易数/事件数 + 最终评分。评分数字滚动计数动画。底部单个"返回大厅"大按钮。 | GA-11 |

### 3.6 动画与特效组件

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GA-29 | `LoadingSpinner` | 鹰角网络式科技加载动画：两个嵌套正方形反向旋转 + 脉冲文字"正在连接贸易网络..."。纯 CSS 实现。用于 TradeModal 加载态和开局加载。 | — |
| GA-30 | `AnimatedNumber` | 数字滚动计数组件（FA-32）：传入 target value → 数字从当前值滚动到目标值，使用 `requestAnimationFrame` + ease-out 缓动。支持格式化（千分位）+ prefix/suffix（如 "💰 "）。用于资金、行动点、价格显示。 | — |
| GA-31 | `TradeParticles` | 金币飞散粒子（FA-29）：传入锚点 DOM 元素 → 在锚点位置生成 20-30 个金色粒子，向四周爆散（CSS 或 PixiJS overlay），持续 1s 自动清理。交易成功时触发。 | — |
| GA-32 | `ScreenFlash` | 全屏事件闪烁特效（FA-30 + FA-31）：<br>4 种模式：①`encounter` 红色边缘闪烁×3（300ms/次）②`market` 金色边框流动（1500ms）③`route` 蓝色中心脉冲×2 ④`warp_arrival` 青白色中心扩散。通过绝对定位覆盖全屏，pointer-events: none，自动移除。 | — |
| GA-33 | `ShipTrail` | 飞船拖尾粒子效果（FA-30）：跟随 PixiJS 飞船 sprite 生成渐隐的拖尾粒子。粒子沿航道方向喷射，颜色从青色渐变到透明。通过 PixiJS ParticleContainer 实现。与 GC-12 飞行动画配合。 | GC-12 |
| GA-34 | `RippleEffect` | 涟漪脉冲动画（FA-33）：接收到 `ripple_affected_stations` 数据后，在对应星图节点位置渲染 3-4 个扩散同心圆光环。纯 CSS 动画（border + scale + opacity），定位在 PixiJS 上层 DOM overlay。级联延迟：按 hop 距离递增延迟（200ms/hop）。 | GC-16 |
| GA-35 | `WorldEventToast` | 世界事件边缘通知条：从屏幕顶部滑入（非 TopHUD 区域，可放在 TopHUD 下方临时条）。显示事件图标+文字（如"⚠ 海盗封锁了阿尔法-贝塔航线"）。3 秒后自动滑出。颜色根据事件类型：封锁=红，市场冲击=橙，新航线=蓝。 | — |

### 3.7 开发者面板

| 编号 | 任务 | 详细说明 | 依赖 |
|------|------|---------|------|
| GA-36 | `DevPanel` UI | 左侧滑出宽面板（600px），等宽字体（JetBrains Mono）展示数据。分区：①SQL 语句流（最近 10 条，带时间戳）②事务可视化（BEGIN→操作→COMMIT 动画流程图）③涟漪回溯路径（文字列表+星图高亮联动）④关键表快照。科技蓝高亮关键字。关闭按钮 `X`。 | GC-31 |

---

## 四、两角色协作接口

### 4.1 协作点清单

| 协作场景 | FE-Core 提供 | FE-Art 提供 | 对接方式 |
|---------|-------------|------------|---------|
| 星图节点图标 | 渲染坐标 (x, y) + 交互回调 (onClick, onHover) | 空间站精灵图 PNG（GA-02）+ 尺寸规范 | FC import 常量路径 |
| 飞船动画 | Canvas 动画循环 + 贝塞尔插值逻辑 (GC-12) | 飞船 spritesheet（GA-01）+ 拖尾粒子纹理（GA-12） | FC 调用 PixiJS AnimatedSprite |
| 商品展示 | GameState 数据 + 交易逻辑 (GC-15/16) | 商品图标（GA-03）+ 违禁品角标（GA-04）+ TradeModal 视觉 | 组件 Props 接口 |
| 主题变量 | 在 TSX 中使用 MUI theme 的 sx/className | theme.ts + colors.ts + global.css | MUI ThemeProvider |
| 事件弹窗 | 事件数据 + API 调用 (GC-13) | EncounterModal 视觉 + 选项按钮动效 (GA-26) | 组件 Props 接口 |
| 特效触发 | 行动执行后 emit 特效事件 (如 ripple_affected_stations) | 特效组件注册为监听器或接受 Props | 事件总线或 Props |
| HUD 数据流 | GameState patch 后 dispatch 更新 | HUD 组件订阅 gameState 并渲染 + 动画 | useGameState hook |
| 锁定状态 | 设置 `isProcessing` flag | 所有 UI 组件根据 flag 切换 disabled 态 | React Context |
| 开发者面板 | 组合键监听 + 数据收集 (GC-31) | DevPanel UI (GA-36) | Props 接口 |

### 4.2 核心 Props 接口约定

```typescript
// ---- FE-Core 传给 FE-Art 的核心接口 ----

// TopHUD
interface TopHUDProps {
  credits: number;
  previousCredits: number;  // 用于跳动动画方向
  status: 'EXPLORING' | 'TRAVELING' | 'TRADING' | 'DETAINED';
  galacticYear: number;
  actionPoints: number;
  maxActionPoints: number;
  onEndGame: () => void;
  disabled: boolean;  // isProcessing
}

// TradeModal
interface TradeModalProps {
  open: boolean;
  stationGoods: GoodsCard[];  // 所有本站商品
  cargoItems: CargoSlot[];    // 当前货舱
  onSelectGoods: (goodsId: number) => void;
  onClose: () => void;
  isLoading: boolean;
}

// MiniTradePanel  
interface MiniTradePanelProps {
  goodsId: number;
  goodsName: string;
  currentPrice: number;
  previousPrice?: number;     // 有变动时显示删除线
  priceHistory: number[];     // 趋势图数据
  adjacentPrices: AdjacentPrice[];  // 相邻站点比价
  stock: number;
  isContraband: boolean;
  isLocked: boolean;
  lockReason?: string;
  cargoQuantity: number;      // 玩家持有该商品数量
  maxBuy: number;
  maxSell: number;
  onExecute: (qty: number, type: 'buy' | 'sell') => void;
  isSubmitting: boolean;
}

// EncounterModal
interface EncounterModalProps {
  open: boolean;
  title: string;
  description: string;
  choices: EncounterChoice[];
  result?: { success: boolean; message: string };
  onChoose: (choiceId: number) => void;
  onConfirm: () => void;
}

// SettlementScreen
interface SettlementScreenProps {
  open: boolean;
  result: 'WON' | 'LOST' | 'TIMEUP';
  breakdown: ScoreBreakdown;
  onBackToLobby: () => void;
}

// GameScene (FE-Art 提供容器视觉)
interface GameSceneLayout {
  pixiCanvas: React.RefObject<HTMLDivElement>;  // PixiJS 挂载点
  topHUD: React.ReactNode;
  rightCargo: React.ReactNode;
  bottomInfo: React.ReactNode;
  activeModal: React.ReactNode;
  toasts: React.ReactNode;
}
```

---

## 五、开发里程碑（更新版）

| 阶段 | 截止时间 | FE-Core 验收标准 | FE-Art 验收标准 |
|------|---------|-----------------|----------------|
| **迭代1: 基础闭环** | 第2周末 | PixiJS 星图渲染 20 节点+航道、WASD/滚轮操控、GameState 类型+patchReducer、POST /api/action 通路 | 主题系统（新色彩体系+MUI）、TopHUD+BottomInfoBar+RightCargoPanel 静态视觉、AnimatedNumber |
| **迭代2: 核心交互** | 第4周末 | 移动完整流程（A→B→C+飞行动画+遭遇判定）、交易流程（打开→选择→执行→结果）、仓库存取流程 | TradeModal+MiniTradePanel+EncounterModal+WarehousePanel 完整视觉、LoadingSpinner、ScreenFlash、TradeParticles |
| **迭代3: 增强体验** | 第5周末 | 世界回合推进、垄断判定 UI 联动、区域视图、DevPanel 数据管线、构建优化 | SettlementScreen 视觉、WorldEventToast、ShipTrail+RippleEffect 特效、DevPanel UI |
| **迭代4: 教学演示** | 第6周末 | 全流程联调、断线/异常处理完善、最终集成测试 | 全部美术资源到位（GA-01~12）、加载画面、LoginScreen+LobbyScreen 视觉 |

---

## 六、与现有代码的关系

### 6.1 现有代码迁移计划

| 现有文件 | 迁移目标 | 负责 |
|---------|---------|------|
| `src/canvas/StarMap.tsx` | → `src/engine/StarMap.ts` (PixiJS 重写) | FE-Core |
| `src/store/*.ts` | → `src/state/*.ts` (重构为 GameState + patchReducer) | FE-Core |
| `src/api/*.ts` | → `src/api/*.ts` (更新为 /api/action 接口) | FE-Core |
| `src/components/TradeForm.tsx` | → `src/modals/TradeModal.tsx` (重构为模态) | FE-Art |
| `src/components/PlayerPanel.tsx` | → 拆分到 `src/hud/TopHUD.tsx` + `src/hud/RightCargoPanel.tsx` | FE-Art |
| `src/components/TransactionLog.tsx` | → 移除（功能合并到 TopHUD 状态+WorldEventToast） | FE-Art |
| `src/components/EventModal.tsx` | → `src/modals/EncounterModal.tsx` (重构) | FE-Art |
| `src/components/WarehousePanel.tsx` | → `src/modals/WarehousePanel.tsx` (重构为滑出面板) | FE-Art |
| `src/components/SettlementScreen.tsx` | → `src/modals/SettlementScreen.tsx` (重构) | FE-Art |
| `src/components/WantedBadge.tsx` | → 保留，集成到 TopHUD 或 RightCargoPanel | FE-Art |
| `src/components/ToastNotification.tsx` | → `src/fx/WorldEventToast.ts` (重构) | FE-Art |
| `src/components/PriceTag.tsx` | → `src/fx/PriceTag.ts` (重构) | FE-Art |
| `src/pages/MainPage.tsx` | → `src/pages/GameScene.tsx` (重构为四分区容器) | FE-Core |
| `src/pages/SettlementScreen.tsx` | → `src/modals/SettlementScreen.tsx` | FE-Art |
| `src/theme.ts` | → `src/theme/theme.ts` (更新色彩) | FE-Art |
| `src/index.css` | → `src/theme/global.css` | FE-Art |
| `src/main.tsx` | → 保留，更新引用路径 | FE-Core |
| `src/App.tsx` | → 重构路由为 Login→Lobby→Game 三层 | FE-Core |

### 6.2 FE-Art 已实现组件的对照

FE-Art 在前四个阶段已完成的组件，需要按新设计调整：

| 已实现 | 新设计对应 | 调整幅度 |
|--------|-----------|---------|
| `theme.ts` | `theme/theme.ts` | 需更新色彩为 #00d4ff / #05ffa1 体系 |
| `index.css` | `theme/global.css` | 需新增 HUD 面板基类、字体改为 JetBrains Mono |
| `TradeForm.tsx` | 拆入 TradeModal + MiniTradePanel | 大幅重构（侧栏表单 → 居中模态） |
| `PlayerPanel.tsx` | 拆入 TopHUD + RightCargoPanel | 大幅重构（单面板 → HUD 栏） |
| `TransactionLog.tsx` | 功能移入 TopHUD + WorldEventToast | 移除独立组件 |
| `EventModal.tsx` | `EncounterModal.tsx` | 中幅重构（增加风险/收益标注+扫描线） |
| `WarehousePanel.tsx` | `modals/WarehousePanel.tsx` | 中幅重构（侧滑+双栏+税率计算） |
| `SettlementScreen.tsx` | `modals/SettlementScreen.tsx` | 小幅调整 |
| `AnimatedNumber.tsx` | `fx/AnimatedNumber.ts` | 基本保留 |
| `TradeParticles.tsx` | `fx/TradeParticles.ts` | 基本保留 |
| `ScreenFlash.tsx` | `fx/ScreenFlash.ts` | 基本保留 |
| `RippleRing.tsx` | `fx/RippleEffect.ts` | 小幅调整 |
| `WantedBadge.tsx` | 保留到 hud/ | 基本保留 |
| `ToastNotification.tsx` | 重构为 WorldEventToast | 中幅重构 |
| `PriceTag.tsx` | 保留到 fx/ | 基本保留 |

---

## 七、任务计数统计

| 角色 | 任务数量 | P0 核心阻塞 | P1 重要功能 | P2 增强体验 |
|------|---------|------------|-----------|-----------|
| **FE-Core** | 33 (GC-01~33) | 14 | 12 | 7 |
| **FE-Art** | 24 (GA-13~36) + 12 美术资源 | 6 | 10 | 8 |

---

*本文档基于 frontend_detail.md v1.0 的完整游戏设计，将前端工作拆分为 57 项可执行任务，明确了每项任务的详细描述、依赖关系和交付物。FE-Core 和 FE-Art 可据此独立并行开发，通过 §4 协作接口对齐。*

# 星际贸易模拟游戏 - 前端框架说明

## 项目概述
本前端项目用于呈现《星际贸易模拟游戏》的用户界面，包括：
- 星际地图展示（Canvas/WebGL）
- 玩家资产面板、交易操作界面（DOM/React）
- 事件通知和决策弹窗
- 交易日志与通缉状态实时显示

前端通过 HTTP API 与后端通信提交操作请求，同时通过轮询或 WebSocket 获取实时价格、事件与通缉状态。

## 技术栈
- **语言**：JavaScript / TypeScript
- **框架**：React 18+
- **状态管理**：Redux 或 Zustand
- **UI 组件**：TailwindCSS 或 MUI
- **渲染**：Canvas / WebGL
- **网络通信**：Axios（HTTP）、WebSocket（可选）

## 项目结构
    /frontend
    │
    ├─ /public # 静态资源
    ├─ /src
    │ ├─ /components # UI组件（面板、弹窗、表格）
    │ ├─ /pages # 页面级组件（主界面、交易页）
    │ ├─ /canvas # Canvas/WebGL星图与动画逻辑
    │ ├─ /api # HTTP/WebSocket接口封装
    │ ├─ /store # Redux/Zustand 状态管理
    │ └─ /utils # 工具函数（时间格式化、随机数等）
    ├─ package.json
    └─ vite.config.js # 打包配置


## 开发要求
1. **可扩展性**：
   - UI组件必须独立、可复用
   - Canvas 渲染逻辑与 DOM 界面分离
   - API 接口封装成统一模块
2. **代码逻辑正确性**：
   - 交易、移动、事件决策必须遵守业务规则
   - 前端仅做状态渲染，不执行核心经济逻辑
3. **简洁性与可读性**：
   - 遵循 ESLint 和 Prettier 规范
   - 使用 TypeScript 类型定义接口和状态
4. **性能优化**：
   - Canvas渲染采用 requestAnimationFrame
   - 大量数据展示使用虚拟列表或分页

## 开发任务示例
- 初始化 React 项目 + TypeScript
- 搭建 Redux 状态管理
- 封装 API 调用模块（HTTP/WebSocket）
- 创建 Canvas 星图组件
- 创建资产面板、交易表单、事件弹窗组件
- 页面路由管理
- Mock 数据渲染测试界面
# ShopMall Admin

> 基于 React 19 + MUI + Zustand + TypeScript 构建的电商后台管理系统前端。

---

## 技术栈

| 类别 | 框架 / 库 | 版本 |
|------|---------|-----|
| 核心框架 | [React](https://react.dev) | 19.2.4 |
| 语言 | [TypeScript](https://www.typescriptlang.org) | 6.0.2 |
| 构建工具 | [Vite](https://vitejs.dev) | 8.0.4 |
| UI 组件库 | [MUI (Material-UI)](https://mui.com) | 9.0.0 |
| 树形组件 | @mui/x-tree-view | 9.0.2 |
| 状态管理 | [Zustand](https://zustand-demo.pmnd.rs) | 5.0.12 |
| 路由 | [react-router-dom](https://reactrouter.com) | 7.14.1 |
| HTTP 客户端 | [axios](https://axios-http.com) | 1.15.0 |
| 大整数处理 | [json-bigint](https://www.npmjs.com/package/json-bigint) | 1.0.0 |

---

## 框架选型亮点

### 🖥️ React 19 + TypeScript —— 类型安全的前端核心

使用 React 19 搭配 TypeScript 6 打造类型安全的前端应用：

- **React 19 新特性**：支持 `use` API 简化异步数据读取，改进的批量更新策略减少不必要的重渲染
- **TypeScript 6 类型推导**：全项目无 `any` 类型，接口响应、DTO、状态类型均有完整类型定义，开发时 IDE 自动补全，运行时零类型开销
- **Vite 8 极速开发体验**：基于 ESM 的 HMR，开发环境秒级热更新，生产构建使用 Rollup 智能分包

---

### 🎨 MUI v9 —— Material Design 3 实现

MUI（Material-UI）是 React 生态最成熟的组件库，提供开箱即用的企业级 UI：

- **Material Design 3 规范**：遵循 MD3 设计语言，组件外观现代、专业，适合电商管理后台
- **主题系统深度定制**：覆盖色彩系统、圆角、阴影、间距全部 token，支持亮/暗模式切换（项目未来可扩展）
- **丰富组件生态**：表格、树形、弹窗、表单控件、导航栏、侧边栏、卡片等，无需重复造轮子
- **TreeView 树形组件**：用于商品三级分类展示，支持展开/收起、节点操作按钮，行级 hover 效果流畅

---

### 📦 Zustand v5 —— 轻量级状态管理

Zustand 是 React 状态管理库中体积极小（压缩后 < 1KB）但功能完备的代表：

- **去中心化 Store**：每个 Store 独立定义，无需嵌套 Provider 树，组件按需订阅，`useStore(state => state.xxx)` 直取所需字段，最大限度减少不必要的重渲染
- **中间件扩展**：内置 `persist`（持久化到 localStorage）、`devtools`、`subscribeWithSelector` 等中间件
- **比 Redux 少 10x 代码量**：无需 Action/Reducer/Dispatch 样板，直接 `set({ ... })` 更新状态

---

### 🔀 react-router-dom v7 —— 嵌套路由与权限守卫

项目使用 React Router v7 管理前端路由：

- **嵌套路由（Outlet）**：Layout 组件作为父路由，子页面作为子路由，sidebar + content 布局天然解耦
- **权限守卫（RequireAuth）**：未登录访问受保护路由时自动重定向到 `/login`，登录成功后回跳原始页面，体验流畅
- **Vite 懒加载**：`React.lazy()` + `Suspense` 按需加载各页面模块，首屏只加载必要 JS，减少白屏时间

---

### 🌐 axios + json-bigint —— HTTP 层

封装统一请求层，处理所有后端 API 通信：

- **请求拦截器**：自动在 `Authorization` header 附加 `Bearer {token}`，无需在每个接口手动注入
- **响应拦截器**：统一处理 401 未授权（跳转登录页），格式化错误提示；其余状态码透传给调用方
- **json-bigint 大整数处理**：后端雪花算法生成的 64 位品牌 ID（> 2^53）在 JSON 解析时会丢失精度，`json-bigint` 自动将大整数转为字符串，完整保留精度，不出现显示为 `1.2345678901234e+15` 的 Bug
- **Vite 代理配置**：开发环境 `/api` 前缀自动代理到 `http://localhost:7000`，规避跨域问题

---

### 🛡️ 前端安全与权限码

基于后端 RBAC 权限码实现按钮级显隐控制：

- 用户登录后，服务端返回其拥有的所有权限码列表（如 `["product:brand:list", "product:brand:add"]`）
- 前端按钮组件接收权限码 `code` prop，内部判断是否在权限码列表中，不在则 `display: none`
- 配合后端接口层的权限校验，即使前端隐藏了按钮，直接调用 API 仍会被拦截，双重保险

---

## 页面与功能模块

| 页面 | 路由 | 功能描述 |
|------|------|----------|
| **登录** | `/login` | 用户名密码登录，JWT Token 持久化到 localStorage |
| **首页仪表盘** | `/` | 数据概览（后续可扩展统计图表） |
| **品牌管理** | `/product/brand` | 品牌列表（分页、搜索、增删改），支持品牌-分类关联配置 |
| **商品分类** | `/product/category` | 三级分类树形展示，父子节点增删改（TreeView） |
| **用户管理** | `/system/users` | 用户 CRUD，数据范围过滤（本部门/本人/全部） |
| **角色管理** | `/system/roles` | 角色 CRUD，分配菜单权限，分配数据权限范围 |
| **菜单管理** | `/system/menus` | 菜单树增删改，含路由路径、权限码、图标、排序 |
| **权限管理** | `/system/permissions` | 按钮级权限码展示，与菜单/角色联动 |

布局采用 **侧边栏（可折叠）+ 顶部栏** 结构，菜单根据用户角色动态渲染，无权限菜单对用户不可见。

---

## 项目架构

```
shopmall-admin/
├── src/
│   ├── api/                     # API 层（user / product / rbac / request）
│   ├── assets/                  # 静态资源
│   ├── components/
│   │   ├── Layout/              # 侧边栏 + 顶部栏布局组件
│   │   └── ...                  # 其他公共组件
│   ├── pages/
│   │   ├── Login/               # 登录页
│   │   ├── Dashboard/           # 首页仪表盘
│   │   ├── Product/             # 品牌管理
│   │   ├── ProductCategory/     # 商品分类（树形）
│   │   ├── Users/               # 用户管理
│   │   ├── Role/                # 角色管理
│   │   ├── Menu/                # 菜单管理
│   │   └── Permission/          # 权限管理
│   ├── router/                  # 路由守卫（RequireAuth）
│   ├── store/                   # Zustand Store
│   ├── types/                   # TypeScript 类型定义
│   ├── App.tsx                  # 根组件
│   └── main.tsx                 # 入口文件
├── index.html
├── vite.config.ts               # Vite 配置（含 /api 代理 → localhost:7000）
├── tsconfig.json
└── package.json
```

---

## 请求链路

```
用户打开应用
  └─► RequireAuth 路由守卫检查 localStorage 中的 token
        ├─► 无 token → 重定向到 /login
        └─► 有 token
              ├─► token 写入 axios 请求头 Authorization: Bearer {token}
              └─► API 请求
                    ├─► 200 → 数据展示
                    ├─► 401 → 响应拦截器捕获，跳转 /login
                    └─► 403/500 → Toast 提示错误信息
```

---

## 快速开始

### 环境要求

- Node.js 18+
- 后端服务运行在 `localhost:7000`

### 安装与运行

```bash
cd shopmall-admin

# 安装依赖
npm install

# 开发模式启动（Vite 自动代理 /api → localhost:7000）
npm run dev
# 访问 http://localhost:5173
```

登录页访问 `http://localhost:5173/login`，输入后端已注册的用户名密码即可进入后台。

---

## License

MIT

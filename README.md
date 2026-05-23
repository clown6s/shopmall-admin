# ShopMall Admin

ShopMall 后台管理系统的前端项目，基于 React 19 + TypeScript + MUI 9 + Zustand 5 构建。

这是 [shopmall](../shopmall) 后端的前端配套项目。

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 核心框架 | [React](https://react.dev) | 19 |
| 语言 | [TypeScript](https://www.typescriptlang.org) | 6 |
| 构建工具 | [Vite](https://vitejs.dev) | 8 |
| UI 组件库 | [MUI](https://mui.com) | 9 |
| 状态管理 | [Zustand](https://zustand-demo.pmnd.rs) | 5 |
| 路由 | [react-router-dom](https://reactrouter.com) | 7 |
| HTTP 客户端 | [axios](https://axios-http.com) | 1.16 |
| 大整数处理 | [json-bigint](https://www.npmjs.com/package/json-bigint) | 1.0 |

---

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 登录 | `/login` | 手机号 + 密码登录，CSRF 保护 |
| 首页 | `/` | 数据概览仪表盘 |
| 品牌管理 | `/product/brand` | 品牌列表、搜索、增删改 |
| 商品分类 | `/product/category` | 三级分类树形展示与编辑 |
| 员工管理 | `/system/employee` | 员工 CRUD、部门归属 |
| 部门管理 | `/system/department` | 部门树 CRUD |
| 角色管理 | `/system/role` | 角色 CRUD、菜单权限分配 |
| 菜单管理 | `/system/menu` | 菜单树 CRUD、路由与图标配置 |
| 权限管理 | `/system/permission` | 权限码 CRUD、与菜单角色联动 |

布局采用**可折叠侧边栏 + 顶部栏**结构，菜单根据用户角色动态渲染。

---

## 认证与安全

Token 全部由后端通过 **httpOnly Cookie** 管理，前端不接触 Token 原文。

### 登录流程

```
访问系统 → 路由守卫检查登录状态
  ├─ 未登录 → GET /api/csrf/token 获取初始 CSRF Cookie
  │           → 显示登录页，输入手机号密码
  │           → POST /api/employee/login（携带 CSRF Token）
  │           → 后端设置 auth_token + refresh_token Cookie
  │
  └─ 已登录 → 调用 /api/user/me 验证会话
        ├─ 200 → 进入系统
        └─ 401 → 尝试 Refresh Token 续期
              ├─ 成功 → 重试原请求（无感刷新）
              └─ 失败 → 跳转登录页
```

### 安全措施

| 措施 | 说明 |
|------|------|
| CSRF 防护 | 生产环境写操作缺 Token 直接拦截，开发环境仅警告 |
| Token 自动刷新 | 401 响应自动触发 Refresh Token，并发请求队列化 |
| 按钮级权限 | 根据后端返回的权限码列表控制按钮显隐 |
| ErrorBoundary | 全局错误边界 + window.onerror + unhandledrejection |
| 生产构建 | sourcemap 关闭、console 全部剥离 |
| 代码分割 | react / MUI / axios+zustand 分 chunk 加载 |
| 大整数安全 | json-bigint 处理雪花 ID，避免 JavaScript 精度丢失 |

---

## 项目结构

```
shopmall-admin/
├── src/
│   ├── api/                 # Axios 封装 + CSRF 拦截 + Token 刷新
│   ├── assets/              # 静态资源（图标、样式）
│   ├── components/
│   │   └── Layout/          # 侧边栏 + 顶部栏 + 内容区布局
│   ├── pages/               # 各功能页面
│   │   ├── Login/           # 登录页
│   │   ├── Dashboard/       # 首页仪表盘
│   │   ├── Product/         # 品牌管理
│   │   ├── ProductCategory/ # 商品分类（树形）
│   │   ├── Department/      # 部门管理
│   │   ├── Employee/        # 员工管理
│   │   ├── Role/            # 角色管理（含权限分配弹窗）
│   │   ├── Menu/            # 菜单管理（树形）
│   │   └── Permission/      # 权限管理
│   ├── router/              # 路由配置 + RequireAuth 权限守卫
│   ├── store/               # Zustand 状态管理（用户、菜单、权限）
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数（表单校验等）
│   ├── App.tsx
│   └── main.tsx             # 入口（ErrorBoundary 包裹）
├── index.html
├── vite.config.ts           # Vite 配置（/api 代理 → localhost:7000）
├── tsconfig.json
├── eslint.config.js
└── package.json
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

# 开发模式（Vite 自动代理 /api → localhost:7000）
npm run dev

# 访问 http://localhost:5173
```

### 构建

```bash
npm run build
# 产物在 dist/ 目录
```
docker-compose up -d --build web
---

## License

MIT

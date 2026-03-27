# Vue Vben Admin 项目工程分析报告

**生成时间**: 2026-03-26
**项目版本**: 5.7.0
**分支**: v1.0

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [项目架构](#3-项目架构)
4. [核心模块详解](#4-核心模块详解)
5. [目录结构](#5-目录结构)
6. [开发规范](#6-开发规范)
7. [构建与部署](#7-构建与部署)
8. [扩展开发指南](#8-扩展开发指南)

---

## 1. 项目概述

### 1.1 项目简介

Vue Vben Admin 是一个免费开源的中后台前端模板，使用最新的 Vue 3、Vite、TypeScript 等主流技术开发，开箱即用，也可用于学习参考。

**项目特点**:
- 🚀 **最新技术栈**: 基于 Vue 3.5 + Vite 8 + TypeScript 5.9
- 📦 **Monorepo 架构**: 使用 pnpm workspace + Turbo 实现多包管理
- 🎨 **多主题支持**: 一套代码支持 Ant Design Vue、Element Plus、Naive UI、TDesign 等多种 UI 库
- 🔐 **权限系统**: 内置基于动态路由的权限管理方案
- 🌍 **国际化**: 完善的国际化支持
- 📱 **响应式**: 支持多种屏幕尺寸

### 1.2 仓库信息

- **GitHub**: https://github.com/vbenjs/vue-vben-admin
- **在线预览**: https://vben.pro/
- **文档**: https://doc.vben.pro/
- **测试账号**: vben/123456

---

## 2. 技术栈

### 2.1 核心技术

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.30 | 渐进式 JavaScript 框架 |
| Vite | 8.0.1 | 下一代前端构建工具 |
| TypeScript | 5.9.3 | 类型安全的 JavaScript 超集 |
| Vue Router | 5.0.4 | Vue 官方路由 |
| Pinia | 3.0.4 | Vue 3 专属状态管理库 |

### 2.2 UI 组件库

| UI 库 | 版本 | 应用 |
|-------|------|------|
| Ant Design Vue | 4.2.6 | apps/web-antd |
| Element Plus | 2.13.6 | apps/web-ele |
| Naive UI | 2.44.1 | apps/web-naive |
| TDesign Vue Next | 1.18.5 | apps/web-tdesign |

### 2.3 常用库

| 库 | 版本 | 用途 |
|-----|------|------|
| Axios | 1.13.6 | HTTP 客户端 |
| VueUse | 14.2.1 | Vue 组合式 API 工具集 |
| Day.js | 1.11.20 | 日期处理库 |
| Lodash-es | 4.17.21 | JavaScript 工具库 |
| Zod | 3.25.76 | TypeScript Schema 验证 |
| ECharts | 6.0.0 | 可视化图表库 |
| Ant Design Vue | 4.2.6 | 企业级 UI 组件库 |
| VXE Table | 4.18.8 | 数据表格组件 |

### 2.4 构建工具

| 工具 | 版本 | 用途 |
|------|------|------|
| Turbo | 2.8.20 | Monorepo 构建系统 |
| pnpm | 10.32.1 | 快速、节省空间的包管理器 |
| Tailwind CSS | 4.2.2 | 原子化 CSS 框架 |
| ESLint | 10.1.0 | 代码检查 |
| Stylelint | 17.5.0 | 样式检查 |

### 2.5 国际化

| 库 | 版本 |
|-----|------|
| Vue I18n | 11.3.0 |
| @intlify/core-base | 11.3.0 |

### 2.6 环境要求

- **Node.js**: ^20.19.0 || ^22.18.0 || ^24.0.0
- **pnpm**: >= 10.0.0

---

## 3. 项目架构

### 3.1 Monorepo 架构

项目采用 Monorepo 架构，使用 pnpm workspace 进行包管理，主要优势：

- **代码共享**: 公共逻辑在 packages 中维护，避免重复代码
- **版本管理**: 统一的版本控制和发布流程
- **独立开发**: 每个应用可以独立开发和构建
- **按需加载**: 只打包应用中实际使用的模块

### 3.2 工作空间配置

```yaml
# pnpm-workspace.yaml
packages:
  - internal/*
  - internal/lint-configs/*
  - packages/*
  - packages/@core/base/*
  - packages/@core/ui-kit/*
  - packages/@core/forward/*
  - packages/@core/*
  - packages/effects/*
  - packages/business/*
  - apps/*
  - scripts/*
  - docs
  - playground
```

### 3.3 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Vue Vben Admin                              │
├─────────────────────────────────────────────────────────────────────┤
│  apps/ (应用层)                                                      │
│  ├── web-antd      (Ant Design Vue 版本)                             │
│  ├── web-ele       (Element Plus 版本)                               │
│  ├── web-naive     (Naive UI 版本)                                   │
│  ├── web-tdesign   (TDesign 版本)                                    │
│  ├── backend-mock  (Nitro Mock 后端服务)                             │
│  └── playground    (演示沙盒)                                        │
├─────────────────────────────────────────────────────────────────────┤
│  packages/ (业务包层)                                                 │
│  ├── @core/        (核心基础包)                                      │
│  ├── effects/      (副作用模块)                                      │
│  │   ├── access/   (权限管理)                                        │
│  │   ├── common-ui/(通用 UI 组件)                                    │
│  │   ├── hooks/    (业务 Hooks)                                      │
│  │   ├── layouts/  (布局组件)                                        │
│  │   ├── plugins/  (插件)                                            │
│  │   └── request/  (HTTP 请求封装)                                   │
│  ├── stores/       (Pinia 状态管理)                                  │
│  ├── locales/      (国际化模块)                                      │
│  ├── constants/    (常量定义)                                        │
│  ├── styles/       (全局样式)                                        │
│  ├── types/        (TypeScript 类型定义)                             │
│  └── utils/        (工具函数)                                        │
├─────────────────────────────────────────────────────────────────────┤
│  internal/ (内部配置层)                                               │
│  ├── lint-configs/   (Lint 配置)                                     │
│  ├── node-utils/     (Node 工具)                                     │
│  ├── tailwind-config/(Tailwind CSS 配置)                             │
│  ├── tsconfig/       (TypeScript 配置)                               │
│  └── vite-config/    (Vite 配置)                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. 核心模块详解

### 4.1 应用启动流程

```
main.ts
├── 初始化偏好设置 (initPreferences)
│   ├── 配置 namespace (用于区分存储 key)
│   └── 加载 overrides 配置
│
└── bootstrap.ts
    ├── 初始化组件适配器 (initComponentAdapter)
    ├── 初始化表单组件 (initSetupVbenForm)
    ├── 创建 Vue 应用 (createApp)
    ├── 注册全局指令
    │   ├── v-loading (加载指令)
    │   └── v-access (权限指令)
    ├── 配置国际化 (setupI18n)
    ├── 初始化 Pinia Store (initStores)
    ├── 配置路由 (app.use(router))
    └── 挂载应用 (app.mount('#app'))
```

### 4.2 权限管理系统

#### 4.2.1 权限模式

系统支持三种权限模式：

| 模式 | 说明 |
|------|------|
| frontend | 前端模式：基于前端配置的路由和角色生成权限 |
| backend | 后端模式：从后端动态获取菜单和路由 |
| mixed | 混合模式：前后端路由合并 |

#### 4.2.2 权限状态 (AccessState)

```typescript
interface AccessState {
  accessCodes: string[];        // 权限码列表
  accessMenus: MenuRecordRaw[]; // 可访问的菜单
  accessRoutes: RouteRecordRaw[]; // 可访问的路由
  accessToken: string | null;   // 登录令牌
  refreshToken: string | null;  // 刷新令牌
  isAccessChecked: boolean;     // 是否已检查权限
  isLockScreen: boolean;        // 是否锁屏
  lockScreenPassword?: string;  // 锁屏密码
  loginExpired: boolean;        // 登录是否过期
}
```

#### 4.2.3 路由守卫流程

```
router.beforeEach
├── setupCommonGuard (通用守卫)
│   ├── 页面加载进度条
│   └── 记录已加载页面
│
└── setupAccessGuard (权限守卫)
    ├── 检查是否为核心路由 (无需权限)
    ├── 检查 accessToken
    │   ├── 无 token → 跳转登录页
    │   └── 有 token → 继续
    │
    └── 生成动态路由
        ├── 获取用户信息 (roles/permissions)
        ├── generateAccess() 生成可访问菜单和路由
        ├── 保存到 accessStore
        └── 动态添加到 router
```

#### 4.2.4 权限指令

```vue
<!-- 按钮级权限控制 -->
<button v-access="'system:user:add'">新增用户</button>

<!-- 基于角色的权限 -->
<button v-access="{ role: 'admin' }">管理员操作</button>
```

### 4.3 请求封装模块

#### 4.3.1 RequestClient 类

位于 `packages/effects/request/src/request-client/request-client.ts`

**核心功能**:
- Axios 实例封装
- 请求/响应拦截器
- 文件上传/下载
- SSE (服务器发送事件)
- 参数序列化

#### 4.3.2 请求拦截器

```typescript
client.addRequestInterceptor({
  fulfilled: (config) => {
    // 1. 添加 Authorization header
    config.headers.Authorization = `Bearer ${accessToken}`;

    // 2. 设置语言 header
    config.headers['Accept-Language'] = locale;
    config.headers['Content-Language'] = locale;

    // 3. 添加 ClientID
    config.headers.ClientID = clientId;

    // 4. 参数序列化 (GET/DELETE)
    if (['GET', 'DELETE'].includes(method)) {
      config.paramsSerializer = stringify(params, { arrayFormat: 'repeat' });
    }

    // 5. 请求加密 (如启用)
    if (enableEncrypt && encrypt && ['POST', 'PUT'].includes(method)) {
      // RSA/SM2 非对称加密 key
      // AES/SM4 对称加密数据
    }

    return config;
  }
});
```

#### 4.3.3 响应拦截器

```typescript
client.addResponseInterceptor({
  fulfilled: async (response) => {
    // 1. 响应解密 (如启用)
    if (encryptKey) {
      // RSA 私钥解密 -> base64 解码 -> AES 解密
    }

    // 2. 业务状态码检查
    if (code === BUSINESS_SUCCESS_CODE) {
      return data; // 返回 data 或包装后的数据
    }

    // 3. 错误处理
    switch (code) {
      case UNAUTHORIZED_CODE:
        // 登录过期，执行登出
        break;
      default:
        // 显示错误消息
    }
  }
});
```

#### 4.3.4 使用示例

```typescript
// apps/web-antd/src/api/system/role.ts
import { requestClient } from '#/api/request';

export async function getRoleListApi(params: RoleQuery) {
  return requestClient.get('/system/role/list', { params });
}

export async function addRoleApi(data: RoleForm) {
  return requestClient.postWithMsg('/system/role', data);
}
```

### 4.4 状态管理 (Pinia)

#### 4.4.1 Store 模块

| Store | 文件 | 功能 |
|-------|------|------|
| useAccessStore | modules/access.ts | 权限状态管理 |
| useUserStore | modules/user.ts | 用户信息管理 |
| useTabbarStore | modules/tabbar.ts | 标签页管理 |
| useTimezoneStore | modules/timezone.ts | 时区设置 |

#### 4.4.2 持久化配置

```typescript
// useAccessStore 持久化
persist: {
  pick: [
    'accessToken',
    'refreshToken',
    'accessCodes',
    'isLockScreen',
    'lockScreenPassword',
  ],
  // 使用 secure-ls 加密存储
}
```

### 4.5 国际化 (i18n)

#### 4.5.1 配置位置

- **核心**: `packages/locales/src/i18n.ts`
- **应用**: `apps/web-antd/src/locales/index.ts`
- **语言包**: `apps/web-antd/src/locales/langs/{zh-CN|en-US}/*.json`

#### 4.5.2 使用方式

```typescript
import { $t } from '#/locales';

// 基础用法
const title = $t('system.title'); // 系统管理

// 带参数
const msg = $t('common.hello', { name: 'Vben' });

// 在模板中
<h1>{{ $t('system.title') }}</h1>
```

#### 4.5.3 语言包结构

```json
{
  "system": {
    "title": "系统管理",
    "role": {
      "title": "角色管理",
      "add": "新增角色"
    }
  }
}
```

### 4.6 路由系统

#### 4.6.1 路由分类

| 类型 | 说明 | 示例 |
|------|------|------|
| 核心路由 | 无需权限的基础路由 | 登录页、404、403 |
| 动态路由 | 根据权限动态生成 | 系统管理、仪表盘 |

#### 4.6.2 路由模块

路由模块位于 `apps/web-antd/src/router/routes/modules/`:

- `dashboard.ts` - 仪表盘
- `system.ts` - 系统管理
- `examples.ts` - 示例
- `demos.ts` - 演示
- `vben.ts` - Vben 相关

#### 4.6.3 路由配置示例

```typescript
// system.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    meta: {
      icon: 'ion:settings-outline',
      title: $t('system.title'),
      order: 9997,
    },
    children: [
      {
        path: '/system/role',
        name: 'SystemRole',
        meta: {
          icon: 'mdi:account-group',
          title: $t('system.role.title'),
        },
        component: () => import('#/views/system/role/list.vue'),
      },
    ],
  },
];
```

### 4.7 组件适配器

#### 4.7.1 适配器作用

组件适配器用于将业务组件与 UI 库解耦，使得同一套业务代码可以适配不同的 UI 库。

#### 4.7.2 适配器配置

```typescript
// apps/web-antd/src/adapter/component/index.ts
export async function initComponentAdapter() {
  // 适配 Alert 组件
  registerComponentAdapter('Alert', AntdAlertAdapter);

  // 适配 Badge 组件
  registerComponentAdapter('Badge', AntdBadgeAdapter);

  // ... 其他组件
}
```

---

## 5. 目录结构

### 5.1 根目录结构

```
vue-vben-admin/
├── .git/                       # Git 版本控制
├── .github/                    # GitHub 配置
├── .vscode/                    # VSCode 配置
├── apps/                       # 应用目录
│   ├── backend-mock/           # Nitro Mock 后端
│   ├── web-antd/               # Ant Design Vue 应用
│   ├── web-ele/                # Element Plus 应用
│   ├── web-naive/              # Naive UI 应用
│   └── web-tdesign/            # TDesign 应用
├── docs/                       # 文档
├── internal/                   # 内部配置
│   ├── lint-configs/           # Lint 配置
│   ├── node-utils/             # Node 工具
│   ├── tailwind-config/        # Tailwind 配置
│   ├── tsconfig/               # TypeScript 配置
│   └── vite-config/            # Vite 配置
├── packages/                   # 核心包
│   ├── @core/                  # 核心基础包
│   │   ├── base/               # 基础模块
│   │   ├── composables/        # 组合式函数
│   │   ├── preferences/        # 偏好设置
│   │   └── ui-kit/             # UI 组件套件
│   ├── business/               # 业务组件
│   ├── constants/              # 常量定义
│   ├── effects/                # 副作用模块
│   ├── hooks/                  # 业务 Hooks
│   ├── icons/                  # 图标模块
│   ├── locales/                # 国际化
│   ├── preferences/            # 用户偏好
│   ├── stores/                 # Pinia Store
│   ├── styles/                 # 全局样式
│   ├── types/                  # TypeScript 类型
│   └── utils/                  # 工具函数
├── playground/                 # 演示沙盒
├── scripts/                    # 构建脚本
├── .env                        # 环境变量
├── .eslintrc.cjs               # ESLint 配置
├── package.json                # 项目配置
├── pnpm-lock.yaml              # pnpm 锁文件
├── pnpm-workspace.yaml         # pnpm 工作空间
├── turbo.json                  # Turbo 配置
└── vitest.config.ts            # Vitest 配置
```

### 5.2 应用目录结构 (apps/web-antd)

```
apps/web-antd/
├── public/                     # 静态资源
├── src/
│   ├── adapter/                # 组件适配器
│   │   ├── component/          # 通用组件适配
│   │   └── form.ts             # 表单组件适配
│   ├── api/                    # API 接口
│   │   ├── core/               # 核心接口 (登录/用户)
│   │   ├── examples/           # 示例接口
│   │   ├── system/             # 系统管理接口
│   │   ├── helper.ts           # API 辅助函数
│   │   ├── index.ts            # API 导出
│   │   └── request.ts          # 请求配置
│   ├── assets/                 # 资源文件
│   ├── components/             # 业务组件
│   ├── layouts/                # 布局组件
│   ├── locales/                # 国际化
│   │   └── langs/              # 语言包
│   │       ├── zh-CN/          # 中文
│   │       └── en-US/          # 英文
│   ├── preferences/            # 偏好设置
│   ├── router/                 # 路由配置
│   │   ├── routes/             # 路由模块
│   │   │   ├── modules/        # 路由模块目录
│   │   │   ├── core.ts         # 核心路由
│   │   │   └── index.ts        # 路由合并
│   │   ├── access.ts           # 权限路由生成
│   │   ├── guard.ts            # 路由守卫
│   │   └── index.ts            # 路由导出
│   ├── store/                  # 应用 Store
│   ├── styles/                 # 应用样式
│   ├── views/                  # 页面视图
│   │   ├── _core/              # 核心页面
│   │   │   ├── about/          # 关于页面
│   │   │   ├── authentication/ # 认证页面
│   │   │   ├── fallback/       # 异常页面
│   │   │   └── profile/        # 个人中心
│   │   ├── dashboard/          # 仪表盘
│   │   ├── demos/              # 演示页面
│   │   ├── examples/           # 示例页面
│   │   └── system/             # 系统管理
│   ├── app.vue                 # 根组件
│   ├── bootstrap.ts            # 应用初始化
│   └── main.ts                 # 入口文件
├── index.html                  # HTML 模板
├── package.json                # 应用配置
└── vite.config.ts              # Vite 配置
```

---

## 6. 开发规范

### 6.1 Git 提交规范

基于 [Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) 规范：

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复 Bug |
| style | 代码格式 (不影响运行) |
| perf | 性能优化 |
| refactor | 重构 |
| revert | 撤销修改 |
| test | 测试相关 |
| docs | 文档/注释 |
| chore | 构建/工具/依赖 |
| ci | 持续集成 |
| types | 类型定义 |

**提交格式**:
```bash
git commit -m 'feat(function): add xxxxx'
```

### 6.2 代码规范

- **TypeScript**: 严格模式，禁止隐式 any
- **命名规范**:
  - 组件：PascalCase (如 `UserProfile.vue`)
  - 函数/变量：camelCase (如 `getUserInfo`)
  - 常量：UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- **文件组织**:
  - 组件按功能模块分组
  - API 按业务模块分组
  - 样式与组件同目录或使用 scoped

### 6.3 目录命名规范

- 使用小写字母
- 多单词 使用连字符 `-`
- 避免使用中文拼音或特殊字符

### 6.4 组件开发规范

```vue
<script setup lang="ts">
// 1. 导入顺序：外部依赖 → 内部依赖 → 类型
import { ref } from 'vue';
import { useUserStore } from '#/store';

// 2. Props 定义
interface Props {
  title?: string;
  loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: '',
  loading: false,
});

// 3. Emits 定义
interface Emits {
  (e: 'update', value: string): void;
}
const emit = defineEmits<Emits>();

// 4. 响应式数据
const count = ref(0);

// 5. 计算属性
const doubled = computed(() => count.value * 2);

// 6. 方法
function handleClick() {
  // ...
}
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
/* 样式 */
</style>
```

---

## 7. 构建与部署

### 7.1 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
pnpm dev:antd      # Ant Design Vue 版本
pnpm dev:ele       # Element Plus 版本
pnpm dev:naive     # Naive UI 版本
pnpm dev:tdesign   # TDesign 版本

# 构建
pnpm build
pnpm build:antd    # 构建 Ant Design Vue 版本
pnpm build:ele     # 构建 Element Plus 版本

# 代码检查
pnpm lint          # ESLint + Stylelint
pnpm format        # 格式化代码
pnpm check:type    # TypeScript 类型检查

# 测试
pnpm test:unit     # 单元测试
pnpm test:e2e      # E2E 测试
```

### 7.2 环境变量

```env
# .env 文件
VITE_PORT=5666                    # 开发服务器端口
VITE_GLOB_API_URL=/api            # API 基础地址
VITE_NITRO_MOCK=false             # Mock 服务开关
VITE_GLOB_ENABLE_ENCRYPT=false    # 全局加密开关
VITE_GLOB_SSE_ENABLE=false        # SSE 支持
VITE_GLOB_WEBSOCKET_ENABLE=false  # WebSocket 支持
VITE_APP_NAMESPACE=vben-admin     # 应用命名空间
VITE_APP_VERSION=5.7.0            # 应用版本
```

### 7.3 Vite 配置

```typescript
// apps/web-antd/vite.config.ts
import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {}, // 应用配置
    vite: {
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:8080/', // 后端地址
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            ws: true,
          },
        },
      },
    },
  };
});
```

### 7.4 构建输出

```
dist/
├── assets/               # 静态资源
│   ├── css/              # CSS 文件
│   ├── js/               # JS 文件
│   └── images/           # 图片资源
├── index.html            # 入口 HTML
└── vite.svg              # 图标
```

---

## 8. 扩展开发指南

### 8.1 新增页面

1. **创建视图文件** `src/views/模块名/页面名.vue`

```vue
<script setup lang="ts">
defineOptions({ name: 'SystemUserList' });
</script>

<template>
  <div>
    <h1>用户列表</h1>
  </div>
</template>
```

2. **添加路由** `src/router/routes/modules/模块名.ts`

```typescript
{
  path: '/system/user',
  name: 'SystemUser',
  meta: {
    icon: 'mdi:account',
    title: $t('system.user.title'),
  },
  component: () => import('#/views/system/user/list.vue'),
}
```

3. **添加国际化** `src/locales/langs/zh-CN/模块名.json`

```json
{
  "system": {
    "user": {
      "title": "用户管理"
    }
  }
}
```

### 8.2 新增 API

1. **创建 API 文件** `src/api/模块名/功能名.ts`

```typescript
import { requestClient } from '#/api/request';

export interface User {
  id: number;
  name: string;
}

export async function getUserListApi(params: any) {
  return requestClient.get<User[]>('/system/user/list', { params });
}
```

2. **导出 API** `src/api/index.ts`

```typescript
export * from './system/user';
```

### 8.3 新增 Store

1. **创建 Store** `packages/stores/src/modules/模块名.ts`

```typescript
import { acceptHMRUpdate, defineStore } from 'pinia';

interface ModuleState {
  items: string[];
}

export const useModuleStore = defineStore('module', {
  actions: {
    addItem(item: string) {
      this.items.push(item);
    },
  },
  state: (): ModuleState => ({
    items: [],
  }),
});

// HMR
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useModuleStore, hot));
}
```

### 8.4 主题定制

1. **修改设计令牌** `packages/@core/base/design/src/design-tokens/`

2. **覆盖样式** `apps/web-antd/src/styles/`

---

## 附录

### A. 常见问题

#### Q1: 如何修改默认首页？

修改 `preferences.app.defaultHomePath` 配置。

#### Q2: 如何添加新的权限模式？

在 `packages/effects/access/src/accessible.ts` 中添加新的 `generateRoutes` 分支。

#### Q3: 如何自定义请求拦截器？

在 `apps/web-antd/src/api/request.ts` 中添加 `client.addRequestInterceptor`。

### B. 相关链接

- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Ant Design Vue 文档](https://antdv.com/)
- [Vue Router 文档](https://router.vuejs.org/zh/)

### C. 项目维护者

- **作者**: Vben (anncwb)
- **邮箱**: ann.vben@gmail.com
- **GitHub**: https://github.com/anncwb

---

*本文档由 Claude 自动生成，最后更新时间：2026-03-26*

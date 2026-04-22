# Vue Vben Admin - Web Antd 应用使用文档

## 目录

- [项目简介](#项目简介)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [开发指南](#开发指南)
  - [路由与菜单](#路由与菜单)
  - [权限控制](#权限控制)
  - [状态管理](#状态管理)
  - [API 请求](#api 请求)
  - [表单使用](#表单使用)
  - [表格使用](#表格使用)
  - [国际化](#国际化)
- [组件使用](#组件使用)
- [常见问题](#常见问题)

---

## 项目简介

Vue Vben Admin 是一个免费开源的中后台模板，使用 Vue3、Vite、TypeScript 等主流技术开发。本应用（@vben/web-antd）是基于 **Ant Design Vue** 组件库的实现版本。

### 主要特性

- **最新技术栈**: Vue 3 + Vite + TypeScript
- **TypeScript**: 完整类型支持
- **多主题**: 支持多种主题色配置
- **国际化**: 完善的国际化支持（i18n）
- **权限控制**: 支持前端/后端/混合三种权限模式
- **响应式布局**: 支持多种屏幕尺寸

---

## 快速开始

### 环境要求

- **Node.js**: 20.15.0 及以上版本
- **pnpm**: 10.0.0 及以上版本
- **Git**: 任意版本

### 获取源码

```bash
# 从 GitHub 克隆
git clone https://github.com/vbenjs/vue-vben-admin.git

# 从 Gitee 克隆（国内推荐）
git clone https://gitee.com/annsion/vue-vben-admin.git
```

**注意**: 项目目录及所有父级目录不能存在中文、韩文、日文以及空格。

### 安装依赖

```bash
cd vue-vben-admin
npm i -g corepack
pnpm install
```

如果无法访问 npm 源，可以设置环境变量：

```bash
COREPACK_NPM_REGISTRY=https://registry.npmmirror.com pnpm install
```

### 启动项目

```bash
# 启动 web-antd 应用
pnpm dev:antd

# 或者使用通用命令
pnpm dev
# 然后选择 @vben/web-antd
```

启动成功后，访问 `http://localhost:5555`

**默认账号**: `vben` / `123456`

### 构建项目

```bash
# 构建 web-antd
pnpm build:antd

# 或使用通用命令
pnpm build --filter=@vben/web-antd
```

---

## 项目结构

### 目录结构

```
apps/web-antd/
├── src/
│   ├── adapter/           # 组件适配器
│   │   ├── component/     # 通用组件适配器
│   │   ├── form.ts        # 表单适配器
│   │   └── vxe-table.ts   # 表格适配器
│   ├── api/               # API 接口
│   │   ├── core/          # 核心接口
│   │   ├── monitor/       # 监控相关接口
│   │   ├── system/        # 系统管理接口
│   │   ├── tool/          # 工具相关接口
│   │   ├── request.ts     # 请求配置
│   │   └── helper.ts      # 请求工具
│   ├── bootstrap.ts       # 应用初始化
│   ├── components/        # 自定义组件
│   ├── composables/       # 组合式 API
│   │   ├── useDataHelper.ts    # 数据工具
│   │   └── useFormModal.ts     # 表单弹窗
│   ├── layouts/           # 布局组件
│   ├── locales/           # 国际化
│   │   └── langs/         # 语言包
│   ├── main.ts            # 入口文件
│   ├── preferences.ts     # 偏好设置
│   ├── router/            # 路由配置
│   │   ├── access.ts      # 路由权限
│   │   ├── guard.ts       # 路由守卫
│   │   └── routes/        # 路由模块
│   ├── store/             # 状态管理
│   │   ├── auth.ts        # 认证状态
│   │   ├── index.ts       # Store 初始化
│   │   ├── notify.ts      # 通知状态
│   │   └── tenant.ts      # 租户状态
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   │   ├── _core/         # 核心页面（登录等）
│   │   ├── dashboard/     # 仪表盘
│   │   ├── demos/         # 示例页面
│   │   ├── examples/      # 实例页面
│   │   ├── monitor/       # 监控管理
│   │   ├── system/        # 系统管理
│   │   └── tool/          # 工具管理
│   └── app.vue            # 根组件
├── package.json           # 依赖配置
├── preferences.ts         # 应用偏好设置
└── vite.config.ts         # Vite 配置
```

### Monorepo 结构

```
vue-vben-admin/
├── apps/                  # 应用目录
│   ├── web-antd          # Ant Design Vue 版本
│   ├── web-ele           # Element Plus 版本
│   ├── web-naive         # Naive UI 版本
│   └── web-tdesign       # TDesign 版本
├── packages/             # 共享包
│   ├── @core/            # 核心包
│   ├── @vben/access      # 权限控制
│   ├── @vben/common-ui   # 通用 UI
│   ├── @vben/constants   # 常量
│   ├── @vben/hooks       # 组合式 Hooks
│   ├── @vben/locales     # 国际化
│   ├── @vben/preferences # 偏好设置
│   ├── @vben/request     # 请求封装
│   ├── @vben/stores      # Pinia Store
│   └── @vben/utils       # 工具函数
└── docs/                 # 文档
```

---

## 技术栈

### 核心框架

- **Vue 3.5+**: 渐进式 JavaScript 框架
- **Vue Router 4**: 官方路由
- **Pinia**: Vue 官方状态管理

### UI 组件库

- **Ant Design Vue 4.x**: 企业级 UI 组件库
- **Vxe Table**: 高性能表格组件
- **Vben Common UI**: 框架封装的通用组件

### 构建工具

- **Vite 6**: 下一代前端构建工具
- **TypeScript 5**: JavaScript 超集
- **Tailwind CSS**: 原子化 CSS

### 开发工具

- **pnpm**: 高效的包管理
- **Turbo**: 构建性能优化
- **ESLint / Oxlint**: 代码检查
- **Stylelint**: 样式检查

---

## 开发指南

### 路由与菜单

框架根据路由文件自动生成对应的菜单结构。

#### 路由类型

1. **核心路由**: 框架内置路由（根路由、登录、404）
2. **静态路由**: 项目启动时确定的路由
3. **动态路由**: 登录后根据权限动态生成

#### 路由配置

路由文件位于 `src/router/routes/modules/` 目录下：

```typescript
// src/router/routes/modules/dashboard.ts
import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    redirect: '/demos/access',
    children: [
      {
        name: 'AccessDemos',
        path: '/demos/access',
        component: () => import('#/views/demos/access/index.vue'),
        meta: {
          icon: 'ic:round-menu',
          title: $t('demos.access'),
        },
      },
    ],
  },
];

export default routes;
```

#### 路由 Meta 配置

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | string | - | 页面标题（支持国际化） |
| `icon` | string | - | 菜单图标（支持 Iconify 或图片 URL） |
| `order` | number | 0 | 菜单排序 |
| `authority` | string[] | [] | 访问权限（角色标识） |
| `keepAlive` | boolean | false | 是否缓存页面 |
| `hideInMenu` | boolean | false | 是否在菜单隐藏 |
| `hideInTab` | boolean | false | 是否在标签页隐藏 |
| `hideInBreadcrumb` | boolean | false | 是否在面包屑隐藏 |
| `affixTab` | boolean | false | 是否固定标签页 |
| `ignoreAccess` | boolean | false | 是否忽略权限 |
| `link` | string | - | 外链地址 |
| `iframeSrc` | string | - | iframe 嵌入地址 |
| `badge` | string | - | 菜单徽标文本 |
| `badgeType` | 'dot' \| 'normal' | 'normal' | 徽标类型 |
| `badgeVariants` | string | 'success' | 徽标颜色 |
| `noBasicLayout` | boolean | false | 不使用基础布局 |

#### 新增页面

1. **添加路由**: 在 `src/router/routes/modules/` 下创建路由文件
2. **创建页面组件**: 在 `src/views/` 下创建对应的 `.vue` 文件

```vue
<!-- src/views/system/user/index.vue -->
<template>
  <PageWrapper>
    <h1>用户管理</h1>
  </PageWrapper>
</template>

<script setup lang="ts">
// 组件逻辑
</script>
```

---

### 权限控制

框架提供三种权限控制模式：

#### 1. 前端访问控制 (`accessMode: 'frontend'`)

在前端固定写死路由权限，通过角色判断菜单或按钮是否可访问。

**配置方式**:

```typescript
// src/preferences.ts
export const overridesPreferences = defineOverridesPreferences({
  app: {
    accessMode: 'frontend',
  },
});
```

**路由权限配置**:

```typescript
{
  meta: {
    authority: ['super', 'admin'], // 可访问的角色
  },
}
```

**按钮级权限**:

```vue
<template>
  <!-- 组件方式 -->
  <AccessControl :codes="['super']">
    <Button>Super 角色可见</Button>
  </AccessControl>

  <!-- API 方式 -->
  <Button v-if="hasAccessByRoles(['admin'])">Admin 可见</Button>

  <!-- 指令方式 -->
  <Button v-access:role="'user'">User 可见</Button>
</template>

<script setup lang="ts">
import { AccessControl, useAccess } from '@vben/access';

const { hasAccessByRoles } = useAccess();
</script>
```

#### 2. 后端访问控制 (`accessMode: 'backend'`)

通过接口动态生成路由表。

**配置方式**:

```typescript
// src/preferences.ts
export const overridesPreferences = defineOverridesPreferences({
  app: {
    accessMode: 'backend',
  },
});
```

**接口返回格式**:

```typescript
const menuData = [
  {
    name: 'Dashboard',
    path: '/',
    component: '/dashboard/analytics/index',
    meta: {
      title: 'page.dashboard',
      icon: 'icon-park-outline:analysis',
    },
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: '/dashboard/analytics/index',
        meta: {
          title: 'page.dashboard.analytics',
        },
      },
    ],
  },
];
```

#### 3. 混合访问控制 (`accessMode: 'mixed'`)

同时结合前端和后端权限控制。

---

### 状态管理

使用 Pinia 进行状态管理。

#### 认证 Store (`src/store/auth.ts`)

```typescript
import { useAuthStore } from '#/store';

const authStore = useAuthStore();

// 登录
await authStore.authLogin({
  username: 'vben',
  password: '123456',
});

// 获取用户信息
const userInfo = await authStore.fetchUserInfo();

// 登出
await authStore.logout();
```

#### 用户信息结构

```typescript
interface UserInfo {
  userId: string;
  username: string;
  realName: string;
  avatar: string;
  roles: string[]; // 角色列表
  permissions: string[]; // 权限码列表
  email?: string;
}
```

#### 自定义 Store

```typescript
// src/store/xxx.ts
import { defineStore } from 'pinia';

export const useXxxStore = defineStore('xxx', () => {
  const someState = ref('');

  function someAction() {
    // 逻辑
  }

  return {
    someState,
    someAction,
  };
});
```

---

### API 请求

#### 请求配置

API 接口定义在 `src/api/` 目录下，使用 `@vben/request` 封装。

```typescript
// src/api/system/user.ts
import { requestClient } from '#/api/request';

/**
 * 获取用户详情
 */
export function getUserInfoApi() {
  return requestClient.get('/system/user/getUserInfo');
}

/**
 * 用户登录
 */
export function loginApi(data: LoginParams) {
  return requestClient.post('/system/login', data);
}

/**
 * 退出登录
 */
export function logoutApi() {
  return requestClient.post('/system/logout');
}
```

#### 请求配置说明

```typescript
// src/api/request.ts
const requestClient = new RequestClient({
  baseURL: '/api', // 基础地址
  errorMessageMode: 'message', // 错误提示模式
  isTransformResponse: true, // 是否转换响应
});
```

#### 环境变量配置

```bash
# .env.development
VITE_GLOB_API_URL=/api

# .env.production
VITE_GLOB_API_URL=https://api.example.com
```

#### 通用导出接口

```typescript
import { commonExport } from '#/api/helper';

// 导出文件
const blob = await commonExport('/system/user/export', {
  deptId: 1,
  status: '0',
});

// 下载处理
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = '用户列表.xlsx';
link.click();
window.URL.revokeObjectURL(url);
```

---

### 表单使用

使用 `useVbenForm` 创建表单。

#### 基础用法

```vue
<template>
  <div class="p-4">
    <Form />
  </div>
</template>

<script setup lang="ts">
import { useVbenForm, z } from '#/adapter/form';

const [Form, formApi] = useVbenForm({
  schema: [
    {
      fieldName: 'username',
      label: '用户名',
      component: 'Input',
      rules: 'required',
    },
    {
      fieldName: 'password',
      label: '密码',
      component: 'InputPassword',
      rules: z.string().min(6, '密码长度不能少于 6 位'),
    },
  ],
  handleSubmit: async (values) => {
    console.log('提交:', values);
  },
});
</script>
```

#### 表单校验

```typescript
import { z } from '#/adapter/form';

const schema = [
  {
    fieldName: 'email',
    label: '邮箱',
    component: 'Input',
    rules: z.string().email('请输入有效的邮箱地址'),
  },
  {
    fieldName: 'age',
    label: '年龄',
    component: 'InputNumber',
    rules: z.number().min(1).max(150),
  },
  {
    fieldName: 'phone',
    label: '手机号',
    component: 'Input',
    rules: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  },
];
```

#### 表单联动

```typescript
const schema = [
  {
    fieldName: 'type',
    label: '类型',
    component: 'Select',
    defaultValue: '1',
    componentProps: {
      options: [
        { label: '类型 A', value: '1' },
        { label: '类型 B', value: '2' },
      ],
    },
  },
  {
    fieldName: 'content',
    label: '内容',
    component: 'Input',
    dependencies: {
      triggerFields: ['type'],
      show: (values) => values.type === '1',
      required: (values) => values.type === '1',
    },
  },
];
```

#### 查询表单

```vue
<template>
  <div class="p-4">
    <SearchForm />
  </div>
</template>

<script setup lang="ts">
import { useVbenForm } from '#/adapter/form';

const [SearchForm, formApi] = useVbenForm({
  collapsed: true,
  showCollapseButton: true,
  schema: [
    {
      fieldName: 'username',
      label: '用户名',
      component: 'Input',
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'Select',
      componentProps: {
        options: [
          { label: '启用', value: '0' },
          { label: '禁用', value: '1' },
        ],
      },
    },
  ],
  handleSubmit: async (values) => {
    await tableApi.query(values);
  },
});
</script>
```

#### 表单操作

```typescript
// 获取表单值
const values = await formApi.getValues();

// 设置表单值
await formApi.setValues({ username: 'test' });

// 重置表单
await formApi.resetForm();

// 校验表单
await formApi.validate();

// 提交表单
await formApi.submitForm();

// 更新 schema
formApi.updateSchema([
  { fieldName: 'username', componentProps: { disabled: true } },
]);
```

---

### 表格使用

使用 Vxe Table 或 Vben Table。

#### Vxe Table 基础用法

```vue
<template>
  <div class="p-4">
    <Grid />
  </div>
</template>

<script setup lang="ts">
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getUserListApi } from '#/api/system/user';

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { field: 'username', title: '用户名', minWidth: 120 },
      { field: 'realName', title: '姓名', minWidth: 100 },
      { field: 'email', title: '邮箱', minWidth: 150 },
      { field: 'status', title: '状态', minWidth: 80 },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const { data, total } = await getUserListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
          });
          return { result: data, total };
        },
      },
    },
  },
  formOptions: {
    schema: [
      {
        fieldName: 'username',
        label: '用户名',
        component: 'Input',
      },
    ],
  },
  showSearchForm: true,
});

// 刷新表格
function handleRefresh() {
  gridApi.reload();
}
</script>
```

#### 表格操作

```typescript
// 刷新数据
gridApi.reload(params);

// 查询数据
gridApi.query(params);

// 设置加载状态
gridApi.setLoading(true);

// 切换搜索表单
gridApi.toggleSearchForm();

// 获取选中行
const selectedRecords = gridApi.grid?.getCheckboxRecords() || [];
```

---

### 国际化

#### 使用国际化

```typescript
import { $t } from '#/locales';

const title = $t('page.system.user.title');
const message = $t('common.success');
```

#### 添加语言包

在 `src/locales/langs/zh-CN/` 下添加 JSON 文件：

```json
{
  "page": {
    "system": {
      "user": {
        "title": "用户管理",
        "add": "新增用户",
        "edit": "编辑用户"
      }
    }
  }
}
```

在 `src/locales/langs/en-US/` 下添加对应的英文翻译：

```json
{
  "page": {
    "system": {
      "user": {
        "title": "User Management",
        "add": "Add User",
        "edit": "Edit User"
      }
    }
  }
}
```

#### 切换语言

```typescript
import { useLocale } from '@vben/locales';

const { changeLocale } = useLocale();

// 切换为英文
changeLocale('en-US');

// 切换为中文
changeLocale('zh-CN');
```

---

## 组件使用

### Vben 组件

#### VbenModal

```vue
<template>
  <div>
    <Button @click="handleOpen">打开弹窗</Button>
    <Modal title="标题" @open-change="handleOpenChange" @ok="handleOk">
      <p>内容</p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

const [Modal, modalApi] = useVbenModal({
  title: '弹窗标题',
  centered: true,
  onConfirm: async () => {
    // 确认逻辑
  },
});

function handleOpen() {
  modalApi.open();
}
</script>
```

#### VbenDrawer

```vue
<template>
  <div>
    <Button @click="handleOpen">打开抽屉</Button>
    <Drawer title="抽屉标题" @open-change="handleOpenChange" @ok="handleOk">
      <p>内容</p>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { useVbenDrawer } from '@vben/common-ui';

const [Drawer, drawerApi] = useVbenDrawer({
  title: '抽屉标题',
  onConfirm: async () => {
    // 确认逻辑
  },
});
</script>
```

---

## 常见问题

### 1. 依赖安装失败

**问题**: `pnpm install` 时报错

**解决**:

```bash
# 清除缓存
pnpm clean --del-lock

# 重新安装
pnpm install

# 如果还是失败，尝试切换源
COREPACK_NPM_REGISTRY=https://registry.npmmirror.com pnpm install
```

### 2. 启动失败

**问题**: `pnpm dev` 无法启动

**解决**:

- 确保 Node.js 版本 >= 20.15.0
- 确保存放代码的目录及所有父级目录不存在中文、空格
- 删除 `node_modules` 后重新安装

### 3. 路由不显示

**问题**: 配置了路由但菜单不显示

**解决**:

- 检查路由的 `meta.title` 是否配置
- 检查路由的 `authority` 权限是否匹配
- 检查路由文件是否在 `src/router/routes/modules/` 目录下

### 4. 权限不生效

**问题**: 配置了权限但仍可访问

**解决**:

- 检查 `preferences.ts` 中的 `accessMode` 配置
- 检查登录后返回的 `roles` 是否与路由的 `authority` 匹配
- 如果是后端模式，检查接口返回的菜单数据结构

### 5. 国际化不生效

**问题**: 切换语言后页面无变化

**解决**:

- 确保使用了 `$t()` 函数包裹文本
- 检查语言包文件是否正确导入
- 清除浏览器缓存后刷新页面

### 6. 样式不生效

**问题**: 自定义样式被覆盖

**解决**:

- 使用 `!important` 强制覆盖（不推荐）
- 在 `style` 标签中添加 `scoped`
- 使用 Tailwind CSS 的 `!` 前缀：`class="!text-red-500"`

---

## 相关资源

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Ant Design Vue 文档](https://antdv.com/)
- [Vxe Table 文档](https://vxetable.cn/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/)

---

## 更新日志

详见 [CHANGELOG](https://github.com/vbenjs/vue-vben-admin/releases)

## License

[MIT](../../LICENSE)

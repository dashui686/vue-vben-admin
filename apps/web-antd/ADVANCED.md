# Web Antd 开发进阶指南

## 目录

- [项目配置](#项目配置)
- [主题定制](#主题定制)
- [布局系统](#布局系统)
- [图标使用](#图标使用)
- [状态管理进阶](#状态管理进阶)
- [组合式 API](#组合式-api)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)

---

## 项目配置

### 偏好设置 (preferences.ts)

```typescript
// apps/web-antd/src/preferences.ts
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  app: {
    // 权限模式：'frontend' | 'backend' | 'mixed'
    accessMode: 'backend',

    // 应用名称
    name: import.meta.env.VITE_APP_TITLE,

    // 默认首页路径
    defaultHomePath: '/dashboard',

    // 是否开启刷新 token
    enableRefreshToken: true,

    // 登录过期模式：'modal' | 'page'
    loginExpiredMode: 'modal',

    // 国际化语言：'zh-CN' | 'en-US'
    locale: 'zh-CN',

    // 主题色
    theme: 'default',

    // 布局模式
    layout: 'sidebar-nav',
  },
});
```

### 完整配置项

```typescript
interface AppPreferences {
  // 应用名称
  name: string;

  // 版本
  version: string;

  // 权限模式
  accessMode: 'frontend' | 'backend' | 'mixed';

  // 默认首页
  defaultHomePath: string;

  // 是否开启刷新 token
  enableRefreshToken: boolean;

  // 登录过期模式
  loginExpiredMode: 'modal' | 'page';

  // 国际化
  locale: string;

  // 主题
  theme: 'default' | 'dark' | 'light';

  // 布局
  layout: 'sidebar-nav' | 'header-nav' | 'mixin-nav';

  // 是否显示设置按钮
  showSettings: boolean;

  // 是否显示多标签页
  showTabs: boolean;

  // 是否显示面包屑
  showBreadcrumb: boolean;

  // 是否显示页脚
  showFooter: boolean;

  // 是否全屏
  fullContent: boolean;

  // 内容区域宽度
  contentWidth: 'full' | 'fixed';

  // 动态标题
  dynamicTitle: boolean;

  // 睡眠检测时间（秒）
  sleepInterval: number;
}
```

---

## 主题定制

### 颜色变量

项目使用 Tailwind CSS 和 CSS 变量进行主题管理。

```css
/* 在 CSS 中使用 */
.button {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
}

/* Tailwind CSS */
<div class="bg-primary text-primary-foreground">
```

### 主题色配置

```typescript
// packages/preferences/src/types.ts
interface ThemeConfig {
  // 主色调
  primary: string;

  // 成功色
  success: string;

  // 警告色
  warning: string;

  // 错误色
  destructive: string;

  // 信息色
  info: string;
}
```

### 动态切换主题

```typescript
import { usePreferences } from '@vben/preferences';

const { preferences, updatePreferences } = usePreferences();

// 切换主题
updatePreferences({
  theme: 'dark',
});

// 切换布局
updatePreferences({
  layout: 'header-nav',
});

// 切换语言
updatePreferences({
  locale: 'en-US',
});
```

---

## 布局系统

### 布局模式

框架支持三种布局模式：

#### 1. 侧边导航布局 (`sidebar-nav`)

```
┌─────────────────────────────┐
│        Header               │
├──────┬──────────────────────┤
│      │                      │
│Sidebar│     Content          │
│      │                      │
│      └──────────────────────┘
│      │      Footer          │
└──────┴──────────────────────┘
```

#### 2. 顶部导航布局 (`header-nav`)

```
┌─────────────────────────────┐
│        Header + Nav         │
├─────────────────────────────┤
│                             │
│         Content             │
│                             │
├─────────────────────────────┤
│         Footer              │
└─────────────────────────────┘
```

#### 3. 混合导航布局 (`mixin-nav`)

```
┌─────────────────────────────┐
│        Header               │
├──────┬──────────────────────┤
│ Side │  Sub Nav             │
│ nav  ├──────────────────────┤
│      │                      │
│      │     Content          │
│      │                      │
└──────┴──────────────────────┘
```

### 使用布局

```vue
<template>
  <PageWrapper title="页面标题" :content-full-width="false">
    <template #headerContent>
      <!-- 自定义头部内容 -->
    </template>

    <PageWrapper>
      <!-- 页面内容 -->
    </PageWrapper>
  </PageWrapper>
</template>

<script setup lang="ts">
import { PageWrapper } from '@vben/common-ui';
</script>
```

---

## 图标使用

### Iconify 图标

框架使用 Iconify 作为图标解决方案。

```vue
<template>
  <!-- 基本用法 -->
  <Icon icon="mdi:home" />

  <!-- 带颜色 -->
  <Icon icon="mdi:home" class="text-red-500" />

  <!-- 带大小 -->
  <Icon icon="mdi:home" class="size-6" />

  <!-- 动态图标 -->
  <Icon :icon="currentIcon" />
</template>

<script setup lang="ts">
import { Icon } from '@vben/icons';

const currentIcon = ref('mdi:home');
</script>
```

### 常用图标集合

- **Material Design Icons**: `mdi:*`
- **Font Awesome**: `fa:*`
- **Ant Design Icons**: `ant-design:*`
- **Carbon Icons**: `carbon:*`
- **Lucide Icons**: `lucide:*`

### 查找图标

- [Iconify 图标搜索](https://icones.js.org/)
- [Ant Design Icons](https://www.antdv.com/components/icon)

### 自定义图标

```typescript
// 注册自定义图标
import { addIcon } from '@iconify/vue';
import { homeIcon } from './icons/home';

addIcon('custom:home', homeIcon);

// 使用
<Icon icon="custom:home" />
```

### 菜单图标

```typescript
const routes = [
  {
    meta: {
      icon: 'mdi:home', // Iconify
      // 或
      icon: '/images/custom-icon.svg', // 自定义图片
      // 或
      icon: 'https://example.com/icon.png', // URL
    },
  },
];
```

---

## 状态管理进阶

### Pinia Store

```typescript
// src/store/xxx.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useXxxStore = defineStore('xxx', () => {
  // State
  const count = ref(0);
  const name = ref('');

  // Getters
  const doubleCount = computed(() => count.value * 2);
  const upperName = computed(() => name.value.toUpperCase());

  // Actions
  function increment() {
    count.value++;
  }

  function setName(newName: string) {
    name.value = newName;
  }

  async function fetchData() {
    const data = await api.getData();
    count.value = data.count;
  }

  // 重置
  function $reset() {
    count.value = 0;
    name.value = '';
  }

  return {
    count,
    name,
    doubleCount,
    upperName,
    increment,
    setName,
    fetchData,
    $reset,
  };
});
```

### 使用 Store

```typescript
import { useXxxStore } from '#/store';

const xxxStore = useXxxStore();

// 访问 state
console.log(xxxStore.count);

// 调用 action
xxxStore.increment();

// 监听变化
watch(
  () => xxxStore.count,
  (newVal) => {
    console.log('count changed:', newVal);
  },
);
```

### Store 组合

```typescript
import { useAuthStore } from '#/store/auth';
import { useUserStore } from '#/store/user';
import { useNotifyStore } from '#/store/notify';

export const useAppStore = defineStore('app', () => {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const notifyStore = useNotifyStore();

  // 组合逻辑
  const userInfo = computed(() => userStore.userInfo);
  const isLoggedIn = computed(() => authStore.isLoggedIn);

  return {
    userInfo,
    isLoggedIn,
  };
});
```

---

## 组合式 API

### 内置 Composables

#### useRefresh

```typescript
import { useRefresh } from '@vben/hooks';

const { refresh } = useRefresh();

// 刷新当前路由
refresh();

// 刷新指定路由
refresh('/dashboard');
```

#### useCopy

```typescript
import { useCopy } from '@vben/hooks';

const { copy, copied } = useCopy();

// 复制文本
copy('要复制的文本');

// 复制成功提示
if (copied.value) {
  message.success('复制成功');
}
```

#### useWatermark

```typescript
import { useWatermark } from '@vben/hooks';

const { setWatermark, clearWatermark } = useWatermark();

// 设置水印
setWatermark('机密文件');

// 清除水印
clearWatermark();
```

### 自定义 Composables

```typescript
// src/composables/useDebounce.ts
import { ref } from 'vue';
import { debounce } from 'lodash-es';

export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
) {
  const debouncedFn = debounce(fn, delay);

  const cancel = () => {
    debouncedFn.cancel();
  };

  return {
    fn: debouncedFn,
    cancel,
  };
}

// 使用
const { fn: searchFn } = useDebounce((keyword: string) => {
  // 搜索逻辑
}, 300);
```

```typescript
// src/composables/useLoading.ts
import { ref } from 'vue';

export function useLoading() {
  const loading = ref(false);

  const startLoading = () => {
    loading.value = true;
  };

  const stopLoading = () => {
    loading.value = false;
  };

  const withLoading = async <T>(fn: () => Promise<T>) => {
    startLoading();
    try {
      return await fn();
    } finally {
      stopLoading();
    }
  };

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
  };
}

// 使用
const { withLoading } = useLoading();

await withLoading(async () => {
  await fetchData();
});
```

---

## 性能优化

### 组件懒加载

```typescript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('#/views/dashboard/index.vue'),
  },
];

// 组件异步加载
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/HeavyComponent.vue'),
);
```

### KeepAlive 缓存

```typescript
const routes = [
  {
    name: 'UserList',
    path: '/system/user',
    component: () => import('#/views/system/user/index.vue'),
    meta: {
      keepAlive: true, // 开启缓存
    },
  },
];
```

```vue
<template>
  <PageWrapper>
    <!-- 缓存的组件 -->
  </PageWrapper>
</template>

<script setup lang="ts">
// onActivated 在组件被激活时触发
onActivated(() => {
  console.log('组件被激活');
});

// onDeactivated 在组件被停用时触发
onDeactivated(() => {
  console.log('组件被停用');
});
</script>
```

### 大数据表格优化

```vue
<template>
  <Grid
    :grid-options="{
      scrollY: { enabled: true },
      scrollX: { enabled: true },
      optimizeScroll: true,
      virtualScroll: true,
    }"
  />
</template>
```

### 图片懒加载

```vue
<template>
  <img v-lazy="imageUrl" alt="图片" />
</template>
```

### 防抖节流

```typescript
import { useDebounceFn, useThrottleFn } from '@vueuse/core';

// 防抖
const debouncedSearch = useDebounceFn((keyword: string) => {
  searchApi(keyword);
}, 300);

// 节流
const throttledScroll = useThrottleFn(() => {
  handleScroll();
}, 100);
```

---

## 最佳实践

### 代码规范

#### 命名规范

```typescript
// 文件命名：kebab-case
// views/system/user-management/list.vue

// 组件命名：PascalCase
const UserTable = defineComponent({});

// 变量命名：camelCase
const userName = ref('');

// 常量命名：UPPER_SNAKE_CASE
const MAX_COUNT = 10;

// 类型命名：PascalCase
interface UserInfo {}
type UserStatus = 'active' | 'inactive';

// 函数命名：camelCase
function getUserInfo() {}

// Composable 命名：useXxx
function useUser() {}
```

#### 导入规范

```typescript
// 1. Vue 相关
import { ref, computed } from 'vue';

// 2. 第三方库
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';

// 3. 框架
import { useRefresh } from '@vben/hooks';
import { Icon } from '@vben/icons';

// 4. 项目
import { getUserInfoApi } from '#/api/system/user';
import { useUserStore } from '#/store';

// 5. 本地
import UserTable from './components/UserTable.vue';
```

### 组件开发

```vue
<template>
  <div class="user-table">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
// 类型定义
interface Props {
  data: UserItem[];
  loading?: boolean;
}

interface Emits {
  (e: 'update', data: UserItem): void;
  (e: 'delete', id: number): void;
}

// Props
const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

// Emits
const emit = defineEmits<Emits>();

// 响应式数据
const selectedIds = ref<number[]>([]);

// 计算属性
const hasSelection = computed(() => selectedIds.value.length > 0);

// 方法
function handleUpdate(item: UserItem) {
  emit('update', item);
}

function handleDelete(id: number) {
  emit('delete', id);
}
</script>

<style scoped>
.user-table {
  /* 样式 */
}
</style>
```

### 错误处理

```typescript
// 统一错误处理
async function fetchData() {
  try {
    const data = await api.getData();
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    message.error('获取数据失败');
    throw error;
  }
}

// 业务错误处理
async function handleSubmit() {
  const { valid, errors } = await formApi.validate();
  if (!valid) {
    console.error('表单验证失败:', errors);
    return;
  }

  try {
    await submitApi(formValues);
    message.success('提交成功');
  } catch (error) {
    // 错误已由拦截器处理
  }
}
```

### 类型安全

```typescript
// 定义接口
interface UserItem {
  id: number;
  username: string;
  email?: string;
  roles: string[];
}

// API 参数类型
interface UserListParams {
  page: number;
  pageSize: number;
  username?: string;
  status?: '0' | '1';
}

// API 返回类型
interface UserListResult {
  rows: UserItem[];
  total: number;
}

// 使用泛型
async function getUserList(params: UserListParams): Promise<UserListResult> {
  return requestClient.get<UserListResult>('/system/user/list', { params });
}
```

### 国际化最佳实践

```typescript
// 不要在模板中直接使用中文
// ❌
<div>用户管理</div>

// ✅
<div>{{ $t('page.system.user.title') }}</div>

// 在 script 中使用
const title = $t('page.system.user.title');

// 带参数的国际化
$ t('common.success', { name: '张三' });
```

### 样式最佳实践

```vue
<template>
  <!-- 使用 Tailwind CSS -->
  <div class="flex items-center gap-2 p-4 bg-white rounded">
    <span class="text-sm text-gray-500">文本</span>
  </div>
</template>

<style scoped>
/* 仅在 Tailwind 无法满足需求时使用自定义样式 */
.custom-class {
  @apply text-primary font-bold;
}
</style>
```

---

## 调试技巧

### Vue DevTools

1. 在 `.env.development` 中开启：

```bash
VITE_DEVTOOLS=true
```

2. 重启项目后，在浏览器中打开 DevTools

### 日志输出

```typescript
// 开发环境输出
if (import.meta.env.DEV) {
  console.log('开发环境调试信息');
}

// 使用调试级别
const debug = import.meta.env.DEV;
debug && console.log('调试信息');
```

### 网络请求调试

```typescript
// request.ts 中添加日志
client.addRequestInterceptor({
  fulfilled: (config) => {
    console.log('请求:', config);
    return config;
  },
});

client.addResponseInterceptor({
  fulfilled: (response) => {
    console.log('响应:', response);
    return response;
  },
});
```

---

## 测试

### 单元测试

```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest';

describe('工具函数测试', () => {
  it('应该正确格式化日期', () => {
    const result = formatDate(new Date('2024-01-01'));
    expect(result).toBe('2024-01-01');
  });
});
```

### 组件测试

```typescript
// __tests__/UserTable.test.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import UserTable from '@/components/UserTable.vue';

describe('UserTable 组件', () => {
  it('应该正确渲染表格', () => {
    const wrapper = mount(UserTable, {
      props: {
        data: [{ id: 1, username: 'test' }],
      },
    });

    expect(wrapper.findAll('tr').length).toBe(2);
  });
});
```

---

## 部署

### 构建配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'antd-vendor': ['ant-design-vue'],
        },
      },
    },
  },
});
```

### 环境配置

```bash
# .env.production
NODE_ENV=production
VITE_APP_TITLE=生产环境
VITE_GLOB_API_URL=https://api.example.com
VITE_GLOB_APP_TITLE=我的应用
```

### Docker 部署

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm i -g corepack && pnpm install && pnpm build:antd

FROM nginx:alpine
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 相关文档

- [Vue 3 最佳实践](https://vuejs.org/guide/best-practices/)
- [TypeScript 规范](https://typescript-eslint.io/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Pinia 文档](https://pinia.vuejs.org/)

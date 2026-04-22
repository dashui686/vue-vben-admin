# Web Antd API 接口使用指南

## 目录

- [接口说明](#接口说明)
- [请求封装](#请求封装)
- [接口列表](#接口列表)
- [自定义接口](#自定义接口)

---

## 接口说明

本应用所有 API 接口均位于 `src/api/` 目录下，按照业务模块进行分类管理。

### 目录结构

```
src/api/
├── core/              # 核心接口
│   ├── auth.ts        # 认证相关
│   ├── captcha.ts     # 验证码
│   ├── menu.ts        # 菜单
│   ├── tenant.ts      # 租户
│   └── user.ts        # 用户
├── monitor/           # 监控管理
│   ├── cache.ts       # 缓存监控
│   ├── job.ts         # 定时任务
│   ├── logininfor.ts  # 登录日志
│   ├── online.ts      # 在线用户
│   └── operlog.ts     # 操作日志
├── system/            # 系统管理
│   ├── client.ts      # 客户端
│   ├── config.ts      # 参数配置
│   ├── dept.ts        # 部门
│   ├── dict.ts        # 字典
│   ├── menu.ts        # 菜单
│   ├── notice.ts      # 通知
│   ├── oss.ts         # 对象存储
│   ├── post.ts        # 岗位
│   ├── role.ts        # 角色
│   ├── tenant.ts      # 租户
│   ├── tenantPackage.ts # 套餐
│   └── user.ts        # 用户
├── tool/              # 工具管理
│   └── gen.ts         # 代码生成
├── examples/          # 示例接口
│   ├── download.ts    # 下载
│   ├── table.ts       # 表格
│   └── upload.ts      # 上传
├── request.ts         # 请求配置
├── helper.ts          # 请求工具
└── auth-exception.ts  # 认证异常
```

---

## 请求封装

### requestClient

使用 `@vben/request` 封装的请求客户端。

```typescript
// src/api/request.ts
import { requestClient } from '#/api/request';

// GET 请求
const data = await requestClient.get('/api/user/list', { page: 1 });

// POST 请求
const result = await requestClient.post('/api/user/create', {
  username: 'test',
});

// PUT 请求
await requestClient.put('/api/user/update', { id: 1, name: 'new' });

// DELETE 请求
await requestClient.delete('/api/user/delete', { id: 1 });
```

### 响应结构

默认情况下，响应会被转换，直接返回 `data` 字段：

```typescript
// 后端返回
{
  code: 200,
  data: { id: 1, name: 'test' },
  msg: 'success'
}

// 前端获取
const result = await requestClient.get('/api/user/1');
// result = { id: 1, name: 'test' }
```

如果需要获取原始响应，可以设置 `isTransformResponse: false`：

```typescript
const response = await requestClient.get('/api/user/1', {
  isTransformResponse: false,
});
// response = { code: 200, data: {...}, msg: 'success' }
```

### 错误处理

框架会自动处理以下错误：

- **401 未授权**: 自动触发登出逻辑
- **业务错误**: 自动弹出错误提示
- **网络错误**: 显示网络错误提示

```typescript
try {
  const data = await getUserInfoApi();
} catch (error) {
  // 错误已自动处理
  console.error(error);
}
```

### 下载文件

```typescript
import { commonExport } from '#/api/helper';

// 导出文件
const blob = await commonExport('/system/user/export', {
  deptId: 1,
  status: '0',
});

// 创建下载链接
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = '文件名.xlsx';
link.click();
window.URL.revokeObjectURL(url);
```

### 上传文件

```typescript
import { requestClient } from '#/api/request';
import { ContentTypeEnum } from '#/api/helper';

const file = event.target.files[0];
const formData = new FormData();
formData.append('file', file);

const result = await requestClient.post('/system/oss/upload', formData, {
  headers: {
    'Content-Type': ContentTypeEnum.FORM_DATA,
  },
});
```

---

## 接口列表

### 认证相关

#### 登录

```typescript
import { loginApi } from '#/api/core/auth';

await loginApi({
  username: 'admin',
  password: '123456',
  code: '1234', // 验证码
  uuid: 'xxx-xxx', // 验证码 UUID
});
```

#### 退出登录

```typescript
import { logoutApi } from '#/api/core/auth';

await logoutApi();
```

#### 获取用户信息

```typescript
import { getUserInfoApi } from '#/api/core/auth';

const userInfo = await getUserInfoApi();
// 返回：{ user, roles, permissions }
```

#### 获取验证码

```typescript
import { getCaptchaApi } from '#/api/core/captcha';

const { image, uuid } = await getCaptchaApi();
```

---

### 系统管理

#### 用户管理

```typescript
// src/api/system/user.ts

// 获取用户列表
const { rows, total } = await getUserListApi({
  page: 1,
  pageSize: 10,
  username: 'admin',
  status: '0',
});

// 获取用户详情
const user = await getUserDetailApi(1);

// 创建用户
await createUserApi({
  username: 'test',
  nickName: '测试用户',
  email: 'test@example.com',
  roleIds: [1, 2],
  postIds: [1],
  status: '0',
});

// 更新用户
await updateUserApi(1, {
  nickName: '新名称',
  email: 'new@example.com',
});

// 删除用户
await deleteUserApi(1);

// 重置密码
await resetUserPasswordApi(1, '123456');

// 导出用户
const blob = await commonExport('/system/user/export', {
  username: 'admin',
});
```

#### 角色管理

```typescript
// src/api/system/role.ts

// 获取角色列表
const { rows, total } = await getRoleListApi({
  page: 1,
  pageSize: 10,
  roleName: '管理员',
});

// 获取角色详情
const role = await getRoleDetailApi(1);

// 创建角色
await createRoleApi({
  roleName: '普通用户',
  roleKey: 'user',
  roleSort: 2,
  status: '0',
  menuIds: [1, 2, 3],
});

// 更新角色
await updateRoleApi(1, {
  roleName: '超级管理员',
  menuIds: [1, 2, 3, 4, 5],
});

// 删除角色
await deleteRoleApi(1);

// 获取角色关联的用户
const { users } = await getRoleUserListApi(1);
```

#### 部门管理

```typescript
// src/api/system/dept.ts

// 获取部门列表（树形）
const depts = await getDeptListApi({
  deptName: '技术部',
  status: '0',
});

// 获取部门详情
const dept = await getDeptDetailApi(1);

// 创建部门
await createDeptApi({
  deptName: '研发部',
  parentId: 1,
  orderNum: 1,
  leader: '张三',
  phone: '13800138000',
  email: 'dev@example.com',
  status: '0',
});

// 更新部门
await updateDeptApi(1, {
  deptName: '研发中心',
  leader: '李四',
});

// 删除部门
await deleteDeptApi(1);
```

#### 岗位管理

```typescript
// src/api/system/post.ts

// 获取岗位列表
const { rows, total } = await getPostListApi({
  page: 1,
  pageSize: 10,
  postCode: 'DEV',
  status: '0',
});

// 创建岗位
await createPostApi({
  postCode: 'TEST',
  postName: '测试工程师',
  postSort: 2,
  status: '0',
  remark: '测试岗位',
});

// 更新岗位
await updatePostApi(1, {
  postName: '高级测试工程师',
});

// 删除岗位
await deletePostApi(1);
```

#### 字典管理

```typescript
// src/api/system/dict.ts

// 获取字典类型列表
const { rows, total } = await getDictTypeListApi({
  page: 1,
  pageSize: 10,
  dictName: '用户类型',
});

// 创建字典类型
await createDictTypeApi({
  dictName: '用户等级',
  dictType: 'user_level',
  status: '0',
  remark: '用户等级字典',
});

// 获取字典数据列表
const { rows, total } = await getDictDataListApi({
  page: 1,
  pageSize: 10,
  dictType: 'user_level',
});

// 创建字典数据
await createDictDataApi({
  dictLabel: '普通会员',
  dictValue: '1',
  dictType: 'user_level',
  listClass: 'primary',
  isDefault: 'Y',
  status: '0',
});

// 更新字典数据
await updateDictDataApi(1, {
  dictLabel: '黄金会员',
  listClass: 'warning',
});

// 删除字典数据
await deleteDictDataApi(1);
```

#### 参数配置

```typescript
// src/api/system/config.ts

// 获取参数列表
const { rows, total } = await getConfigListApi({
  page: 1,
  pageSize: 10,
  configName: '系统',
});

// 创建参数
await createConfigApi({
  configName: '系统框架',
  configKey: 'sys.framework',
  configValue: 'Vben',
  configType: 'Y',
  remark: '系统框架配置',
});

// 更新参数
await updateConfigApi(1, {
  configValue: 'Vben 5.x',
});

// 删除参数
await deleteConfigApi(1);
```

#### 通知管理

```typescript
// src/api/system/notice.ts

// 获取通知列表
const { rows, total } = await getNoticeListApi({
  page: 1,
  pageSize: 10,
  noticeTitle: '系统',
  status: '0',
});

// 创建通知
await createNoticeApi({
  noticeTitle: '系统维护通知',
  noticeType: '1', // 1=通知 2=公告
  noticeContent: '<p>系统将于今晚进行维护</p>',
  status: '0',
});

// 更新通知
await updateNoticeApi(1, {
  noticeContent: '<p>系统维护已完成</p>',
});

// 删除通知
await deleteNoticeApi(1);
```

#### 菜单管理

```typescript
// src/api/system/menu.ts

// 获取菜单列表（树形）
const menus = await getMenuListApi({
  menuName: '用户',
  status: '0',
});

// 获取菜单详情
const menu = await getMenuDetailApi(1);

// 创建菜单
await createMenuApi({
  parentId: 1,
  menuName: '用户管理',
  orderNum: 1,
  path: 'user',
  component: 'system/user/index',
  query: '',
  isFrame: 0,
  isCache: 0,
  type: 'C',
  visible: '0',
  status: '0',
  icon: 'user',
  remark: '用户管理菜单',
});

// 更新菜单
await updateMenuApi(1, {
  menuName: '用户管理（新）',
  orderNum: 2,
});

// 删除菜单
await deleteMenuApi(1);
```

---

### 监控管理

#### 登录日志

```typescript
// src/api/monitor/logininfor.ts

// 获取登录日志列表
const { rows, total } = await getLogininforListApi({
  page: 1,
  pageSize: 10,
  ipaddr: '192.168.1',
  status: '0',
});

// 删除登录日志
await deleteLogininforApi([1, 2, 3]);

// 清空登录日志
await cleanLogininforApi();

// 解锁账户
await unlockAccountApi('admin');
```

#### 操作日志

```typescript
// src/api/monitor/operlog.ts

// 获取操作日志列表
const { rows, total } = await getOperlogListApi({
  page: 1,
  pageSize: 10,
  businessType: 1,
  status: '0',
});

// 删除操作日志
await deleteOperlogApi([1, 2, 3]);

// 清空操作日志
await cleanOperlogApi();
```

#### 在线用户

```typescript
// src/api/monitor/online.ts

// 获取在线用户列表
const { rows, total } = await getOnlineListApi({
  page: 1,
  pageSize: 10,
  userName: 'admin',
});

// 强退用户
await forceLogoutApi(token);
```

#### 定时任务

```typescript
// src/api/monitor/job.ts

// 获取任务列表
const { rows, total } = await getJobListApi({
  page: 1,
  pageSize: 10,
  jobName: '备份',
  status: '0',
});

// 创建任务
await createJobApi({
  jobName: '数据备份',
  jobGroup: '1',
  invokeTarget: 'backupTask.run()',
  cronExpression: '0 0 2 * * ?',
  misfirePolicy: 1,
  status: '0',
});

// 更新任务
await updateJobApi(1, {
  cronExpression: '0 0 3 * * ?',
});

// 删除任务
await deleteJobApi(1);

// 执行任务
await runJobApi(1);

// 暂停任务
await changeJobStatusApi(1, '1'); // 0=启动 1=暂停
```

#### 缓存监控

```typescript
// src/api/monitor/cache.ts

// 获取缓存统计
const stats = await getCacheStatsApi();

// 获取缓存列表
const caches = await getCacheNamesApi();

// 获取缓存键名
const keys = await getCacheKeysApi(cacheName);

// 获取缓存内容
const value = await getCacheValueApi(cacheName, cacheKey);

// 清除缓存
await clearCacheApi(cacheName);
```

---

### 工具管理

#### 代码生成

```typescript
// src/api/tool/gen.ts

// 获取数据库表列表
const { rows, total } = await getDbTableListApi({
  page: 1,
  pageSize: 10,
  tableName: 'sys_user',
});

// 获取已导入的表列表
const { rows, total } = await getGenTableListApi({
  page: 1,
  pageSize: 10,
  tableName: 'user',
});

// 导入表
await importTableApi({
  tables: 'sys_user,sys_role',
});

// 获取生成详情
const genTable = await getGenTableDetailApi(tableId);

// 更新生成配置
await updateGenTableApi(genTable);

// 预览代码
const codes = await previewGenCodeApi(tableId);

// 生成代码（到服务器）
await generateGenCodeApi(tableName);

// 下载代码
const zipBlob = await downloadGenCodeApi(tableName);

// 删除表
await deleteGenTableApi([1, 2, 3]);

// 同步数据库
await syncGenTableApi(tableId);
```

---

### 示例接口

#### 文件上传

```typescript
// src/api/examples/upload.ts
import { requestClient } from '#/api/request';
import { ContentTypeEnum } from '#/api/helper';

const file = event.target.files[0];
const formData = new FormData();
formData.append('file', file);

const result = await requestClient.post('/examples/upload', formData, {
  headers: {
    'Content-Type': ContentTypeEnum.FORM_DATA,
  },
});
```

#### 文件下载

```typescript
// src/api/examples/download.ts
import { commonExport } from '#/api/helper';

const blob = await commonExport('/examples/download', {
  id: 1,
});
```

---

## 自定义接口

### 创建新接口

1. 在对应目录下创建文件：

```typescript
// src/api/system/xxx.ts
import { requestClient } from '#/api/request';
import { commonExport } from '#/api/helper';

export interface XxxListParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

export interface XxxItem {
  id: number;
  name: string;
  status: string;
}

/**
 * 获取列表
 */
export function getXxxListApi(params: XxxListParams) {
  return requestClient.get<XxxItem[]>({
    url: '/system/xxx/list',
    params,
  });
}

/**
 * 获取详情
 */
export function getXxxDetailApi(id: number) {
  return requestClient.get<XxxItem>({
    url: '/system/xxx/' + id,
  });
}

/**
 * 创建
 */
export function createXxxApi(data: Partial<XxxItem>) {
  return requestClient.post('/system/xxx', data);
}

/**
 * 更新
 */
export function updateXxxApi(id: number, data: Partial<XxxItem>) {
  return requestClient.put('/system/xxx/' + id, data);
}

/**
 * 删除
 */
export function deleteXxxApi(id: number) {
  return requestClient.delete('/system/xxx/' + id);
}

/**
 * 导出
 */
export function exportXxxApi(params: XxxListParams) {
  return commonExport('/system/xxx/export', params);
}
```

### 使用接口

```typescript
// views/system/xxx/list.vue
import {
  getXxxListApi,
  getXxxDetailApi,
  createXxxApi,
  updateXxxApi,
  deleteXxxApi,
} from '@/api/system/xxx';

// 列表
const { rows, total } = await getXxxListApi({ page: 1, pageSize: 10 });

// 详情
const item = await getXxxDetailApi(1);

// 创建
await createXxxApi({ name: '测试', status: '0' });

// 更新
await updateXxxApi(1, { name: '新名称' });

// 删除
await deleteXxxApi(1);
```

---

## 请求配置

### 环境变量

```bash
# .env.development
VITE_GLOB_API_URL=/api
VITE_APP_TITLE=开发环境

# .env.production
VITE_GLOB_API_URL=https://api.example.com
VITE_APP_TITLE=生产环境
```

### Vite 代理

```typescript
// vite.config.ts
export default defineConfig({
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          ws: true,
        },
      },
    },
  },
});
```

### 请求拦截器

```typescript
// src/api/request.ts
client.addRequestInterceptor({
  fulfilled: (config) => {
    // 添加 token
    config.headers.Authorization = `Bearer ${token}`;

    // 添加语言设置
    config.headers['Accept-Language'] = 'zh-CN';

    return config;
  },
});
```

### 响应拦截器

```typescript
// src/api/request.ts
client.addResponseInterceptor({
  fulfilled: (response) => {
    const { code, data, msg } = response.data;

    // 成功
    if (code === 200) {
      return data;
    }

    // 401 未授权
    if (code === 401) {
      handleUnauthorizedLogout();
    }

    // 其他错误
    message.error(msg);
    throw new Error(msg);
  },
});
```

---

## 类型定义

### 通用类型

```typescript
// src/api/common.d.ts

// 分页参数
export interface PageParams {
  page: number;
  pageSize: number;
}

// 分页结果
export interface PageResult<T> {
  rows: T[];
  total: number;
}

// 通用响应
export interface HttpResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 用户信息
export interface UserInfo {
  userId: string;
  username: string;
  realName: string;
  avatar: string;
  roles: string[];
  permissions: string[];
  email?: string;
}

// 登录参数
export interface LoginParams {
  username: string;
  password: string;
  code?: string;
  uuid?: string;
}
```

---

## 相关文档

- [Vue Vben Admin 使用文档](./README.md)
- [官方文档](https://doc.vben.pro/)

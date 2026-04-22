# 系统模块开发文档

## 目录

- [系统模块概览](#系统模块概览)
- [用户管理](#用户管理)
- [角色管理](#角色管理)
- [部门管理](#部门管理)
- [岗位管理](#岗位管理)
- [字典管理](#字典管理)
- [菜单管理](#菜单管理)
- [参数配置](#参数配置)
- [通知管理](#通知管理)
- [日志管理](#日志管理)

---

## 系统模块概览

系统管理模块包含以下功能：

| 模块     | 路径               | 说明                   |
| -------- | ------------------ | ---------------------- |
| 用户管理 | /system/user       | 用户增删改查、角色分配 |
| 角色管理 | /system/role       | 角色配置、权限分配     |
| 部门管理 | /system/dept       | 部门树形结构管理       |
| 岗位管理 | /system/post       | 岗位配置               |
| 字典管理 | /system/dict       | 字典类型和数据管理     |
| 菜单管理 | /system/menu       | 菜单和路由配置         |
| 参数配置 | /system/config     | 系统参数配置           |
| 通知管理 | /system/notice     | 通知公告管理           |
| 操作日志 | /system/operlog    | 系统操作日志           |
| 登录日志 | /system/logininfor | 登录日志记录           |

---

## 用户管理

### 功能说明

用户管理模块提供用户的增删改查功能，支持分配角色和岗位。

### 文件结构

```
src/views/system/user/
├── list.vue         # 用户列表页面
└── modules/
    ├── form.vue     # 用户表单弹窗
    └── reset-password.vue  # 重置密码弹窗
```

### 列表页面实现

```vue
<!-- src/views/system/user/list.vue -->
<template>
  <PageWrapper title="用户管理" content-full-width>
    <VxeGrid ref="gridRef" v-bind="gridProps" />
  </PageWrapper>
</template>

<script setup lang="ts">
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getUserListApi,
  deleteUserApi,
  exportUserApi,
} from '#/api/system/user';
import { UserForm } from './modules/form';
import { ResetPasswordModal } from './modules/reset-password';
import { columns, searchFormSchema } from './data';

// 表格配置
const gridProps = {
  gridOptions: {
    columns,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const { data, total } = await getUserListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formApi.getValues(),
          });
          return { result: data, total };
        },
      },
    },
    toolbarConfig: {
      search: true,
    },
  },
  gridEvents: {
    // 编辑
    ['edit-click']({ row }) {
      openFormModal(row);
    },
    // 删除
    async ['delete-click']({ row }) {
      await Modal.confirm({
        title: '确认删除',
        content: `确定要删除用户"${row.userName}"吗？`,
        onOk: async () => {
          await deleteUserApi(row.userId);
          message.success('删除成功');
          gridApi.reload();
        },
      });
    },
  },
  formOptions: {
    schema: searchFormSchema,
    handleSubmit: async (values) => {
      gridApi.reload(values);
    },
    handleReset: async () => {
      await formApi.resetForm();
      gridApi.reload();
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid(gridProps);
const [UserForm, formModalApi] = useVbenModal({
  onConfirm: async () => {
    await formApi.submitForm();
    gridApi.reload();
  },
});

// 打开表单
function openFormModal(data?: any) {
  formModalApi.setData(data);
  formModalApi.open();
}
</script>
```

### 表单页面实现

```vue
<!-- src/views/system/user/modules/form.vue -->
<template>
  <Form v-bind="formProps" />
</template>

<script setup lang="ts">
import { useVbenForm, z } from '#/adapter/form';
import { getRoleListApi } from '#/api/system/role';
import { getPostListApi } from '#/api/system/post';
import { getUserDetailApi, saveUserApi } from '#/api/system/user';
import { handleFormOpenChange } from '#/composables/useFormModal';
import { statusRadioField, remarkField } from '#/composables/useDataHelper';

const [Form, formApi] = useVbenForm({
  schema: [
    {
      fieldName: 'userName',
      label: '用户账号',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入用户账号',
        maxLength: 30,
      },
    },
    {
      fieldName: 'nickName',
      label: '用户昵称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入用户昵称',
        maxLength: 30,
      },
    },
    {
      fieldName: 'email',
      label: '邮箱',
      component: 'Input',
      rules: z
        .string()
        .email('请输入有效的邮箱地址')
        .optional()
        .or(z.literal('')),
      componentProps: {
        placeholder: '请输入邮箱',
        maxLength: 50,
      },
    },
    {
      fieldName: 'phonenumber',
      label: '手机号码',
      component: 'Input',
      rules: z
        .string()
        .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
        .optional()
        .or(z.literal('')),
      componentProps: {
        placeholder: '请输入手机号码',
        maxLength: 11,
      },
    },
    {
      fieldName: 'sex',
      label: '性别',
      component: 'RadioGroup',
      defaultValue: '0',
      componentProps: {
        options: [
          { label: '男', value: '0' },
          { label: '女', value: '1' },
          { label: '未知', value: '2' },
        ],
      },
    },
    {
      fieldName: 'roleIds',
      label: '分配角色',
      component: 'ApiSelect',
      rules: 'selectRequired',
      componentProps: {
        api: getRoleListApi,
        labelField: 'roleName',
        valueField: 'roleId',
        mode: 'multiple',
        placeholder: '请选择角色',
      },
    },
    {
      fieldName: 'postIds',
      label: '分配岗位',
      component: 'ApiSelect',
      rules: 'selectRequired',
      componentProps: {
        api: getPostListApi,
        labelField: 'postName',
        valueField: 'postId',
        mode: 'multiple',
        placeholder: '请选择岗位',
      },
    },
    statusRadioField('用户状态'),
    remarkField('备注'),
  ],
  async handleReset(values) {
    await formApi.resetForm(values);
  },
  async handleSubmit(values) {
    await saveUserApi(values);
    message.success('保存成功');
    formModalApi.close();
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = formModalApi.getData();
      await handleFormOpenChange(formApi, formModalApi, data, {
        getDetailApi: getUserDetailApi,
        idField: 'userId',
        onValuesReady: (userInfo) => ({
          ...userInfo.user,
          roleIds: userInfo.roleIds,
          postIds: userInfo.postIds,
        }),
      });
    }
  },
});

const formProps = computed(() => ({
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
}));
</script>
```

### 重置密码实现

```vue
<!-- src/views/system/user/modules/reset-password.vue -->
<template>
  <Modal v-bind="modalProps">
    <Input
      v-model:value="password"
      type="password"
      placeholder="请输入新密码"
      class="w-full"
    />
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { resetUserPasswordApi } from '#/api/system/user';
import { message } from 'ant-design-vue';

const password = ref('');

const [Modal, modalApi] = useVbenModal({
  title: '重置密码',
  onConfirm: async () => {
    if (!password.value) {
      message.error('请输入新密码');
      return;
    }
    const data = modalApi.getData();
    await resetUserPasswordApi(data.userId, password.value);
    message.success('密码重置成功');
    modalApi.close();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      password.value = '';
    }
  },
});
</script>
```

---

## 角色管理

### 功能说明

角色管理模块提供角色的增删改查功能，支持分配菜单权限和数据权限。

### 关键代码

```typescript
// src/views/system/role/data.ts
import type { VxeGridProps } from '#/adapter/vxe-table';
import {
  statusColumn,
  operationColumn,
  confirmStatusChange,
} from '#/composables/useDataHelper';
import { updateRoleStatusApi } from '#/api/system/role';

export const columns: VxeGridProps['gridOptions']['columns'] = [
  { type: 'checkbox', width: 50 },
  { field: 'roleName', title: '角色名称', minWidth: 120 },
  { field: 'roleKey', title: '角色标识', minWidth: 120 },
  { field: 'roleSort', title: '显示顺序', width: 80 },
  statusColumn(
    '状态',
    async (newStatus, row) => {
      return await confirmStatusChange(
        newStatus,
        row,
        'roleName',
        row.roleName,
        updateRoleStatusApi,
        'roleId',
      );
    },
    'system:role:edit',
  ),
  { field: 'createTime', title: '创建时间', width: 160 },
  operationColumn(
    '操作',
    (action, row) => {
      switch (action.code) {
        case 'edit':
          openFormModal(row);
          break;
        case 'auth-user':
          openUserModal(row);
          break;
        case 'delete':
          handleDelete(row);
          break;
      }
    },
    [
      { code: 'edit', text: '编辑' },
      { code: 'auth-user', text: '分配用户' },
      { code: 'delete', text: '删除' },
    ],
    'roleKey',
    'roleName',
    { maxInline: 2 },
  ),
];
```

### 权限分配

```vue
<!-- 分配菜单权限 -->
<template>
  <Drawer v-bind="drawerProps">
    <Tree
      v-model:checkedKeys="checkedKeys"
      :tree-data="menuTree"
      :default-expand-all="true"
      :check-strictly="false"
      checkable
    />
  </Drawer>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import { Tree } from 'ant-design-vue';
import {
  getMenuListApi,
  getRoleMenuIdsApi,
  saveRoleMenuApi,
} from '#/api/system/menu';
import { toTree } from '#/utils/tree';

const checkedKeys = ref([]);
const menuTree = ref([]);

const [Drawer, drawerApi] = useVbenDrawer({
  title: '分配菜单',
  width: 400,
  onConfirm: async () => {
    const data = drawerApi.getData();
    await saveRoleMenuApi(data.roleId, {
      menuIds: checkedKeys.value,
    });
    message.success('分配成功');
    drawerApi.close();
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      const menus = await getMenuListApi({});
      menuTree.value = toTree(menus);

      const { menuIds } = await getRoleMenuIdsApi(data.roleId);
      checkedKeys.value = menuIds || [];
    }
  },
});
</script>
```

---

## 部门管理

### 功能说明

部门管理采用树形结构展示，支持无限层级。

### 树形表格实现

```vue
<template>
  <PageWrapper title="部门管理">
    <VxeGrid ref="gridRef" v-bind="gridProps" />
  </PageWrapper>
</template>

<script setup lang="ts">
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDeptListApi } from '#/api/system/dept';

const gridProps = {
  gridOptions: {
    treeConfig: {
      children: 'children',
      expandAll: true,
    },
    columns: [
      { type: 'seq', width: 50 },
      { field: 'deptName', title: '部门名称', minWidth: 200, treeNode: true },
      { field: 'orderNum', title: '排序', width: 80 },
      { field: 'leader', title: '负责人', width: 100 },
      { field: 'phone', title: '联系电话', width: 120 },
      { field: 'status', title: '状态', width: 80 },
    ],
    data: [],
  },
  async onReady() {
    const depts = await getDeptListApi({});
    gridApi.grid.loadData(depts);
  },
};

const [Grid, gridApi] = useVbenVxeGrid(gridProps);
</script>
```

---

## 字典管理

### 功能说明

字典管理分为字典类型和字典数据两个层级。

### 字典类型列表

```typescript
// src/views/system/dict/list.vue
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDictTypeListApi } from '#/api/system/dict';
import { DictTypeForm } from './modules/dict-type-form';

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { field: 'dictId', title: '字典 ID', width: 80 },
      { field: 'dictName', title: '字典名称', minWidth: 120 },
      { field: 'dictType', title: '字典类型', minWidth: 120 },
      { field: 'status', title: '状态', width: 80 },
      { field: 'remark', title: '备注', minWidth: 150 },
      { field: 'createTime', title: '创建时间', width: 160 },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const { data, total } = await getDictTypeListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formApi.getValues(),
          });
          return { result: data, total };
        },
      },
    },
  },
  formOptions: {
    schema: [
      {
        fieldName: 'dictName',
        label: '字典名称',
        component: 'Input',
      },
      {
        fieldName: 'dictType',
        label: '字典类型',
        component: 'Input',
      },
      {
        fieldName: 'status',
        label: '状态',
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { label: '启用', value: '0' },
            { label: '禁用', value: '1' },
          ],
        },
      },
    ],
  },
});
```

### 字典数据管理

```vue
<!-- src/views/system/dict/modules/dict-data-form.vue -->
<template>
  <Form v-bind="formProps" />
</template>

<script setup lang="ts">
import { useVbenForm } from '#/adapter/form';
import { getDictDataDetailApi, saveDictDataApi } from '#/api/system/dict';
import { handleFormOpenChange } from '#/composables/useFormModal';
import { statusRadioField } from '#/composables/useDataHelper';

const [Form, formApi] = useVbenForm({
  schema: [
    {
      fieldName: 'dictLabel',
      label: '字典标签',
      component: 'Input',
      rules: 'required',
    },
    {
      fieldName: 'dictValue',
      label: '字典值',
      component: 'Input',
      rules: 'required',
    },
    {
      fieldName: 'dictSort',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
    },
    {
      fieldName: 'listClass',
      label: '表格回显色',
      component: 'Select',
      componentProps: {
        options: [
          { label: '默认', value: '' },
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
          { label: '信息', value: 'info' },
        ],
      },
    },
    statusRadioField('状态'),
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      componentProps: {
        rows: 3,
        placeholder: '请输入备注',
      },
    },
  ],
  handleSubmit: async (values) => {
    await saveDictDataApi(values);
    message.success('保存成功');
    formModalApi.close();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = formModalApi.getData();
      handleFormOpenChange(formApi, formModalApi, data, {
        getDetailApi: getDictDataDetailApi,
        idField: 'dictCode',
      });
    }
  },
});
</script>
```

---

## 菜单管理

### 功能说明

菜单管理用于配置系统的路由和菜单结构，支持多级菜单。

### 树形展示

```typescript
// src/views/system/menu/list.vue
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMenuListApi } from '#/api/system/menu';

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    treeConfig: {
      children: 'children',
      expandAll: true,
    },
    columns: [
      { field: 'menuName', title: '菜单名称', minWidth: 150, treeNode: true },
      { field: 'icon', title: '图标', width: 80 },
      { field: 'orderNum', title: '排序', width: 80 },
      { field: 'component', title: '组件路径', minWidth: 200 },
      { field: 'path', title: '路由地址', minWidth: 150 },
      { field: 'perms', title: '权限标识', minWidth: 150 },
      { field: 'type', title: '类型', width: 80 },
      { field: 'visible', title: '可见', width: 80 },
      { field: 'status', title: '状态', width: 80 },
    ],
  },
  async onReady() {
    const menus = await getMenuListApi({});
    gridApi.grid.loadData(menus);
  },
});
```

### 菜单类型

```typescript
// M 目录
// C 菜单
// F 按钮

const menuTypes = [
  { label: '目录', value: 'M' },
  { label: '菜单', value: 'C' },
  { label: '按钮', value: 'F' },
];
```

---

## 参数配置

### 功能说明

参数配置用于管理系统的配置参数。

```typescript
// src/views/system/config/list.vue
const columns = [
  { field: 'configId', title: '参数 ID', width: 80 },
  { field: 'configName', title: '参数名称', minWidth: 150 },
  { field: 'configKey', title: '参数键名', minWidth: 150 },
  { field: 'configValue', title: '参数键值', minWidth: 200 },
  { field: 'configType', title: '内置', width: 80 },
  { field: 'remark', title: '备注', minWidth: 200 },
  { field: 'createTime', title: '创建时间', width: 160 },
];

// 内置类型渲染
{
  field: 'configType',
  title: '内置',
  width: 80,
  slots: {
    default: ({ row }) => h(Tag, { color: row.configType === 'Y' ? 'green' : 'red' }, () => row.configType === 'Y' ? '是' : '否'),
  },
}
```

---

## 通知管理

### 功能说明

通知管理用于发布系统通知和公告。

```vue
<template>
  <PageWrapper title="通知管理">
    <VxeGrid v-bind="gridProps">
      <template #noticeContent_default="{ row }">
        <span v-html="truncateHtml(row.noticeContent)"></span>
      </template>
    </VxeGrid>
  </PageWrapper>
</template>

<script setup lang="ts">
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getNoticeListApi } from '#/api/system/notice';

function truncateHtml(html: string) {
  const text = html.replace(/<[^>]+>/g, '');
  return text.length > 50 ? text.substring(0, 50) + '...' : text;
}
</script>
```

---

## 日志管理

### 登录日志

```typescript
// src/views/system/logininfor/list.vue
const columns = [
  { field: 'infoId', title: '访问 ID', width: 100 },
  { field: 'userName', title: '用户名', width: 120 },
  { field: 'ipaddr', title: '登录 IP', width: 130 },
  { field: 'loginLocation', title: '登录地点', width: 120 },
  { field: 'browser', title: '浏览器', width: 120 },
  { field: 'os', title: '操作系统', width: 120 },
  { field: 'status', title: '状态', width: 80 },
  { field: 'msg', title: '描述', minWidth: 200 },
  { field: 'loginTime', title: '登录时间', width: 160 },
];

// 状态渲染
{
  field: 'status',
  title: '状态',
  width: 80,
  slots: {
    default: ({ row }) => h(Tag, {
      color: row.status === '0' ? 'green' : 'red'
    }, () => row.status === '0' ? '成功' : '失败'),
  },
}
```

### 操作日志

```typescript
// src/views/system/operlog/list.vue
const columns = [
  { field: 'operId', title: '日志 ID', width: 100 },
  { field: 'title', title: '系统模块', width: 150 },
  { field: 'businessType', title: '操作类型', width: 100 },
  { field: 'method', title: '请求方法', width: 150 },
  { field: 'requestMethod', title: '请求方式', width: 100 },
  { field: 'operName', title: '操作人员', width: 100 },
  { field: 'deptName', title: '部门名称', width: 120 },
  { field: 'operIp', title: '主机', width: 130 },
  { field: 'operLocation', title: '操作地点', width: 120 },
  { field: 'status', title: '操作状态', width: 100 },
  { field: 'operTime', title: '操作时间', width: 160 },
];
```

---

## 相关文档

- [API 接口文档](./API.md)
- [进阶开发指南](./ADVANCED.md)
- [主使用文档](./README.md)

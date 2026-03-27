# Vben Admin Vxe-Table 使用指南

基于 vue-vben-admin 5.7.0 的表格组件完整使用文档。

---

## 一、核心架构

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    useVbenVxeGrid (Hook)                    │
│  返回：[Grid 组件，gridApi 实例]                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      VxeGridApi (状态管理)                   │
│  - store: 响应式状态 store                                   │
│  - grid: VxeGridInstance 引用（原生实例）                     │
│  - formApi: 关联的表单 API                                    │
│  - 方法：query, reload, setState, setLoading...             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  VbenVxeGrid.vue (封装组件)                  │
│  - 集成 VbenForm (搜索表单)                                  │
│  - 集成 VxeGrid (vxe-table 表格)                             │
│  - 处理 toolbar、slots、events                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 源码结构

```
packages/effects/plugins/src/vxe-table/
├── api.ts              # VxeGridApi 类定义
├── init.ts             # 初始化和配置
├── use-vxe-grid.ts     # Hook 导出
├── use-vxe-grid.vue    # 核心组件
├── types.ts            # 类型定义
└── extends.ts          # 扩展功能（表单值注入、格式化器）

apps/web-antd/src/adapter/
└── vxe-table.ts        # 项目级配置（渲染器注册、全局配置）
```

### 1.3 API 层次关系

```typescript
// gridApi 是 Vben 封装的 API
gridApi.query()          // ✅ 封装方法
gridApi.reload()         // ✅ 封装方法
gridApi.setState()       // ✅ 封装方法
gridApi.grid             // 原生 VxeGridInstance

// gridApi.grid 是 vxe-table 原生实例
gridApi.grid.getCheckboxRecords()   // ✅ 原生方法
gridApi.grid.getData()              // ✅ 原生方法
gridApi.grid.clearCheckboxRow()     // ✅ 原生方法
```

---

## 二、快速开始

### 2.1 最简配置

```typescript
import { useVbenVxeGrid } from '#/adapter/vxe-table';

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { field: 'name', title: '名称' },
      { field: 'age', title: '年龄' },
    ],
    data: [
      { id: 1, name: '张三', age: 25 },
      { id: 2, name: '李四', age: 30 },
    ],
  },
});
```

### 2.2 标准 CRUD 列表

**目录结构**：
```
views/system/role/
├── list.vue          # 列表页面
├── data.ts           # 列定义和表单配置
└── modules/
    └── form.vue      # 编辑表单
```

**list.vue**：
```vue
<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRole, getRoleList } from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

// 1. 创建 Drawer（编辑/新增弹窗）
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// 2. 创建 Grid
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getRoleList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'roleId',
    },
    toolbarConfig: {
      custom: true,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemRoleApi.SystemRolePageQuery>,
});

// 3. 操作点击回调
function onActionClick({ code, row }: { code: string; row: any }) {
  switch (code) {
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
  }
}

function onEdit(row: any) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: any) {
  Modal.confirm({
    title: '确认',
    content: `确认删除 ${row.roleName} 吗？`,
    onOk: async () => {
      await deleteRole(row.roleId);
      message.success('删除成功');
      gridApi.query();
    },
  });
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <Grid :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增角色
        </Button>
      </template>
    </Grid>
  </Page>
</template>
```

---

## 三、配置详解

### 3.1 formOptions（搜索表单）

```typescript
formOptions: {
  // 表单字段配置
  schema: [
    {
      component: 'Input',
      fieldName: 'userName',
      label: '用户名称',
      rules: 'required',
      componentProps: {
        placeholder: '请输入用户名称',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        allowClear: true,
        options: [
          { label: '正常', value: '0' },
          { label: '停用', value: '1' },
        ],
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '创建时间',
    },
  ],

  // 行为配置
  submitOnChange: true,      // 字段变化时自动提交
  showCollapseButton: true,  // 显示展开/折叠按钮
  submitOnEnter: false,      // 回车不提交

  // 字段映射（日期范围拆分）
  fieldMappingTime: [
    ['createTime', ['startTime', 'endTime']],
  ],

  // 自定义按钮
  submitButtonOptions: {
    content: '搜索',
  },
  resetButtonOptions: {
    content: '重置',
  },
}
```

### 3.2 gridOptions（表格配置）

```typescript
gridOptions: {
  // ========== 列定义 ==========
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', title: '序号', width: 60 },
    {
      field: 'userName',
      title: '用户名称',
      width: 150,
      align: 'center',
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      cellRender: {
        name: 'CellTag',
        options: [
          { label: '正常', value: '0', color: 'success' },
          { label: '停用', value: '1', color: 'error' },
        ],
      },
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
      formatter: 'formatDateTime',
    },
  ],

  // ========== 高度配置 ==========
  height: 'auto',   // 自适应高度
  // height: 600,   // 固定高度

  // ========== 分页配置 ==========
  pagerConfig: {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },

  // ========== 代理配置（数据加载核心）==========
  proxyConfig: {
    ajax: {
      query: async ({ page, sorts, filters }, formValues) => {
        // page: { currentPage, pageSize, total }
        // formValues: 搜索表单的值
        return await api.getList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },

  // ========== 行配置 ==========
  rowConfig: {
    keyField: 'userId',   // 主键字段（必填）
    useKey: true,
  },

  // ========== 工具栏配置 ==========
  toolbarConfig: {
    custom: true,     // 列设置
    export: false,    // 导出
    refresh: true,    // 刷新按钮
    search: true,     // 搜索按钮
    zoom: true,       // 缩放
  },

  // ========== 复选框配置 ==========
  checkboxConfig: {
    reserveCheckbox: true,  // 翻页保留选中状态
  },

  // ========== 树形表配置 ==========
  treeConfig: {
    parentField: 'parentId',
    rowField: 'deptId',
    transform: false,  // 后端已返回树形结构
  },
}
```

### 3.3 数据返回格式

后端 API 返回数据格式需符合以下结构（可在 `vxe-table.ts` 中配置）：

```typescript
// 默认配置
proxyConfig: {
  response: {
    result: 'rows',   // 数据列表字段名
    total: 'total',   // 总数字段名
    list: 'rows',     // 列表字段名
  },
}

// 期望的后端返回格式
{
  rows: [...],        // 数据列表
  total: 100,         // 总数
}
```

### 3.4 gridEvents（表格事件）

```typescript
gridEvents: {
  // 单元格点击
  cellClick: ({ row, column }) => {
    console.log('cell click', row, column);
  },

  // 复选框选择变化
  checkboxChange: ({ records }) => {
    selectedIds.value = records.map(r => r.id);
  },

  // 行双击
  cellDblclick: ({ row }) => {
    onEdit(row);
  },
}
```

---

## 四、单元格渲染器

### 4.1 CellTag（标签渲染）

```typescript
{
  field: 'status',
  title: '状态',
  cellRender: {
    name: 'CellTag',
    options: [
      { label: '正常', value: '0', color: 'success' },
      { label: '停用', value: '1', color: 'error' },
      { label: '待审核', value: '2', color: 'warning' },
    ],
  },
}
```

### 4.2 CellSwitch（开关切换）

```typescript
{
  field: 'status',
  title: '状态',
  width: 100,
  cellRender: {
    name: 'CellSwitch',
    attrs: {
      // 切换前回调，返回 false 阻止切换
      beforeChange: async (newStatus: string, row: any) => {
        const confirmed = await Modal.confirm({
          title: '确认',
          content: `确认${newStatus === '0' ? '启用' : '禁用'}吗？`,
        });
        if (confirmed) {
          await api.updateStatus(row.id, newStatus);
          message.success('操作成功');
          return true;  // 允许切换
        }
        return false;  // 阻止切换
      },
    },
  },
}
```

### 4.3 CellOperation（操作列）

支持内联按钮和"更多"下拉菜单的自动折叠。

**基础用法**：
```typescript
{
  field: 'operation',
  title: '操作',
  width: 180,
  fixed: 'right',
  cellRender: {
    name: 'CellOperation',
    attrs: {
      onClick: onActionClick,
      nameField: 'roleName',  // 用于删除确认提示
    },
    options: ['edit', 'delete'],  // 使用预设
  },
}
```

**自动折叠到"更多"下拉**：
```typescript
{
  field: 'operation',
  title: '操作',
  width: 180,
  fixed: 'right',
  cellRender: {
    name: 'CellOperation',
    attrs: {
      onClick: onActionClick,
      nameField: 'roleName',
      maxInline: 2,  // 最多显示2个内联按钮，其余放入"更多"下拉
    },
    options: [
      { code: 'edit', text: '编辑' },
      { code: 'delete', text: '删除' },
      { code: 'allocateDataScope', text: '数据权限' },  // 折叠到"更多"
      { code: 'allocateUser', text: '分配用户' },       // 折叠到"更多"
    ],
  },
}
```

**渲染效果**：`[编辑] [删除] [更多▼]`

**完整配置**：
```typescript
{
  field: 'operation',
  title: '操作',
  width: 280,
  fixed: 'right',
  cellRender: {
    name: 'CellOperation',
    attrs: {
      onClick: onActionClick,
      nameField: 'roleName',
      maxInline: 2,  // 可选，默认不限制
    },
    options: [
      // 字符串形式（使用预设）
      'edit',
      'delete',
      // 对象形式（自定义）
      { code: 'view', text: '查看' },
      { code: 'allocateUser', text: '分配用户' },
      { code: 'allocateDataScope', text: '数据权限' },
      // 带条件
      {
        code: 'cancel',
        text: '取消授权',
        danger: true,
        show: (row) => row.status === '0',  // 条件显示
      },
      // 带图标（在下拉菜单中显示）
      {
        code: 'export',
        text: '导出',
        icon: 'mdi:download',
      },
    ],
  },
}
```

**attrs 配置项**：

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `onClick` | 点击回调函数 | `({ code, row }) => void` | - |
| `nameField` | 删除确认时的名称字段 | `string` | `'name'` |
| `nameTitle` | 删除确认标题中的名称 | `string` | - |
| `maxInline` | 最多内联按钮数量，超过则折叠到"更多" | `number` | `Infinity` |

**options 配置**：
```typescript
options: [
  // 预设（字符串）
  'edit',    // 编辑
  'delete',  // 删除（带确认弹窗）

  // 自定义（对象）
  {
    code: 'custom',     // 操作码（必填）
    text: '自定义操作', // 显示文本
    icon: 'mdi:star',   // 图标（下拉菜单中显示）
    danger: true,       // 危险样式（红色）
    show: true,         // 或 (row) => boolean，条件显示
  },
]
```

**预设按钮**：
| code | 说明 | 样式 |
|------|------|------|
| `edit` | 编辑 | 默认 |
| `delete` | 删除 | danger，带确认弹窗 |

**回调函数**：
```typescript
function onActionClick({ code, row }: { code: string; row: any }) {
  switch (code) {
    case 'edit': onEdit(row); break;
    case 'delete': onDelete(row); break;
    case 'view': onView(row); break;
    case 'allocateUser': onAllocateUser(row); break;
    case 'allocateDataScope': onAllocateDataScope(row); break;
  }
}
```

**使用示例**：
```vue
<script setup lang="ts">
import { useVbenVxeGrid } from '#/adapter/vxe-table';

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      // ... 其他列
      {
        field: 'operation',
        title: '操作',
        width: 180,
        fixed: 'right',
        cellRender: {
          name: 'CellOperation',
          attrs: {
            onClick: handleAction,
            nameField: 'roleName',
            maxInline: 2,
          },
          options: [
            { code: 'edit', text: '编辑' },
            { code: 'delete', text: '删除' },
            { code: 'dataScope', text: '数据权限' },
            { code: 'allocateUser', text: '分配用户' },
          ],
        },
      },
    ],
  },
});

function handleAction({ code, row }: { code: string; row: any }) {
  switch (code) {
    case 'edit':
      openEditModal(row);
      break;
    case 'delete':
      deleteRow(row);
      break;
    case 'dataScope':
      openDataScopeModal(row);
      break;
    case 'allocateUser':
      openAllocateUser(row);
      break;
  }
}
</script>
```

### 4.4 CellImage（图片渲染）

```typescript
{
  field: 'avatar',
  title: '头像',
  width: 80,
  cellRender: {
    name: 'CellImage',
    props: {
      width: 50,
      height: 50,
    },
  },
}
```

### 4.5 CellInput（可编辑输入框）

支持行内编辑的文本输入框。

**基础用法**：
```typescript
{
  field: 'name',
  title: '名称',
  width: 150,
  cellRender: {
    name: 'CellInput',
    attrs: {
      onChange: (val, row) => {
        console.log('值变化:', val, row);
      },
      onBlur: (val, row) => {
        // 失焦时保存
        saveRow(row);
      },
    },
  },
}
```

**完整配置**：
```typescript
{
  field: 'remark',
  title: '备注',
  width: 200,
  cellRender: {
    name: 'CellInput',
    attrs: {
      onChange: (val, row) => {
        // 值变化时更新
        row.remark = val;
      },
      onBlur: (val, row) => {
        // 失焦时保存到后端
        updateRow(row);
      },
    },
    props: {
      placeholder: '请输入备注',
      maxlength: 100,
      allowClear: true,
    },
  },
}
```

### 4.6 CellInputNumber（可编辑数字框）

支持行内编辑的数字输入框。

**基础用法**：
```typescript
{
  field: 'orderNum',
  title: '排序',
  width: 100,
  cellRender: {
    name: 'CellInputNumber',
    attrs: {
      onChange: (val, row) => {
        console.log('值变化:', val, row);
      },
    },
  },
}
```

**完整配置**：
```typescript
{
  field: 'price',
  title: '价格',
  width: 120,
  cellRender: {
    name: 'CellInputNumber',
    attrs: {
      onChange: (val, row) => {
        row.price = val;
      },
      onBlur: (val, row) => {
        updateRow(row);
      },
    },
    props: {
      min: 0,
      max: 99999,
      precision: 2,       // 小数精度
      step: 1,            // 步长
      controls: false,    // 隐藏增减按钮
      placeholder: '请输入价格',
    },
  },
}
```

**props 配置**：

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `min` | 最小值 | `number` | `0` |
| `max` | 最大值 | `number` | `Infinity` |
| `precision` | 小数精度 | `number` | `0` |
| `step` | 步长 | `number` | `1` |
| `controls` | 是否显示增减按钮 | `boolean` | `false` |
| `bordered` | 是否显示边框 | `boolean` | `false` |

### 4.7 CellLink（链接渲染）

```typescript
{
  field: 'link',
  title: '链接',
  cellRender: {
    name: 'CellLink',
    props: {
      text: '点击查看',
    },
  },
}
```

### 4.8 自定义渲染器

在 `apps/web-antd/src/adapter/vxe-table.ts` 中添加：

```typescript
vxeUI.renderer.add('MyCustomCell', {
  renderTableDefault(renderOpts, params) {
    const { props } = renderOpts;
    const { row, column } = params;
    return h('div', {}, row[column.field]);
  },
});

// 使用
{
  field: 'custom',
  cellRender: {
    name: 'MyCustomCell',
    props: { /* 自定义 props */ },
  },
}
```

---

## 五、API 方法详解

### 5.1 VxeGridApi 封装方法

```typescript
// ========== 数据操作 ==========

// 查询（保留当前页码）
gridApi.query();
gridApi.query({ customParam: 'value' });

// 重新加载（回到第一页）
gridApi.reload();
gridApi.reload({ customParam: 'value' });

// ========== 状态操作 ==========

// 设置加载状态
gridApi.setLoading(true);

// 更新配置
gridApi.setState({
  gridOptions: { loading: true },
});

// 更新表格配置
gridApi.setGridOptions({ height: 400 });

// ========== 搜索表单 ==========

// 切换搜索表单显示
gridApi.toggleSearchForm();       // 切换
gridApi.toggleSearchForm(true);   // 显示
gridApi.toggleSearchForm(false);  // 隐藏

// ========== 表单操作 ==========

// 获取表单值
const values = await gridApi.formApi.getValues();

// 重置表单
await gridApi.formApi.resetForm();

// 获取最新提交的表单值
const submittedValues = gridApi.formApi.getLatestSubmissionValues();
```

### 5.2 gridApi.grid 原生方法

> **重要**：复选框、数据操作等需要通过 `gridApi.grid` 访问原生实例。

```typescript
// ========== 选中操作 ==========

// 获取复选框选中行
const selectedRows = gridApi.grid.getCheckboxRecords();
const selectedIds = selectedRows.map(row => row.id);

// 获取单选选中行
const selectedRow = gridApi.grid.getRadioRecord();

// 设置行选中
gridApi.grid.setCheckboxRow(row, true);
gridApi.grid.setCheckboxRow([row1, row2], true);

// 全选/取消全选
gridApi.grid.setAllCheckboxRow(true);
gridApi.grid.setAllCheckboxRow(false);

// 清除选中
gridApi.grid.clearCheckboxRow();

// 判断行是否选中
const isChecked = gridApi.grid.isCheckedByCheckboxRow(row);

// ========== 数据操作 ==========

// 获取表格数据
const data = gridApi.grid.getData();
const data = gridApi.grid.getData(0, 10);  // 分页获取

// 重新加载数据
gridApi.grid.reloadData(newData);

// 添加行
gridApi.grid.insertAt(newRow, -1);  // 最后
gridApi.grid.insertAt(newRow, 0);   // 开头

// 删除行
gridApi.grid.remove(row);
gridApi.grid.removeCheckboxRow();  // 删除选中的行

// 更新行数据
gridApi.grid.updateRow(row, { status: '1' });

// 获取行索引
const rowIndex = gridApi.grid.getRowIndex(row);

// ========== 表格操作 ==========

// 重新计算布局
gridApi.grid.recalculate();

// 清空表格
gridApi.grid.clearData();

// 滚动到指定行
gridApi.grid.scrollToRow(row);

// 获取分页信息
const pagerInfo = gridApi.grid.getProxyInfo();
// { currentPage: 1, pageSize: 20, total: 100 }
```

### 5.3 方法速查表

| 方法 | 归属 | 说明 |
|------|------|------|
| `query()` | gridApi | 查询（保留页码） |
| `reload()` | gridApi | 重载（回第一页） |
| `setState()` | gridApi | 更新状态 |
| `setLoading()` | gridApi | 设置加载状态 |
| `toggleSearchForm()` | gridApi | 切换搜索表单 |
| `getCheckboxRecords()` | gridApi.grid | 获取选中行 |
| `clearCheckboxRow()` | gridApi.grid | 清除选中 |
| `setCheckboxRow()` | gridApi.grid | 设置选中 |
| `getData()` | gridApi.grid | 获取数据 |
| `reloadData()` | gridApi.grid | 重载数据 |
| `recalculate()` | gridApi.grid | 重算布局 |

---

## 六、插槽（Slots）

### 6.1 内置插槽

```vue
<Grid>
  <!-- 表格标题 -->
  <template #table-title>
    <span>角色列表</span>
  </template>

  <!-- 工具栏左侧（操作按钮区） -->
  <template #toolbar-actions>
    <Button type="primary" @click="onCreate">新增</Button>
    <Button @click="onBatchDelete">批量删除</Button>
  </template>

  <!-- 工具栏右侧 -->
  <template #toolbar-tools>
    <Button @click="onExport">导出</Button>
  </template>

  <!-- 列自定义渲染 -->
  <template #status="{ row }">
    <Tag :color="row.status === '0' ? 'success' : 'error'">
      {{ row.status === '0' ? '正常' : '停用' }}
    </Tag>
  </template>

  <!-- 空状态 -->
  <template #empty>
    <div class="text-center py-8">
      <Icon icon="mdi:inbox" class="size-12 text-gray-400" />
      <div class="mt-2 text-gray-500">暂无数据</div>
    </div>
  </template>

  <!-- 加载状态 -->
  <template #loading>
    <VbenLoading :spinning="true" />
  </template>
</Grid>
```

### 6.2 表单插槽

```vue
<Grid>
  <!-- 表单字段自定义渲染 -->
  <template #form-status="slotProps">
    <Select v-bind="slotProps">
      <SelectOption value="0">正常</SelectOption>
      <SelectOption value="1">停用</SelectOption>
    </Select>
  </template>

  <!-- 按钮区域插槽 -->
  <template #reset-before>
    <Button @click="onCustomReset">自定义重置</Button>
  </template>

  <template #submit-before>
    <Button @click="onExport">导出</Button>
  </template>

  <template #expand-before>
    <span class="text-gray-500">更多筛选</span>
  </template>

  <template #expand-after>
    <Button size="small" @click="onAdvanceSearch">高级搜索</Button>
  </template>
</Grid>
```

---

## 七、常见场景

### 7.1 树形表格

```typescript
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      {
        field: 'deptName',
        title: '部门名称',
        treeNode: true,  // 开启树形节点
        width: 250,
      },
      // ... 其他列
    ],
    treeConfig: {
      parentField: 'parentId',
      rowField: 'deptId',
      transform: false,  // 后端已返回树形结构
    },
    pagerConfig: {
      enabled: false,  // 树形表通常不分页
    },
    proxyConfig: {
      ajax: {
        query: async () => {
          return await getDeptList();  // 返回树形数据
        },
      },
    },
  },
});
```

### 7.2 批量操作

```vue
<script setup>
const selectedIds = ref<number[]>([]);

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    checkboxConfig: {
      reserveCheckbox: true,  // 翻页保留选中
    },
    columns: [
      { type: 'checkbox', width: 50 },
      // ... 其他列
    ],
  },
  gridEvents: {
    checkboxChange: ({ records }) => {
      selectedIds.value = records.map(r => r.id);
    },
  },
});

async function onBatchDelete() {
  if (selectedIds.value.length === 0) {
    message.warning('请选择数据');
    return;
  }

  Modal.confirm({
    title: '确认',
    content: `确认删除选中的 ${selectedIds.value.length} 条数据吗？`,
    onOk: async () => {
      await api.batchDelete(selectedIds.value);
      message.success('删除成功');
      gridApi.grid.clearCheckboxRow();
      gridApi.query();
    },
  });
}
</script>

<template>
  <Grid>
    <template #toolbar-actions>
      <Button
        type="primary"
        danger
        :disabled="selectedIds.length === 0"
        @click="onBatchDelete"
      >
        批量删除 ({{ selectedIds.length }})
      </Button>
    </template>
  </Grid>
</template>
```

### 7.3 日期范围查询

```typescript
formOptions: {
  fieldMappingTime: [
    ['dateRange', ['startDate', 'endDate']],
  ],
  schema: [
    {
      component: 'RangePicker',
      fieldName: 'dateRange',
      label: '日期范围',
    },
  ],
}

// query 方法接收到的 formValues:
// { startDate: '2024-01-01', endDate: '2024-01-31' }
```

### 7.4 Modal 内嵌表格

```vue
<script setup>
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [...],
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          return await getUserList({ pageNum: page.currentPage });
        },
      },
    },
  },
});

// 弹窗打开时加载数据
watch(() => props.open, (open) => {
  if (open) {
    gridApi.reload();
  }
});

// 获取选中数据
function getSelected() {
  return gridApi.grid.getCheckboxRecords();
}

defineExpose({ getSelected });
</script>
```

### 7.5 动态列配置

```typescript
const columns = ref([]);

async function loadColumns() {
  const { data } = await api.getColumns();
  columns.value = data.map(item => ({
    field: item.field,
    title: item.title,
    width: item.width,
  }));
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: columns,  // 响应式列配置
  },
});

onMounted(loadColumns);
```

---

## 八、全局配置

### 8.1 默认配置

在 `apps/web-antd/src/adapter/vxe-table.ts` 中：

```typescript
setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          enabled: false,  // 禁用 vxe-table 内置表单
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'rows',
            total: 'total',
            list: 'rows',
          },
        },
        round: true,
        showOverflow: true,
        size: 'small',
      },
    });
  },
  useVbenForm,
});
```

### 8.2 自定义格式化器

```typescript
vxeUI.formats.add('formatMoney', {
  tableCellFormatMethod({ cellValue }) {
    return `¥${Number(cellValue).toFixed(2)}`;
  },
});

// 使用
{
  field: 'amount',
  title: '金额',
  formatter: 'formatMoney',
}
```

---

## 九、数据流向

```
用户操作
   │
   ├─ 点击搜索
   │      │
   │      ↓
   │   formApi.handleSubmit()
   │      │
   │      ↓
   │   formApi.setLatestSubmissionValues()
   │      │
   │      ↓
   │   props.api.reload(formValues)
   │      │
   │      ↓
   │   grid.commitProxy('query', formValues)
   │      │
   │      ↓
   │   proxyConfig.ajax.query({ page }, formValues)
   │      │
   │      ↓
   │   API 请求 → 返回数据 → 渲染表格
   │
   ├─ 翻页
   │      │
   │      ↓
   │   vxe-table 内部 page-change
   │      │
   │      ↓
   │   grid.commitProxy('query')
   │      │
   │      ↓
   │   proxyConfig.ajax.query({ page }, formValues)
   │
   └─ submitOnChange
          │
          ↓
       字段值变化 → formApi.submit() → reload
```

---

## 十、注意事项

### 10.1 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `getCheckboxRecords` 类型错误 | 在 gridApi 上调用 | 使用 `gridApi.grid.getCheckboxRecords()` |
| 数据不刷新 | 直接修改 row 对象 | 使用 `gridApi.reload()` 或 `gridApi.query()` |
| 选中状态丢失 | 翻页后清空 | 配置 `checkboxConfig.reserveCheckbox: true` |
| 操作列不显示 | 配置错误 | 使用 `CellOperation` + `options` |
| 搜索表单不显示 | 未配置 | 设置 `formOptions.schema` + `toolbarConfig.search: true` |
| 表单值未传递 | proxyConfig 未配置 | 确保 `proxyConfig.ajax.query` 已配置 |

### 10.2 性能优化

```typescript
// 1. 大数据量使用虚拟滚动
gridOptions: {
  height: 600,
  scrollY: {
    enabled: true,
  },
}

// 2. 不需要编辑时禁用 keepSource
gridOptions: {
  keepSource: false,
}

// 3. 使用分页
gridOptions: {
  pagerConfig: {
    enabled: true,
    pageSize: 20,
  },
}
```

### 10.3 类型定义

```typescript
import type {
  VxeTableGridOptions,
  VxeTableGridColumns,
  OnActionClickFn,
  OnActionClickParams,
} from '#/adapter/vxe-table';

// 使用泛型
const [Grid, gridApi] = useVbenVxeGrid<SystemRoleApi.SystemRole>({
  gridOptions: {
    columns: columns as VxeTableGridColumns<SystemRoleApi.SystemRole>,
  } as VxeTableGridOptions<SystemRoleApi.SystemRole>,
});

// 操作回调类型
function onActionClick({ code, row }: OnActionClickParams<SystemRoleApi.SystemRole>) {
  // row 已有类型提示
}
```

---

## 十一、参考资源

- [vxe-table 官方文档](https://vxetable.cn/)
- [vxe-table API](https://vxetable.cn/#/table/api)
- [vxe-table 方法](https://vxetable.cn/#/table/api/methods)
- [Vben Admin 文档](https://doc.vben.pro/)
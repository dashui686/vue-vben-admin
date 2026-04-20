import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

const SYS_NORMAL_DISABLE = [
  { label: '正常', value: '0', color: 'success' },
  { label: '停用', value: '1', color: 'error' },
];

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'componentName',
    label: '组件名称',
  },
  {
    component: 'Input',
    fieldName: 'methodName',
    label: '方法名称',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '组件名称',
    field: 'componentName',
    formatter: ({ cellValue }) => cellValue ?? '-',
  },
  {
    title: '方法名称',
    field: 'methodName',
    formatter: ({ cellValue }) => cellValue ?? '-',
  },
  {
    title: '参数名称',
    field: 'methodParams',
  },
  {
    title: 'Spel表达式',
    field: 'viewSpel',
  },
  {
    title: '状态',
    field: 'status',
    width: 120,
    slots: {
      default: ({ row }: any) => {
        const item = SYS_NORMAL_DISABLE.find((o) => o.value === row.status);
        if (!item) return row.status;
        return h(Tag, { color: item.color }, () => item.label);
      },
    },
  },
  {
    title: '备注',
    field: 'remark',
  },
  {
    title: '创建时间',
    field: 'createTime',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
  },
];

export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: 'id',
  },
  {
    component: 'Input',
    fieldName: 'componentName',
    label: '组件名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'methodName',
    label: '方法名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'methodParams',
    label: '参数名称',
  },
  {
    component: 'Input',
    fieldName: 'viewSpel',
    label: 'Spel表达式',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: SYS_NORMAL_DISABLE,
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'status',
    label: '状态',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];

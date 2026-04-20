import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

import { WF_BUSINESS_STATUS } from '../components/dict';
import { activityStatusOptions } from '../processDefinition/constant';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    label: '任务名称',
    fieldName: 'nodeName',
  },
  {
    component: 'Input',
    label: '流程名称',
    fieldName: 'flowName',
  },
  {
    component: 'Input',
    label: '流程编码',
    fieldName: 'flowCode',
  },
];

function renderStatusTag(
  value: number | string,
  options: { color?: string; label: string; value: number | string; }[],
) {
  const item = options.find((o) => o.value === value);
  if (!item) return value;
  return h(Tag, { color: item.color }, () => item.label);
}

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'flowName',
    title: '流程名称',
    minWidth: 150,
  },
  {
    field: 'nodeName',
    title: '任务名称',
    minWidth: 150,
  },
  {
    field: 'flowCode',
    title: '流程编码',
    minWidth: 150,
  },
  {
    field: 'createByName',
    title: '申请人',
    minWidth: 150,
  },
  {
    field: 'version',
    title: '版本号',
    minWidth: 150,
    formatter: ({ cellValue }) => `V${cellValue}.0`,
  },
  {
    field: 'activityStatus',
    title: '状态',
    minWidth: 100,
    slots: {
      default: ({ row }: any) => {
        return renderStatusTag(row.activityStatus, activityStatusOptions);
      },
    },
  },
  {
    field: 'flowStatus',
    title: '流程状态',
    minWidth: 100,
    slots: {
      default: ({ row }: any) => {
        const item = WF_BUSINESS_STATUS.find((o) => o.value === row.flowStatus);
        if (!item) return row.flowStatus;
        return h(Tag, { color: item.color }, () => item.label);
      },
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 200,
  },
];

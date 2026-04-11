import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { ToolGenApi } from '#/api/tool/gen';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'tableName',
      label: '表名称',
      componentProps: { placeholder: '请输入表名称' },
    },
    {
      component: 'Input',
      fieldName: 'tableComment',
      label: '表描述',
      componentProps: { placeholder: '请输入表描述' },
    },
    {
      component: 'RangePicker',
      fieldName: 'dateRange',
      label: '创建时间',
      componentProps: {
        class: 'w-full',
        placeholder: ['开始日期', '结束日期'],
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ];
}

export function useColumns(
  onActionClick?: OnActionClickFn<ToolGenApi.GenTable>,
): VxeTableGridColumns<ToolGenApi.GenTable> {
  return [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 50, title: '#' },
    { field: 'tableName', title: '表名称', minWidth: 140 },
    { field: 'tableComment', title: '表描述', minWidth: 140 },
    { field: 'className', title: '实体类', minWidth: 120 },
    { field: 'createTime', title: '创建时间', width: 160, sortable: true },
    { field: 'updateTime', title: '更新时间', width: 160, sortable: true },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'tableName',
          nameTitle: '表',
          onClick: onActionClick,
        },
        options: [
          { code: 'preview', text: '预览' },
          { code: 'edit', text: '编辑' },
          { code: 'delete', text: '删除' },
          { code: 'synchDb', text: '同步' },
          { code: 'genCode', text: '生成' },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 280,
    },
  ];
}

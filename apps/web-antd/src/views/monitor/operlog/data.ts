import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { MonitorOperlogApi } from '#/api/monitor/operlog';

const businessTypeMap: Record<number, string> = {
  0: '其它',
  1: '新增',
  2: '修改',
  3: '删除',
  4: '授权',
  5: '导出',
  6: '导入',
  7: '强退',
  8: '生成代码',
  9: '清空数据',
};

export { businessTypeMap };

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: '系统模块',
      componentProps: {
        placeholder: '请输入系统模块',
      },
    },
    {
      component: 'Input',
      fieldName: 'operName',
      label: '操作人员',
      componentProps: {
        placeholder: '请输入操作人员',
      },
    },
    {
      component: 'Select',
      fieldName: 'businessType',
      label: '操作类型',
      componentProps: {
        allowClear: true,
        placeholder: '请选择操作类型',
        options: Object.entries(businessTypeMap).map(([value, label]) => ({
          label,
          value: Number(value),
        })),
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '操作状态',
      componentProps: {
        allowClear: true,
        placeholder: '请选择操作状态',
        options: [
          { label: '成功', value: 0 },
          { label: '失败', value: 1 },
        ],
      },
    },
    {
      component: 'Input',
      fieldName: 'operIp',
      label: '操作地址',
      componentProps: {
        placeholder: '请输入操作地址',
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'operTime',
      label: '操作时间',
    },
  ];
}

export function useColumns(
  onActionClick?: OnActionClickFn<MonitorOperlogApi.SysOperLog>,
): VxeTableGridColumns<MonitorOperlogApi.SysOperLog> {
  return [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 50, title: '#' },
    { field: 'title', title: '操作模块', minWidth: 120 },
    {
      field: 'businessType',
      title: '操作类型',
      width: 100,
      formatter: ({ cellValue }) => businessTypeMap[cellValue] || cellValue,
    },
    { field: 'requestMethod', title: '请求方式', width: 100 },
    { field: 'operName', title: '操作人员', width: 120 },
    { field: 'operIp', title: '操作地址', width: 130 },
    { field: 'operLocation', title: '操作地点', width: 120 },
    {
      field: 'status',
      title: '操作状态',
      width: 100,
      cellRender: {
        name: 'CellTag',
        options: [
          { label: '成功', value: 0, color: 'success' },
          { label: '失败', value: 1, color: 'error' },
        ],
      },
    },
    { field: 'costTime', title: '耗时(ms)', width: 100, align: 'center' },
    { field: 'operTime', title: '操作时间', width: 180 },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'title',
          nameTitle: '日志',
          onClick: onActionClick,
        },
        options: [
          { code: 'detail', text: '详情' },
          { auth: 'monitor:operlog:remove', code: 'delete', text: '删除' },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
    },
  ];
}

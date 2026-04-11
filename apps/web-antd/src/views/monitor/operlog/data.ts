import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { MonitorOperlogApi } from '#/api/monitor/operlog';

const businessTypeMap: Record<number, string> = {
  0: '其它',
  1: '新增',
  2: '修改',
  3: '删除',
};

export { businessTypeMap };

export function useColumns(
  onActionClick?: OnActionClickFn<MonitorOperlogApi.SysOperLog>,
): VxeTableGridColumns<MonitorOperlogApi.SysOperLog> {
  return [
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
      cellRender: { name: 'CellTag' },
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
          { code: 'delete', text: '删除' },
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

import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { MonitorLogininforApi } from '#/api/monitor/logininfor';

export function useColumns(
  onActionClick?: OnActionClickFn<MonitorLogininforApi.SysLogininfor>,
): VxeTableGridColumns<MonitorLogininforApi.SysLogininfor> {
  return [
    { type: 'seq', width: 50, title: '#' },
    { field: 'userName', title: '用户名称', minWidth: 120 },
    { field: 'clientKey', title: '客户端', width: 120 },
    { field: 'deviceType', title: '设备类型', width: 100 },
    { field: 'ipaddr', title: '登录IP', width: 130 },
    { field: 'loginLocation', title: '登录地点', width: 120 },
    { field: 'browser', title: '浏览器', width: 120 },
    { field: 'os', title: '操作系统', width: 120 },
    {
      field: 'status',
      title: '登录状态',
      width: 100,
      cellRender: { name: 'CellTag' },
    },
    { field: 'msg', title: '提示消息', minWidth: 150 },
    { field: 'loginTime', title: '登录时间', width: 180 },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'userName',
          nameTitle: '日志',
          onClick: onActionClick,
        },
        options: [{ code: 'delete', text: '删除' }],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
    },
  ];
}

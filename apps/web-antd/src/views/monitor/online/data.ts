import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { MonitorOnlineApi } from '#/api/monitor/online';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'ipaddr',
      label: '登录地址',
      componentProps: {
        placeholder: '请输入登录地址',
      },
    },
    {
      component: 'Input',
      fieldName: 'userName',
      label: '用户名称',
      componentProps: {
        placeholder: '请输入用户名称',
      },
    },
  ];
}

export function useColumns(
  onActionClick?: OnActionClickFn<MonitorOnlineApi.SysUserOnline>,
): VxeTableGridColumns<MonitorOnlineApi.SysUserOnline> {
  return [
    { type: 'seq', width: 50, title: '#' },
    { field: 'tokenId', title: '会话编号', minWidth: 200 },
    { field: 'userName', title: '用户名称', width: 120 },
    { field: 'deptName', title: '部门名称', width: 120 },
    { field: 'clientKey', title: '客户端', width: 120 },
    { field: 'deviceType', title: '设备类型', width: 100 },
    { field: 'ipaddr', title: '登录IP', width: 130 },
    { field: 'loginLocation', title: '登录地点', width: 120 },
    { field: 'browser', title: '浏览器', width: 120 },
    { field: 'os', title: '操作系统', width: 120 },
    { field: 'loginTime', title: '登录时间', width: 180 },
    {
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'userName',
          nameTitle: '用户',
          onClick: onActionClick,
        },
        options: [
          {
            auth: 'monitor:online:forceLogout',
            code: 'forceLogout',
            text: '强退',
          },
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

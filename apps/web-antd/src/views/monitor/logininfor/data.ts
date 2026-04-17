import type { VxeTableGridColumns } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { MonitorLogininforApi } from '#/api/monitor/logininfor';

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
    {
      component: 'Select',
      fieldName: 'status',
      label: '登录状态',
      componentProps: {
        allowClear: true,
        placeholder: '请选择登录状态',
        options: [
          { label: '成功', value: '0' },
          { label: '失败', value: '1' },
        ],
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'loginTime',
      label: '登录时间',
    },
  ];
}

export function useColumns(
  onActionClick?: OnActionClickFn<MonitorLogininforApi.SysLogininfor>,
): VxeTableGridColumns<MonitorLogininforApi.SysLogininfor> {
  return [
    { type: 'checkbox', width: 50 },
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
      cellRender: {
        name: 'CellTag',
        options: [
          { label: '成功', value: '0', color: 'success' },
          { label: '失败', value: '1', color: 'error' },
        ],
      },
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
        options: [{ auth: 'monitor:logininfor:remove', code: 'delete', text: '删除' }],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
    },
  ];
}

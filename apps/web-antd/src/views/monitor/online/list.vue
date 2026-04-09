<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MonitorOnlineApi } from '#/api/monitor/online';

import { Page } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { forceLogout, getOnlineList } from '#/api/monitor/online';

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
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
            onClick: ({ code, row }: any) => {
              if (code === 'forceLogout') onForceLogout(row);
            },
          },
          options: [{ code: 'forceLogout', text: '强退' }],
        },
        field: 'operation',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
      },
    ],
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: true },
    proxyConfig: {
      ajax: {
        query: async () => {
          return await getOnlineList();
        },
      },
    },
    rowConfig: { keyField: 'tokenId' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  } as VxeTableGridOptions<MonitorOnlineApi.SysUserOnline>,
});

function onForceLogout(row: MonitorOnlineApi.SysUserOnline) {
  Modal.confirm({
    title: '确认强退',
    content: `确认要强制退出用户"${row.userName}"吗？`,
    onOk: async () => {
      await forceLogout(row.tokenId);
      message.success('强退成功');
      gridApi.query();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="在线用户" />
  </Page>
</template>

<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MonitorLogininforApi } from '#/api/monitor/logininfor';

import { Page } from '@vben/common-ui';

import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cleanLogininfor,
  deleteLogininfor,
  getLogininforList,
} from '#/api/monitor/logininfor';

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
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
            onClick: ({ code, row }: any) => {
              if (code === 'delete') onDelete(row);
            },
          },
          options: [{ code: 'delete', text: '删除' }],
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
        query: async ({ page }) => {
          return await getLogininforList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
          });
        },
      },
    },
    rowConfig: { keyField: 'infoId' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  } as VxeTableGridOptions<MonitorLogininforApi.SysLogininfor>,
});

function onDelete(row: MonitorLogininforApi.SysLogininfor) {
  deleteLogininfor(String(row.infoId)).then(() => {
    message.success('删除成功');
    gridApi.query();
  });
}

function onClean() {
  Modal.confirm({
    title: '确认清理',
    content: '确认要清空所有登录日志吗？',
    onOk: async () => {
      await cleanLogininfor();
      message.success('清理成功');
      gridApi.query();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="登录日志">
      <template #toolbar-tools>
        <Button danger @click="onClean">清空日志</Button>
      </template>
    </Grid>
  </Page>
</template>

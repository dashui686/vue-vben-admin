<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MonitorOnlineApi } from '#/api/monitor/online';

import { Page } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { forceLogout, getOnlineList } from '#/api/monitor/online';

import { useColumns } from './data';

function onActionClick({
  code,
  row,
}: OnActionClickParams<MonitorOnlineApi.SysUserOnline>) {
  if (code === 'forceLogout') onForceLogout(row);
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(onActionClick),
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

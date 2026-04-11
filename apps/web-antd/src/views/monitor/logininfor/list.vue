<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MonitorLogininforApi } from '#/api/monitor/logininfor';

import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cleanLogininfor,
  deleteLogininfor,
  getLogininforList,
} from '#/api/monitor/logininfor';

import { useColumns } from './data';

function onActionClick({
  code,
  row,
}: OnActionClickParams<MonitorLogininforApi.SysLogininfor>) {
  if (code === 'delete') onDelete(row);
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(onActionClick),
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

async function onDelete(row: MonitorLogininforApi.SysLogininfor) {
  try {
    await deleteLogininfor(String(row.infoId));
    message.success('删除成功');
    gridApi.query();
  } catch {}
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

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
  exportLogininfor,
  getLogininforList,
  unlockUser,
} from '#/api/monitor/logininfor';
import { useBatchDelete, useGridSelection } from '#/composables/useGridHelper';

import { useColumns, useGridFormSchema } from './data';

const { deleteDisabled, gridEvents } =
  useGridSelection<MonitorLogininforApi.SysLogininfor>(() => gridApi);

const { onBatchDelete } = useBatchDelete(
  () => gridApi,
  deleteLogininfor,
  'infoId',
);

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents,
  formOptions: {
    fieldMappingTime: [['loginTime', ['beginTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: true },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getLogininforList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'infoId' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  } as VxeTableGridOptions<MonitorLogininforApi.SysLogininfor>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<MonitorLogininforApi.SysLogininfor>) {
  if (code === 'delete') onDelete(row);
}

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

async function onUnlock() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length !== 1) {
    message.warning('请选择一条记录');
    return;
  }
  const userName = String(records[0]?.userName);
  Modal.confirm({
    title: '确认解锁',
    content: `确认要解锁用户"${userName}"吗？`,
    onOk: async () => {
      await unlockUser(userName);
      message.success('解锁成功');
    },
  });
}

async function onExport() {
  const formValues = await gridApi.formApi.getValues();
  await exportLogininfor(formValues);
  message.success('导出成功');
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="登录日志">
      <template #toolbar-tools>
        <Button
          v-access:code="'monitor:logininfor:remove'"
          :disabled="deleteDisabled"
          danger
          @click="onBatchDelete"
        >
          删除
        </Button>
        <Button
          v-access:code="'monitor:logininfor:remove'"
          danger
          style="margin-left: 8px"
          @click="onClean"
        >
          清空日志
        </Button>
        <Button
          v-access:code="'monitor:logininfor:unlock'"
          type="primary"
          style="margin-left: 8px"
          @click="onUnlock"
        >
          解锁
        </Button>
        <Button
          v-access:code="'monitor:logininfor:export'"
          style="margin-left: 8px"
          @click="onExport"
          >
导出
</Button>
      </template>
    </Grid>
  </Page>
</template>

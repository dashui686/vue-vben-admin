<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MonitorJobApi } from '#/api/monitor/job';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  changeJobStatus,
  deleteJob,
  exportJob,
  getJobList,
  runJob,
} from '#/api/monitor/job';
import { useBatchDelete, useGridSelection } from '#/composables/useGridHelper';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const router = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { deleteDisabled, editDisabled, gridEvents, onToolbarEdit } =
  useGridSelection<MonitorJobApi.SysJob>(() => gridApi);

const { onBatchDelete } = useBatchDelete(() => gridApi, deleteJob, 'jobId');

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents,
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: true },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getJobList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'jobId' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  } as VxeTableGridOptions<MonitorJobApi.SysJob>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<MonitorJobApi.SysJob>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'log': {
      router.push({
        name: 'MonitorJobLog',
        query: { jobId: String(row.jobId) },
      });
      break;
    }
    case 'run': {
      onRun(row);
      break;
    }
  }
}

async function onStatusChange(
  newStatus: string,
  row: MonitorJobApi.SysJob,
): Promise<boolean | undefined> {
  const text = newStatus === '0' ? '启用' : '停用';
  return new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认要${text}"${row.jobName}"任务吗？`,
      onOk: async () => {
        await changeJobStatus(row.jobId, newStatus);
        message.success(`${text}成功`);
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
    });
  });
}

function onEdit(row: MonitorJobApi.SysJob) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({}).open();
}

async function onDelete(row: MonitorJobApi.SysJob) {
  try {
    await deleteJob(String(row.jobId));
    message.success('删除成功');
    gridApi.query();
  } catch {}
}

function onRun(row: MonitorJobApi.SysJob) {
  Modal.confirm({
    title: '确认执行',
    content: `确认要立即执行一次"${row.jobName}"任务吗？`,
    onOk: async () => {
      await runJob(row.jobId, row.jobGroup);
      message.success('执行成功');
    },
  });
}

async function onExport() {
  const formValues = await gridApi.formApi.getValues();
  await exportJob(formValues);
  message.success('导出成功');
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <Grid table-title="定时任务">
      <template #toolbar-tools>
        <Button
          v-access:code="'monitor:job:add'"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          新增
        </Button>
        <Button
          v-access:code="'monitor:job:edit'"
          :disabled="editDisabled"
          style="margin-left: 8px"
          @click="onToolbarEdit(onEdit)"
        >
          {{ $t('common.edit') }}
        </Button>
        <Button
          v-access:code="'monitor:job:remove'"
          :disabled="deleteDisabled"
          danger
          style="margin-left: 8px"
          @click="onBatchDelete"
        >
          删除
        </Button>
        <Button
          v-access:code="'monitor:job:export'"
          style="margin-left: 8px"
          @click="onExport"
          >
导出
</Button>
        <Button
          style="margin-left: 8px"
          @click="router.push({ name: 'MonitorJobLog' })"
        >
          日志
        </Button>
      </template>
    </Grid>
  </Page>
</template>

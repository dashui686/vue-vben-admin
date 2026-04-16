<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MonitorJobApi } from '#/api/monitor/job';

import { computed, ref } from 'vue';
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

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const router = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
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
      onViewLog(row);
      break;
    }
    case 'run': {
      onRun(row);
      break;
    }
  }
}

async function onStatusChange(newStatus: string, row: MonitorJobApi.SysJob) {
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

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {
    checkboxChange: onSelectionChange,
    checkboxAll: onSelectionChange,
  },
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

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formModalApi.setData({}).open();
}

function onEdit(row: MonitorJobApi.SysJob) {
  formModalApi.setData(row).open();
}

function onToolbarEdit() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length !== 1) {
    message.warning('请选择一条数据');
    return;
  }
  onEdit(records[0] as MonitorJobApi.SysJob);
}

const selectedCount = ref(0);
const editDisabled = computed(() => selectedCount.value !== 1);
const deleteDisabled = computed(() => selectedCount.value === 0);

function onSelectionChange() {
  selectedCount.value = gridApi.grid.getCheckboxRecords().length;
}

async function onDelete(row: MonitorJobApi.SysJob) {
  try {
    await deleteJob(String(row.jobId));
    message.success('删除成功');
    onRefresh();
  } catch {}
}

async function onBatchDelete() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length === 0) {
    message.warning('请至少选择一条记录');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `确认要删除选中的${records.length}条记录吗？`,
    onOk: async () => {
      const jobIds = records
        .map((r: MonitorJobApi.SysJob) => r.jobId)
        .join(',');
      await deleteJob(jobIds);
      message.success('删除成功');
      onRefresh();
    },
  });
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

function onViewLog(row?: MonitorJobApi.SysJob) {
  const jobId = row?.jobId || 0;
  router.push({
    name: 'MonitorJobLog',
    query: { jobId: String(jobId) },
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
    <FormModal @success="onRefresh" />
    <Grid table-title="定时任务">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新增
        </Button>
        <Button
          :disabled="editDisabled"
          style="margin-left: 8px"
          @click="onToolbarEdit"
        >
          {{ $t('common.edit') }}
        </Button>
        <Button
          :disabled="deleteDisabled"
          danger
          style="margin-left: 8px"
          @click="onBatchDelete"
        >
          删除
        </Button>
        <Button style="margin-left: 8px" @click="onExport">导出</Button>
        <Button style="margin-left: 8px" @click="onViewLog()">日志</Button>
      </template>
    </Grid>
  </Page>
</template>

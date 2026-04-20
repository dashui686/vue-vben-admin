<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MonitorJobApi } from '#/api/monitor/job';

import { h } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  message,
  Modal,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cleanJobLog,
  deleteJobLog,
  getJobLogList,
  jobGroupMap,
} from '#/api/monitor/job';

const route = useRoute();

function onActionClick({
  code,
  row,
}: OnActionClickParams<MonitorJobApi.SysJobLog>) {
  if (code === 'delete') onDelete(row);
  else if (code === 'detail') onViewDetail(row);
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'jobName',
        label: '任务名称',
        componentProps: { placeholder: '请输入任务名称' },
      },
      {
        component: 'Select',
        fieldName: 'jobGroup',
        label: '任务组名',
        componentProps: {
          allowClear: true,
          placeholder: '请选择任务组名',
          options: Object.entries(jobGroupMap).map(([value, label]) => ({
            label,
            value,
          })),
        },
      },
      {
        component: 'Select',
        fieldName: 'status',
        label: '执行状态',
        componentProps: {
          allowClear: true,
          placeholder: '请选择执行状态',
          options: [
            { label: '成功', value: '0' },
            { label: '失败', value: '1' },
          ],
        },
      },
      {
        component: 'RangePicker',
        fieldName: 'createTime',
        label: '执行时间',
      },
    ],
    fieldMappingTime: [['createTime', ['beginTime', 'endTime']]],
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: [
      { type: 'checkbox', width: 50 },
      { type: 'seq', width: 50, title: '#' },
      { field: 'jobName', title: '任务名称', minWidth: 120 },
      {
        field: 'jobGroup',
        title: '任务组名',
        width: 100,
        formatter: ({ cellValue }) => jobGroupMap[cellValue] || cellValue,
      },
      { field: 'invokeTarget', title: '调用目标字符串', minWidth: 200 },
      { field: 'jobMessage', title: '日志信息', minWidth: 150 },
      {
        field: 'status',
        title: '执行状态',
        width: 100,
        cellRender: {
          name: 'CellTag',
          options: [
            { label: '成功', value: '0', color: 'success' },
            { label: '失败', value: '1', color: 'error' },
          ],
        },
      },
      { field: 'createTime', title: '执行时间', width: 180 },
      {
        align: 'center',
        cellRender: {
          name: 'CellOperation',
          attrs: {
            nameField: 'jobName',
            nameTitle: '日志',
            onClick: onActionClick,
          },
          options: [
            { code: 'detail', text: '详情' },
            { auth: 'monitor:job:remove', code: 'delete', text: '删除' },
          ],
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
        query: async ({ page }, formValues) => {
          return await getJobLogList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            jobId: route.query.jobId || undefined,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'jobLogId' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  } as VxeTableGridOptions<MonitorJobApi.SysJobLog>,
});

function onViewDetail(row: MonitorJobApi.SysJobLog) {
  Modal.info({
    title: `调度日志详情 - ${row.jobName}`,
    width: 700,
    content: h(
      Descriptions,
      { column: 2, bordered: true, size: 'small' },
      () => [
        h(DescriptionsItem, { label: '日志序号' }, () => row.jobLogId),
        h(
          DescriptionsItem,
          { label: '任务组名' },
          () => jobGroupMap[row.jobGroup] || row.jobGroup,
        ),
        h(DescriptionsItem, { label: '任务名称' }, () => row.jobName),
        h(DescriptionsItem, { label: '执行状态' }, () =>
          row.status === '0' ? '成功' : '失败',
        ),
        h(DescriptionsItem, { label: '开始时间' }, () => row.startTime),
        h(DescriptionsItem, { label: '结束时间' }, () => row.endTime),
        ...(row.costTime === undefined
          ? []
          : [
              h(DescriptionsItem, { label: '耗时' }, () => `${row.costTime}ms`),
            ]),
        h(
          DescriptionsItem,
          { label: '调用目标', span: 2 },
          () => row.invokeTarget,
        ),
        ...(row.jobMessage
          ? [
              h(
                DescriptionsItem,
                { label: '日志信息', span: 2 },
                () => row.jobMessage,
              ),
            ]
          : []),
        ...(row.exceptionInfo
          ? [
              h(
                DescriptionsItem,
                { label: '异常信息', span: 2 },
                () => row.exceptionInfo,
              ),
            ]
          : []),
      ],
    ),
  });
}

async function onDelete(row: MonitorJobApi.SysJobLog) {
  try {
    await deleteJobLog(String(row.jobLogId));
    message.success('删除成功');
    gridApi.query();
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
      const jobLogIds = records
        .map((r: MonitorJobApi.SysJobLog) => r.jobLogId)
        .join(',');
      await deleteJobLog(jobLogIds);
      message.success('删除成功');
      gridApi.query();
    },
  });
}

function onClean() {
  Modal.confirm({
    title: '确认清理',
    content: '确认要清空所有调度日志吗？',
    onOk: async () => {
      await cleanJobLog();
      message.success('清理成功');
      gridApi.query();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="调度日志">
      <template #toolbar-tools>
        <Button
          v-access:code="'monitor:job:remove'"
          danger
          @click="onBatchDelete"
        >
          删除
        </Button>
        <Button
          v-access:code="'monitor:job:remove'"
          danger
          style="margin-left: 8px"
          @click="onClean"
        >
          清空
        </Button>
      </template>
    </Grid>
  </Page>
</template>

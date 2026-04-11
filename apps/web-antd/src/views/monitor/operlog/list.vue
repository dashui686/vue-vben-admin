<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MonitorOperlogApi } from '#/api/monitor/operlog';

import { h } from 'vue';

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
  cleanOperlog,
  deleteOperlog,
  getOperlogList,
} from '#/api/monitor/operlog';

import { businessTypeMap, useColumns } from './data';

function onActionClick({
  code,
  row,
}: OnActionClickParams<MonitorOperlogApi.SysOperLog>) {
  if (code === 'detail') onViewDetail(row);
  else if (code === 'delete') onDeleteOperlog(row);
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
          return await getOperlogList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
          });
        },
      },
    },
    rowConfig: { keyField: 'operId' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
  } as VxeTableGridOptions<MonitorOperlogApi.SysOperLog>,
});

function onViewDetail(row: MonitorOperlogApi.SysOperLog) {
  Modal.info({
    title: `操作日志详情 - ${row.title}`,
    width: 700,
    content: h(
      Descriptions,
      { column: 2, bordered: true, size: 'small' },
      () => [
        h(DescriptionsItem, { label: '操作模块' }, () => row.title),
        h(
          DescriptionsItem,
          { label: '操作类型' },
          () => businessTypeMap[row.businessType] || row.businessType,
        ),
        h(DescriptionsItem, { label: '请求方式' }, () => row.requestMethod),
        h(DescriptionsItem, { label: '操作人员' }, () => row.operName),
        h(DescriptionsItem, { label: '操作地址' }, () => row.operIp),
        h(DescriptionsItem, { label: '操作地点' }, () => row.operLocation),
        h(DescriptionsItem, { label: '请求URL' }, () => row.operUrl),
        h(DescriptionsItem, { label: '请求方法' }, () => row.method),
        h(
          DescriptionsItem,
          { label: '请求参数', span: 2 },
          () => row.operParam,
        ),
        h(
          DescriptionsItem,
          { label: '返回参数', span: 2 },
          () => row.jsonResult,
        ),
        h(DescriptionsItem, { label: '操作状态' }, () =>
          row.status === 0 ? '成功' : '失败',
        ),
        h(DescriptionsItem, { label: '耗时' }, () => `${row.costTime}ms`),
        h(DescriptionsItem, { label: '操作时间', span: 2 }, () => row.operTime),
        ...(row.errorMsg
          ? [
              h(
                DescriptionsItem,
                { label: '错误消息', span: 2 },
                () => row.errorMsg,
              ),
            ]
          : []),
      ],
    ),
  });
}

async function onDeleteOperlog(row: MonitorOperlogApi.SysOperLog) {
  try {
    await deleteOperlog(String(row.operId));
    message.success('删除成功');
    gridApi.query();
  } catch {}
}

function onClean() {
  Modal.confirm({
    title: '确认清理',
    content: '确认要清空所有操作日志吗？',
    onOk: async () => {
      await cleanOperlog();
      message.success('清理成功');
      gridApi.query();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="操作日志">
      <template #toolbar-tools>
        <Button danger @click="onClean">清空日志</Button>
      </template>
    </Grid>
  </Page>
</template>

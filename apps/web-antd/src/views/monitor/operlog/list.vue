<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MonitorOperlogApi } from '#/api/monitor/operlog';

import { h } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Modal,
  message,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cleanOperlog,
  deleteOperlog,
  getOperlogList,
} from '#/api/monitor/operlog';

const businessTypeMap: Record<number, string> = {
  0: '其它',
  1: '新增',
  2: '修改',
  3: '删除',
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { type: 'seq', width: 50, title: '#' },
      { field: 'title', title: '操作模块', minWidth: 120 },
      {
        field: 'businessType',
        title: '操作类型',
        width: 100,
        formatter: ({ cellValue }) => businessTypeMap[cellValue] || cellValue,
      },
      { field: 'requestMethod', title: '请求方式', width: 100 },
      { field: 'operName', title: '操作人员', width: 120 },
      { field: 'operIp', title: '操作地址', width: 130 },
      { field: 'operLocation', title: '操作地点', width: 120 },
      {
        field: 'status',
        title: '操作状态',
        width: 100,
        cellRender: { name: 'CellTag' },
      },
      { field: 'costTime', title: '耗时(ms)', width: 100, align: 'center' },
      { field: 'operTime', title: '操作时间', width: 180 },
      {
        align: 'center',
        cellRender: {
          name: 'CellOperation',
          attrs: {
            nameField: 'title',
            nameTitle: '日志',
            onClick: ({ code, row }: any) => {
              if (code === 'detail') onViewDetail(row);
              else if (code === 'delete') onDeleteOperlog(row);
            },
          },
          options: [
            { code: 'detail', text: '详情' },
            { code: 'delete', text: '删除' },
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

function onDeleteOperlog(row: MonitorOperlogApi.SysOperLog) {
  deleteOperlog(String(row.operId)).then(() => {
    message.success('删除成功');
    gridApi.query();
  });
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

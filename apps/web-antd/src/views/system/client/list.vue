<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemClientApi } from '#/api/system/client';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  changeClientStatus,
  deleteClient,
  getClientList,
} from '#/api/system/client';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemClientApi.SystemClient>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: SystemClientApi.SystemClient) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({}).open();
}

function onDelete(row: SystemClientApi.SystemClient) {
  deleteClient(String(row.id)).then(() => {
    message.success($t('ui.actionMessage.deleteSuccess', [row.clientKey]));
    onRefresh();
  });
}

async function onStatusChange(
  newStatus: string,
  row: SystemClientApi.SystemClient,
) {
  const statusText = newStatus === '0' ? '启用' : '停用';
  return new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认要${statusText}客户端"${row.clientKey}"吗？`,
      onOk: async () => {
        await changeClientStatus({ id: row.id, status: newStatus });
        message.success(`${statusText}成功`);
        resolve(true);
      },
      onCancel: () => resolve(false),
    });
  });
}

const [Grid, gridApi] = useVbenVxeGrid({
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
          return await getClientList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemClientApi.SystemClient>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid :table-title="$t('system.client.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.client.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

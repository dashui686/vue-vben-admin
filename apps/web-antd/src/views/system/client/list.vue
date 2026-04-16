<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemClientApi } from '#/api/system/client';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  useGridSelection,
  useStatusConfirm,
} from '#/composables/useGridHelper';
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

const { editDisabled, gridEvents, onToolbarEdit } =
  useGridSelection<SystemClientApi.SystemClient>(() => gridApi);

const { onStatusChange } = useStatusConfirm<SystemClientApi.SystemClient>(
  changeClientStatus,
  { idField: 'id', nameField: 'clientKey' },
);

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
          return await getClientList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, export: false, refresh: true, search: true, zoom: true },
  } as VxeTableGridOptions<SystemClientApi.SystemClient>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemClientApi.SystemClient>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onEdit(row: SystemClientApi.SystemClient) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({}).open();
}

async function onDelete(row: SystemClientApi.SystemClient) {
  try {
    await deleteClient(String(row.id));
    message.success($t('ui.actionMessage.deleteSuccess', [row.clientKey]));
    gridApi.query();
  } catch {}
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <Grid :table-title="$t('system.client.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.client.name')]) }}
        </Button>
        <Button
          :disabled="editDisabled"
          style="margin-left: 8px"
          @click="onToolbarEdit(onEdit)"
        >
          {{ $t('common.edit') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemTenantPackageApi } from '#/api/system/tenantPackage';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  useGridSelection,
  useStatusConfirm,
} from '#/composables/useGridHelper';
import {
  changeTenantPackageStatus,
  deleteTenantPackage,
  getTenantPackageList,
} from '#/api/system/tenantPackage';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { editDisabled, gridEvents, onToolbarEdit } =
  useGridSelection<SystemTenantPackageApi.SystemTenantPackage>(() => gridApi);

const { onStatusChange } =
  useStatusConfirm<SystemTenantPackageApi.SystemTenantPackage>(
    ({ id, status }) => changeTenantPackageStatus({ packageId: id, status }),
    { idField: 'packageId', nameField: 'packageName' },
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
          return await getTenantPackageList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'packageId' },
    toolbarConfig: { custom: true, export: false, refresh: true, search: true, zoom: true },
  } as VxeTableGridOptions<SystemTenantPackageApi.SystemTenantPackage>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemTenantPackageApi.SystemTenantPackage>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onEdit(row: SystemTenantPackageApi.SystemTenantPackage) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({}).open();
}

async function onDelete(row: SystemTenantPackageApi.SystemTenantPackage) {
  try {
    await deleteTenantPackage(String(row.packageId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.packageName]));
    gridApi.query();
  } catch {}
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <Grid :table-title="$t('system.tenantPackage.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.tenantPackage.name')]) }}
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

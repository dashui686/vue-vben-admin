<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemTenantPackageApi } from '#/api/system/tenantPackage';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
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

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemTenantPackageApi.SystemTenantPackage>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onRefresh() {
  gridApi.query();
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
    onRefresh();
  } catch {}
}

async function onStatusChange(
  newStatus: string,
  row: SystemTenantPackageApi.SystemTenantPackage,
) {
  const statusText = newStatus === '0' ? '启用' : '停用';
  return new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认要${statusText}套餐"${row.packageName}"吗？`,
      onOk: async () => {
        await changeTenantPackageStatus({
          packageId: row.packageId,
          status: newStatus,
        });
        message.success(`${statusText}成功`);
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
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
    pagerConfig: {
      enabled: true,
    },
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
    rowConfig: {
      keyField: 'packageId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemTenantPackageApi.SystemTenantPackage>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid :table-title="$t('system.tenantPackage.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.tenantPackage.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

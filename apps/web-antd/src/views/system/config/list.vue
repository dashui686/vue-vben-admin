<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemConfigApi } from '#/api/system/config';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteConfig,
  exportConfig,
  getConfigList,
  refreshConfigCache,
} from '#/api/system/config';
import { useBatchDelete, useGridSelection } from '#/composables/useGridHelper';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { deleteDisabled, editDisabled, gridEvents, onToolbarEdit } =
  useGridSelection<SystemConfigApi.SystemConfig>(() => gridApi);

const { onBatchDelete } = useBatchDelete(
  () => gridApi,
  deleteConfig,
  'configId',
);

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents,
  formOptions: {
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
          return await getConfigList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'configId' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemConfigApi.SystemConfig>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemConfigApi.SystemConfig>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onEdit(row: SystemConfigApi.SystemConfig) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({}).open();
}

async function onDelete(row: SystemConfigApi.SystemConfig) {
  try {
    await deleteConfig(String(row.configId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.configName]));
    gridApi.query();
  } catch {}
}

async function onExport() {
  const formValues = await gridApi.formApi.getValues();
  await exportConfig(formValues);
  message.success('导出成功');
}

function onRefreshCache() {
  Modal.confirm({
    title: '确认刷新',
    content: '确认要刷新参数缓存吗？',
    onOk: async () => {
      await refreshConfigCache();
      message.success('刷新成功');
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <Grid :table-title="$t('system.config.list')">
      <template #toolbar-tools>
        <Button v-access:code="'system:config:add'" type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.config.name')]) }}
        </Button>
        <Button
          v-access:code="'system:config:edit'"
          :disabled="editDisabled"
          style="margin-left: 8px"
          @click="onToolbarEdit(onEdit)"
        >
          {{ $t('common.edit') }}
        </Button>
        <Button
          v-access:code="'system:config:remove'"
          :disabled="deleteDisabled"
          danger
          style="margin-left: 8px"
          @click="onBatchDelete"
        >
          删除
        </Button>
        <Button v-access:code="'system:config:export'" style="margin-left: 8px" @click="onExport">导出</Button>
        <Button v-access:code="'system:config:remove'" style="margin-left: 8px" @click="onRefreshCache">
          刷新缓存
        </Button>
      </template>
    </Grid>
  </Page>
</template>

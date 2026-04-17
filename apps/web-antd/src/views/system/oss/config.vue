<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemOssApi } from '#/api/system/oss';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { ArrowLeft, Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  changeOssConfigStatus,
  deleteOssConfig,
  getOssConfigList,
} from '#/api/system/oss';
import {
  useBatchDelete,
  useGridSelection,
  useStatusConfirm,
} from '#/composables/useGridHelper';
import { $t } from '#/locales';

import { useConfigColumns, useConfigGridFormSchema } from './data';
import ConfigForm from './modules/config-form.vue';

const router = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: ConfigForm,
  destroyOnClose: true,
});

const { deleteDisabled, editDisabled, gridEvents, onToolbarEdit } =
  useGridSelection<SystemOssApi.SystemOssConfig>(() => gridApi);

const { onBatchDelete } = useBatchDelete(
  () => gridApi,
  deleteOssConfig,
  'ossConfigId',
);

const { onStatusChange } = useStatusConfirm<SystemOssApi.SystemOssConfig>(
  ({ id, status }) => changeOssConfigStatus({ ossConfigId: id, status }),
  { idField: 'ossConfigId', nameField: 'configKey' },
);

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents,
  formOptions: {
    schema: useConfigGridFormSchema(),
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useConfigColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: true },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getOssConfigList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'ossConfigId' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemOssApi.SystemOssConfig>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemOssApi.SystemOssConfig>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onEdit(row: SystemOssApi.SystemOssConfig) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({}).open();
}

async function onDelete(row: SystemOssApi.SystemOssConfig) {
  try {
    await deleteOssConfig(String(row.ossConfigId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.configKey]));
    gridApi.query();
  } catch {}
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <Grid :table-title="$t('system.oss.configList')">
      <template #toolbar-tools>
        <Button @click="router.push({ name: 'SystemOss' })">
          <ArrowLeft class="size-4" />
          返回
        </Button>
        <Button v-access:code="'system:oss:add'" type="primary" style="margin-left: 8px" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.oss.configName')]) }}
        </Button>
        <Button
          v-access:code="'system:oss:edit'"
          :disabled="editDisabled"
          style="margin-left: 8px"
          @click="onToolbarEdit(onEdit)"
        >
          {{ $t('common.edit') }}
        </Button>
        <Button
          v-access:code="'system:oss:remove'"
          :disabled="deleteDisabled"
          danger
          style="margin-left: 8px"
          @click="onBatchDelete"
        >
          {{ $t('common.delete') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

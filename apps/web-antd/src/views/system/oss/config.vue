<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemOssApi } from '#/api/system/oss';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { ArrowLeft, Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  changeOssConfigStatus,
  deleteOssConfig,
  getOssConfigList,
} from '#/api/system/oss';
import { $t } from '#/locales';

import { useConfigColumns, useConfigGridFormSchema } from './data';
import ConfigForm from './modules/config-form.vue';

const router = useRouter();

function onBack() {
  router.push({ name: 'SystemOss' });
}

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: ConfigForm,
  destroyOnClose: true,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemOssApi.SystemOssConfig>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: SystemOssApi.SystemOssConfig) {
  formModalApi.setData(row).open();
}

function onToolbarEdit() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length !== 1) {
    message.warning('请选择一条数据');
    return;
  }
  onEdit(records[0] as SystemOssApi.SystemOssConfig);
}

const selectedCount = ref(0);
const editDisabled = computed(() => selectedCount.value !== 1);
const deleteDisabled = computed(() => selectedCount.value === 0);

function onSelectionChange() {
  selectedCount.value = gridApi.grid.getCheckboxRecords().length;
}

function onCreate() {
  formModalApi.setData({}).open();
}

async function onDelete(row: SystemOssApi.SystemOssConfig) {
  try {
    await deleteOssConfig(String(row.ossConfigId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.configKey]));
    onRefresh();
  } catch {}
}

async function onStatusChange(
  newStatus: string,
  row: SystemOssApi.SystemOssConfig,
) {
  const statusText = newStatus === '0' ? '启用' : '停用';
  return new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认要${statusText}配置"${row.configKey}"吗？`,
      onOk: async () => {
        await changeOssConfigStatus({
          ossConfigId: row.ossConfigId,
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
      const ids = records
        .map((r: SystemOssApi.SystemOssConfig) => r.ossConfigId)
        .join(',');
      await deleteOssConfig(ids);
      message.success('删除成功');
      onRefresh();
    },
  });
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {
    checkboxChange: onSelectionChange,
    checkboxAll: onSelectionChange,
  },
  formOptions: {
    schema: useConfigGridFormSchema(),
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useConfigColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
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
    rowConfig: {
      keyField: 'ossConfigId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemOssApi.SystemOssConfig>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid :table-title="$t('system.oss.configList')">
      <template #toolbar-tools>
        <Button @click="onBack">
          <ArrowLeft class="size-4" />
          返回
        </Button>
        <Button type="primary" style="margin-left: 8px" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.oss.configName')]) }}
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
          {{ $t('common.delete') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemConfigApi } from '#/api/system/config';

import { computed, ref } from 'vue';

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
}: OnActionClickParams<SystemConfigApi.SystemConfig>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: SystemConfigApi.SystemConfig) {
  formModalApi.setData(row).open();
}

function onToolbarEdit() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length !== 1) {
    message.warning('请选择一条数据');
    return;
  }
  onEdit(records[0] as SystemConfigApi.SystemConfig);
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

async function onDelete(row: SystemConfigApi.SystemConfig) {
  try {
    await deleteConfig(String(row.configId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.configName]));
    onRefresh();
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
      const configIds = records
        .map((r: SystemConfigApi.SystemConfig) => r.configId)
        .join(',');
      await deleteConfig(configIds);
      message.success('删除成功');
      onRefresh();
    },
  });
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

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {
    checkboxChange: onSelectionChange,
    checkboxAll: onSelectionChange,
  },
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
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid :table-title="$t('system.config.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.config.name')]) }}
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
          删除
        </Button>
        <Button style="margin-left: 8px" @click="onExport">导出</Button>
        <Button style="margin-left: 8px" @click="onRefreshCache">
          刷新缓存
        </Button>
      </template>
    </Grid>
  </Page>
</template>

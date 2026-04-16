<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemOssApi } from '#/api/system/oss';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Upload } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteOss,
  downloadOss,
  getOssList,
  uploadOssFile,
} from '#/api/system/oss';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

const router = useRouter();

function onOpenConfig() {
  router.push({ name: 'SystemOssConfig' });
}

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemOssApi.SystemOss>) {
  if (code === 'download') onDownload(row);
  else if (code === 'delete') onDelete(row);
}

function onRefresh() {
  gridApi.query();
}

const selectedCount = ref(0);
const deleteDisabled = computed(() => selectedCount.value === 0);

function onSelectionChange() {
  selectedCount.value = gridApi.grid.getCheckboxRecords().length;
}

async function onDownload(row: SystemOssApi.SystemOss) {
  try {
    await downloadOss(row.ossId);
    message.success('下载成功');
  } catch {}
}

async function onDelete(row: SystemOssApi.SystemOss) {
  try {
    await deleteOss(String(row.ossId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.originalName]));
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
      const ossIds = records
        .map((r: SystemOssApi.SystemOss) => r.ossId)
        .join(',');
      await deleteOss(ossIds);
      message.success('删除成功');
      onRefresh();
    },
  });
}

function onUpload(info: { file: File }) {
  const formData = new FormData();
  formData.append('file', info.file);
  uploadOssFile(formData).then(() => {
    message.success('上传成功');
    onRefresh();
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
    fieldMappingTime: [['createTime', ['beginTime', 'endTime']]],
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getOssList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'ossId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemOssApi.SystemOss>,
});
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.oss.list')">
      <template #toolbar-tools>
        <Upload :custom-request="onUpload" :show-upload-list="false">
          <Button type="primary">
            <Plus class="size-5" />
            {{ $t('system.oss.upload') }}
          </Button>
        </Upload>
        <Button
          :disabled="deleteDisabled"
          danger
          style="margin-left: 8px"
          @click="onBatchDelete"
        >
          {{ $t('common.delete') }}
        </Button>
        <Button style="margin-left: 8px" @click="onOpenConfig">
          {{ $t('system.oss.configTitle') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemOssApi } from '#/api/system/oss';

import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Upload } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteOss,
  downloadOss,
  getOssList,
  uploadOssFile,
} from '#/api/system/oss';
import { useBatchDelete, useGridSelection } from '#/composables/useGridHelper';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

const router = useRouter();

const { deleteDisabled, gridEvents } = useGridSelection<SystemOssApi.SystemOss>(
  () => gridApi,
);

const { onBatchDelete } = useBatchDelete(() => gridApi, deleteOss, 'ossId');

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents,
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
    pagerConfig: { enabled: true },
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
    rowConfig: { keyField: 'ossId' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemOssApi.SystemOss>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemOssApi.SystemOss>) {
  if (code === 'download') onDownload(row);
  else if (code === 'delete') onDelete(row);
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
    gridApi.query();
  } catch {}
}

function onUpload(info: { file: File }) {
  const formData = new FormData();
  formData.append('file', info.file);
  uploadOssFile(formData).then(() => {
    message.success('上传成功');
    gridApi.query();
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.oss.list')">
      <template #toolbar-tools>
        <Upload
          v-access:code="'system:oss:upload'"
          :custom-request="onUpload"
          :show-upload-list="false"
        >
          <Button type="primary">
            <Plus class="size-5" />
            {{ $t('system.oss.upload') }}
          </Button>
        </Upload>
        <Button
          v-access:code="'system:oss:remove'"
          :disabled="deleteDisabled"
          danger
          style="margin-left: 8px"
          @click="onBatchDelete"
        >
          {{ $t('common.delete') }}
        </Button>
        <Button
          style="margin-left: 8px"
          @click="router.push({ name: 'SystemOssConfig' })"
        >
          {{ $t('system.oss.configTitle') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

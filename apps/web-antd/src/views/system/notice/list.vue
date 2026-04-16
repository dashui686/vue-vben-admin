<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemNoticeApi } from '#/api/system/notice';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  useBatchDelete,
  useGridSelection,
} from '#/composables/useGridHelper';
import { deleteNotice, getNoticeList } from '#/api/system/notice';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { deleteDisabled, editDisabled, gridEvents, onToolbarEdit } =
  useGridSelection<SystemNoticeApi.SystemNotice>(() => gridApi);

const { onBatchDelete } = useBatchDelete(
  () => gridApi,
  deleteNotice,
  'noticeId',
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
          return await getNoticeList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'noticeId' },
    toolbarConfig: { custom: true, export: false, refresh: true, search: true, zoom: true },
  } as VxeTableGridOptions<SystemNoticeApi.SystemNotice>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemNoticeApi.SystemNotice>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onEdit(row: SystemNoticeApi.SystemNotice) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({}).open();
}

async function onDelete(row: SystemNoticeApi.SystemNotice) {
  try {
    await deleteNotice(String(row.noticeId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.noticeTitle]));
    gridApi.query();
  } catch {}
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <Grid :table-title="$t('system.notice.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.notice.name')]) }}
        </Button>
        <Button
          :disabled="editDisabled"
          style="margin-left: 8px"
          @click="onToolbarEdit(onEdit)"
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
      </template>
    </Grid>
  </Page>
</template>

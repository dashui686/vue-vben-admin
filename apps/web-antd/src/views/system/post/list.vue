<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { changePostStatus, deletePost, getPostList } from '#/api/system/post';
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
}: OnActionClickParams<SystemPostApi.SystemPost>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: SystemPostApi.SystemPost) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({}).open();
}

function onDelete(row: SystemPostApi.SystemPost) {
  deletePost(String(row.postId)).then(() => {
    message.success($t('ui.actionMessage.deleteSuccess', [row.postName]));
    onRefresh();
  });
}

async function onStatusChange(
  newStatus: string,
  row: SystemPostApi.SystemPost,
) {
  const statusText = newStatus === '0' ? '启用' : '停用';
  return new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认要${statusText}岗位"${row.postName}"吗？`,
      onOk: async () => {
        await changePostStatus({ postId: row.postId, status: newStatus });
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
          return await getPostList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'postId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemPostApi.SystemPost>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid :table-title="$t('system.post.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.post.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

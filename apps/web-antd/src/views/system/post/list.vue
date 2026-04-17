<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, Input, message, Tree } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDeptList } from '#/api/system/dept';
import {
  changePostStatus,
  deletePost,
  exportPost,
  getPostList,
} from '#/api/system/post';
import {
  useBatchDelete,
  useGridSelection,
  useStatusConfirm,
} from '#/composables/useGridHelper';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

// Dept tree sidebar
const deptTreeData = ref<any[]>([]);
const deptSearchValue = ref('');
const selectedDeptId = ref<number>();

async function loadDeptTree() {
  const data = await getDeptList();
  deptTreeData.value = buildTree(data);
}

function buildTree(data: any[]): any[] {
  return data.map((item: any) => ({
    title: item.deptName,
    key: item.deptId,
    value: item.deptId,
    children: item.children?.length ? buildTree(item.children) : undefined,
  }));
}

function onDeptSelect(selectedKeys: Array<number | string>) {
  selectedDeptId.value =
    selectedKeys.length > 0 ? (selectedKeys[0] as number) : undefined;
  gridApi.query();
}

// Grid helpers
const { deleteDisabled, editDisabled, gridEvents, onToolbarEdit } =
  useGridSelection<SystemPostApi.SystemPost>(() => gridApi);

const { onBatchDelete } = useBatchDelete(() => gridApi, deletePost, 'postId');

const { onStatusChange } = useStatusConfirm<SystemPostApi.SystemPost>(
  ({ id, status }) => changePostStatus({ postId: id, status }),
  { idField: 'postId', nameField: 'postName' },
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
          const params: any = {
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          };
          if (selectedDeptId.value) {
            params.deptId = selectedDeptId.value;
          }
          return await getPostList(params);
        },
      },
    },
    rowConfig: { keyField: 'postId' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemPostApi.SystemPost>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemPostApi.SystemPost>) {
  if (code === 'edit') onEdit(row);
  else if (code === 'delete') onDelete(row);
}

function onEdit(row: SystemPostApi.SystemPost) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({ deptId: selectedDeptId.value }).open();
}

async function onDelete(row: SystemPostApi.SystemPost) {
  try {
    await deletePost(String(row.postId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.postName]));
    gridApi.query();
  } catch {}
}

async function onExport() {
  const formValues = await gridApi.formApi.getValues();
  const params: any = { ...formValues };
  if (selectedDeptId.value) {
    params.deptId = selectedDeptId.value;
  }
  await exportPost(params);
  message.success('导出成功');
}

onMounted(() => {
  loadDeptTree();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <div class="flex h-full gap-2">
      <Card
        class="w-[260px] shrink-0 overflow-auto"
        :body-style="{ padding: '12px' }"
      >
        <Input
          v-model:value="deptSearchValue"
          placeholder="部门名称筛选"
          allow-clear
          class="mb-2"
        />
        <Tree
          :tree-data="deptTreeData"
          :search-value="deptSearchValue"
          default-expand-all
          :field-names="{ title: 'title', key: 'key', children: 'children' }"
          @select="onDeptSelect"
        />
      </Card>
      <div class="flex-1">
        <Grid :table-title="$t('system.post.list')">
          <template #toolbar-tools>
            <Button v-access:code="'system:post:add'" type="primary" @click="onCreate">
              <Plus class="size-5" />
              {{ $t('ui.actionTitle.create', [$t('system.post.name')]) }}
            </Button>
            <Button
              v-access:code="'system:post:edit'"
              :disabled="editDisabled"
              style="margin-left: 8px"
              @click="onToolbarEdit(onEdit)"
            >
              {{ $t('common.edit') }}
            </Button>
            <Button
              v-access:code="'system:post:remove'"
              :disabled="deleteDisabled"
              danger
              style="margin-left: 8px"
              @click="onBatchDelete"
            >
              删除
            </Button>
            <Button v-access:code="'system:post:export'" style="margin-left: 8px" @click="onExport">导出</Button>
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>

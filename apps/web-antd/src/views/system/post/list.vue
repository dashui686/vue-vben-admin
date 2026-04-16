<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, Input, message, Modal, Tree } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDeptList } from '#/api/system/dept';
import {
  changePostStatus,
  deletePost,
  exportPost,
  getPostList,
} from '#/api/system/post';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

// Department tree
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

function onToolbarEdit() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length !== 1) {
    message.warning('请选择一条数据');
    return;
  }
  onEdit(records[0] as SystemPostApi.SystemPost);
}

const selectedCount = ref(0);
const editDisabled = computed(() => selectedCount.value !== 1);
const deleteDisabled = computed(() => selectedCount.value === 0);

function onSelectionChange() {
  selectedCount.value = gridApi.grid.getCheckboxRecords().length;
}

function onCreate() {
  formModalApi.setData({ deptId: selectedDeptId.value }).open();
}

async function onDelete(row: SystemPostApi.SystemPost) {
  try {
    await deletePost(String(row.postId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.postName]));
    onRefresh();
  } catch {}
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
      const postIds = records
        .map((r: SystemPostApi.SystemPost) => r.postId)
        .join(',');
      await deletePost(postIds);
      message.success('删除成功');
      onRefresh();
    },
  });
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
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
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

onMounted(() => {
  loadDeptTree();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <div class="flex h-full gap-2">
      <!-- Left dept tree sidebar -->
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
      <!-- Right post list -->
      <div class="flex-1">
        <Grid :table-title="$t('system.post.list')">
          <template #toolbar-tools>
            <Button type="primary" @click="onCreate">
              <Plus class="size-5" />
              {{ $t('ui.actionTitle.create', [$t('system.post.name')]) }}
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
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>

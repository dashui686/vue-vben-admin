<script lang="ts" setup>
import type { FrontendMenu } from './types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';
import { $t } from '@vben/locales';

import { MenuBadge } from '@vben-core/menu-ui';

import { Button, message, Modal, Tree } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { cascadeDeleteMenu, deleteMenu, getMenuList } from '#/api/system/menu';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const isExpanded = ref(true);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// Cascade delete dialog
const cascadeVisible = ref(false);
const cascadeLoading = ref(false);
const cascadeTreeData = ref<any[]>([]);
const cascadeCheckedKeys = ref<Array<number | string>>([]);
const cascadeTreeLoaded = ref(false);

async function loadCascadeTree() {
  if (cascadeTreeLoaded.value) return;
  const data = await getMenuList();
  cascadeTreeData.value = buildCascadeTree(data);
  cascadeTreeLoaded.value = true;
}

function buildCascadeTree(menus: FrontendMenu[]): any[] {
  return menus.map((menu) => ({
    title: menu.meta?.title ? $t(menu.meta.title) : menu.name,
    key: menu.id,
    children: menu.children?.length
      ? buildCascadeTree(menu.children as FrontendMenu[])
      : undefined,
  }));
}

function onCascadeDelete() {
  cascadeCheckedKeys.value = [];
  loadCascadeTree();
  cascadeVisible.value = true;
}

async function onCascadeSubmit() {
  if (cascadeCheckedKeys.value.length === 0) {
    message.warning('请选择要删除的菜单');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `确认要级联删除选中的${cascadeCheckedKeys.value.length}个菜单吗？`,
    onOk: async () => {
      cascadeLoading.value = true;
      try {
        await cascadeDeleteMenu(cascadeCheckedKeys.value.join(','));
        message.success('删除成功');
        cascadeVisible.value = false;
        cascadeTreeLoaded.value = false; // 清除缓存，下次重新加载
        onRefresh();
      } finally {
        cascadeLoading.value = false;
      }
    },
  });
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues) => {
          return await getMenuList(formValues);
        },
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: { parentField: 'pid', rowField: 'id', transform: true },
  } as VxeTableGridOptions<FrontendMenu>,
});

function onActionClick({ code, row }: OnActionClickParams<FrontendMenu>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: FrontendMenu) {
  formDrawerApi.setData(row).open();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onAppend(row: FrontendMenu) {
  formDrawerApi.setData({ pid: row.id }).open();
}

function onDelete(row: FrontendMenu) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteMenu(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => hideLoading());
}

function onToggleExpandAll() {
  const grid = gridApi.grid;
  if (isExpanded.value) {
    grid.clearTreeExpand();
  } else {
    grid.setAllTreeExpand(true);
  }
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button
          v-access:code="'system:menu:add'"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.menu.name')]) }}
        </Button>
        <Button
          v-access:code="'system:menu:remove'"
          danger
          style="margin-left: 8px"
          @click="onCascadeDelete"
        >
          级联删除
        </Button>
        <Button style="margin-left: 8px" @click="onToggleExpandAll">
          {{ isExpanded ? '折叠' : '展开' }}
        </Button>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 shrink-0">
            <IconifyIcon
              v-if="row.type === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.meta?.icon"
              :icon="row.meta.icon"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ $t(row.meta.title || row.name) }}</span>
        </div>
        <MenuBadge
          v-if="row.meta?.badgeType"
          class="menu-badge"
          :badge="row.meta.badge"
          :badge-type="row.meta.badgeType"
          :badge-variants="row.meta.badgeVariants"
        />
      </template>
    </Grid>

    <!-- Cascade delete dialog -->
    <Modal
      v-model:open="cascadeVisible"
      title="级联删除菜单"
      :confirm-loading="cascadeLoading"
      @ok="onCascadeSubmit"
    >
      <p class="mb-2" style="color: #999">
        选择要删除的菜单（将同时删除子菜单）：
      </p>
      <div
        style="
          max-height: 400px;
          padding: 8px;
          overflow: auto;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
        "
      >
        <Tree
          v-model:checked-keys="cascadeCheckedKeys"
          :tree-data="cascadeTreeData"
          checkable
          default-expand-all
          :field-names="{ title: 'title', key: 'key', children: 'children' }"
        />
      </div>
    </Modal>
  </Page>
</template>

<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>

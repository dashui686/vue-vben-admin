<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';
import { $t } from '@vben/locales';

import { MenuBadge } from '@vben-core/menu-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenu, getMenuList, SystemMenuApi } from '#/api/system/menu';

import { useColumns } from './data';
import Form from './modules/form.vue';

// 获取菜单ID(兼容前后端字段)
function getMenuId(row: SystemMenuApi.SystemMenu) {
  return row.menuId ?? row.id;
}

// 获取父菜单ID(兼容前后端字段)
function getParentId(row: SystemMenuApi.SystemMenu) {
  return row.parentId ?? row.pid;
}

// 获取菜单名称(兼容前后端字段)
function getMenuName(row: SystemMenuApi.SystemMenu) {
  return row.menuName || row.name || '';
}

// 获取菜单类型(兼容前后端字段)
function getMenuType(row: SystemMenuApi.SystemMenu) {
  return row.menuType || row.type || '';
}

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          return await getMenuList();
        },
      },
    },
    rowConfig: {
      keyField: 'menuId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'parentId',
      rowField: 'menuId',
      transform: false,
    },
  } as VxeTableGridOptions,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemMenuApi.SystemMenu>) {
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
    default: {
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}
function onEdit(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData(row).open();
}
function onCreate() {
  formDrawerApi.setData({}).open();
}
function onAppend(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData({ parentId: getMenuId(row) }).open();
}

function onDelete(row: SystemMenuApi.SystemMenu) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [getMenuName(row)]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteMenu(getMenuId(row) as unknown as string)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [getMenuName(row)]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.menu.name')]) }}
        </Button>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 shrink-0">
            <IconifyIcon
              v-if="getMenuType(row) === 'F' || row.type === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.meta?.icon || row.icon"
              :icon="row.meta?.icon || row.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ $t(row.meta?.title || row.menuName || row.name) }}</span>
          <div class="items-center justify-end"></div>
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

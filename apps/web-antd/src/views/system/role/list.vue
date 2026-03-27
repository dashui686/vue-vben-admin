<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { changeRoleStatus, deleteRole, getRoleList } from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import DataScopeModal from './modules/data-scope.vue';
import Form from './modules/form.vue';

const router = useRouter();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// 数据权限弹窗
const dataScopeOpen = ref(false);
const dataScopeRoleId = ref<string>();
const dataScopeDataScope = ref<string>();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getRoleList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'roleId',
    },

    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemRoleApi.SystemRolePageQuery>,
});

function onActionClick(
  e: OnActionClickParams<SystemRoleApi.SystemRolePageQuery>,
) {
  switch (e.code) {
    case 'allocateDataScope': {
      onAllocateDataScope(e.row);
      break;
    }
    case 'allocateUser': {
      onAllocateUser(e.row);
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

/**
 * 将 Antd 的 Modal.confirm 封装为 promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((reslove, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        reslove(true);
      },
      title,
    });
  });
}

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回 false 则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(
  newStatus: string,
  row: SystemRoleApi.SystemRolePageQuery,
) {
  const status: Recordable<string> = {
    '0': '启用',
    '1': '禁用',
  };
  try {
    await confirm(
      `你要将${row.roleName}的状态切换为【${status[newStatus.toString()]}】吗？`,
      `切换状态`,
    );
    await changeRoleStatus({
      roleId: row.roleId,
      status: newStatus.toString(),
    });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemRoleApi.SystemRolePageQuery) {
  formDrawerApi.setData(row).open();
}

function onAllocateDataScope(row: SystemRoleApi.SystemRolePageQuery) {
  dataScopeRoleId.value = row.roleId;
  dataScopeDataScope.value = row.dataScope;
  dataScopeOpen.value = true;
}

function onAllocateUser(row: SystemRoleApi.SystemRolePageQuery) {
  router.push({
    name: 'SystemRoleAllocateUser',
    params: { roleId: row.roleId },
    query: { roleName: row.roleName },
  });
}

function onDelete(row: SystemRoleApi.SystemRolePageQuery) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.roleName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteRole(row.roleId)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.roleName]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DataScopeModal
      :open="dataScopeOpen"
      :role-id="dataScopeRoleId"
      :data-scope="dataScopeDataScope"
      @update:open="dataScopeOpen = $event"
      @success="onRefresh"
    />
    <Grid :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

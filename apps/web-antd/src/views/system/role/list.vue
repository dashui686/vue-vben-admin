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
import { changeRoleStatus, deleteRole, exportRole, getRoleList } from '#/api';
import { useBatchDelete, useGridSelection } from '#/composables/useGridHelper';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import DataScopeModal from './modules/data-scope.vue';
import Form from './modules/form.vue';

const router = useRouter();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// Data scope modal
const dataScopeOpen = ref(false);
const dataScopeRoleId = ref<string>();
const dataScopeDataScope = ref<string>();
const dataScopeRoleName = ref<string>();
const dataScopeRoleKey = ref<string>();

// Grid helpers
const { deleteDisabled, editDisabled, gridEvents, onToolbarEdit } =
  useGridSelection<SystemRoleApi.SystemRolePageQuery>(() => gridApi);

const { onBatchDelete } = useBatchDelete(() => gridApi, deleteRole, 'roleId');

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents,
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
    rowConfig: { keyField: 'roleId' },
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
      router.push({
        name: 'SystemRoleAllocateUser',
        params: { roleId: e.row.roleId },
        query: { roleName: e.row.roleName },
      });
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      formDrawerApi.setData(e.row).open();
      break;
    }
  }
}

function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

async function onStatusChange(
  newStatus: string,
  row: SystemRoleApi.SystemRolePageQuery,
) {
  const status: Recordable<string> = { '0': '启用', '1': '禁用' };
  try {
    await confirm(
      `你要将${row.roleName}的状态切换为【${status[newStatus.toString()]}】吗？`,
      '切换状态',
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

function onAllocateDataScope(row: SystemRoleApi.SystemRolePageQuery) {
  dataScopeRoleId.value = row.roleId;
  dataScopeDataScope.value = row.dataScope;
  dataScopeRoleName.value = row.roleName;
  dataScopeRoleKey.value = row.roleKey;
  dataScopeOpen.value = true;
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
      gridApi.query();
    })
    .catch(() => {
      hideLoading();
    });
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

async function onExport() {
  const formValues = await gridApi.formApi.getValues();
  await exportRole(formValues);
  message.success('导出成功');
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <DataScopeModal
      :open="dataScopeOpen"
      :role-id="dataScopeRoleId"
      :data-scope="dataScopeDataScope"
      :role-name="dataScopeRoleName"
      :role-key="dataScopeRoleKey"
      @update:open="dataScopeOpen = $event"
      @success="gridApi.query()"
    />
    <Grid :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <Button
          v-access:code="'system:role:add'"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
        </Button>
        <Button
          v-access:code="'system:role:edit'"
          :disabled="editDisabled"
          style="margin-left: 8px"
          @click="onToolbarEdit((row) => formDrawerApi.setData(row).open())"
        >
          {{ $t('common.edit') }}
        </Button>
        <Button
          v-access:code="'system:role:remove'"
          :disabled="deleteDisabled"
          danger
          style="margin-left: 8px"
          @click="onBatchDelete"
        >
          删除
        </Button>
        <Button
          v-access:code="'system:role:export'"
          style="margin-left: 8px"
          @click="onExport"
          >
导出
</Button>
      </template>
    </Grid>
  </Page>
</template>

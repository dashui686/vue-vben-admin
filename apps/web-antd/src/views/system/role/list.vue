<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { changeRoleStatus, deleteRole, exportRole, getRoleList } from '#/api';
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
const dataScopeRoleName = ref<string>();
const dataScopeRoleKey = ref<string>();

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {
    checkboxChange: onSelectionChange,
    checkboxAll: onSelectionChange,
  },
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

const selectedCount = ref(0);
const editDisabled = computed(() => selectedCount.value !== 1);
const deleteDisabled = computed(() => selectedCount.value === 0);

function onSelectionChange() {
  selectedCount.value = gridApi.grid.getCheckboxRecords().length;
}

function onToolbarEdit() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length !== 1) {
    message.warning('请选择一条数据');
    return;
  }
  onEdit(records[0] as SystemRoleApi.SystemRolePageQuery);
}

function onAllocateDataScope(row: SystemRoleApi.SystemRolePageQuery) {
  dataScopeRoleId.value = row.roleId;
  dataScopeDataScope.value = row.dataScope;
  dataScopeRoleName.value = row.roleName;
  dataScopeRoleKey.value = row.roleKey;
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
      const roleIds = records
        .map((r: SystemRoleApi.SystemRolePageQuery) => r.roleId)
        .join(',');
      await deleteRole(roleIds);
      message.success('删除成功');
      onRefresh();
    },
  });
}

async function onExport() {
  const formValues = await gridApi.formApi.getValues();
  await exportRole(formValues);
  message.success('导出成功');
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DataScopeModal
      :open="dataScopeOpen"
      :role-id="dataScopeRoleId"
      :data-scope="dataScopeDataScope"
      :role-name="dataScopeRoleName"
      :role-key="dataScopeRoleKey"
      @update:open="dataScopeOpen = $event"
      @success="onRefresh"
    />
    <Grid :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
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
  </Page>
</template>

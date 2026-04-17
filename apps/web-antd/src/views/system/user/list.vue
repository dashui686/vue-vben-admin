<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, Input, message, Modal, Tree } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDeptList } from '#/api/system/dept';
import {
  changeUserStatus,
  deleteUser,
  exportUser,
  getUserList,
} from '#/api/system/user';
import { useBatchDelete, useGridSelection } from '#/composables/useGridHelper';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import ImportUser from './modules/import-user.vue';
import ResetPwd from './modules/reset-pwd.vue';

const router = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ResetPwdModal, resetPwdModalApi] = useVbenModal({
  connectedComponent: ResetPwd,
  destroyOnClose: true,
});

const [ImportModal, importModalApi] = useVbenModal({
  connectedComponent: ImportUser,
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
  useGridSelection<SystemUserApi.SystemUser>(() => gridApi);

const { onBatchDelete } = useBatchDelete(() => gridApi, deleteUser, 'userId');

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
          if (formValues?.dateRange?.length === 2) {
            params.beginTime = formValues.dateRange[0];
            params.endTime = formValues.dateRange[1];
          }
          delete params.dateRange;
          return await getUserList(params);
        },
      },
    },
    rowConfig: { keyField: 'userId' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

// Action handlers
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (code) {
    case 'authRole': {
      router.push(`/system/user-auth/role/${row.userId}`);
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
    case 'resetPwd': {
      resetPwdModalApi
        .setData({ userId: row.userId, userName: row.userName })
        .open();
      break;
    }
  }
}

function onEdit(row: SystemUserApi.SystemUser) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({ deptId: selectedDeptId.value }).open();
}

async function onDelete(row: SystemUserApi.SystemUser) {
  try {
    await deleteUser(String(row.userId));
    message.success($t('ui.actionMessage.deleteSuccess', [row.userName]));
    gridApi.query();
  } catch {}
}

async function onStatusChange(
  newStatus: string,
  row: SystemUserApi.SystemUser,
): Promise<boolean | undefined> {
  const statusText = newStatus === '0' ? '启用' : '停用';
  return new Promise<boolean | undefined>((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认要${statusText}用户"${row.userName}"吗？`,
      onOk: async () => {
        await changeUserStatus({ userId: row.userId, status: newStatus });
        message.success(`${statusText}成功`);
        resolve(true);
      },
      onCancel: () => {
        resolve(false as boolean | undefined);
      },
    });
  });
}

async function onExport() {
  const formValues = await gridApi.formApi.getValues();
  const params: any = { ...formValues };
  if (selectedDeptId.value) {
    params.deptId = selectedDeptId.value;
  }
  if (formValues?.dateRange?.length === 2) {
    params.beginTime = formValues.dateRange[0];
    params.endTime = formValues.dateRange[1];
  }
  delete params.dateRange;
  await exportUser(params);
}

function onImport() {
  importModalApi.open();
}

onMounted(() => {
  loadDeptTree();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <ResetPwdModal @success="gridApi.query()" />
    <ImportModal @success="gridApi.query()" />
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
        <Grid :table-title="$t('system.user.list')">
          <template #toolbar-tools>
            <div class="flex items-center gap-2">
              <Button
                v-access:code="'system:user:add'"
                type="primary"
                @click="onCreate"
              >
                <Plus class="size-5" />
                {{ $t('ui.actionTitle.create', [$t('system.user.name')]) }}
              </Button>
              <Button
                v-access:code="'system:user:edit'"
                :disabled="editDisabled"
                @click="onToolbarEdit(onEdit)"
              >
                {{ $t('common.edit') }}
              </Button>
              <Button
                v-access:code="'system:user:remove'"
                :disabled="deleteDisabled"
                danger
                @click="onBatchDelete"
              >
                {{ $t('common.delete') }}
              </Button>
              <Button v-access:code="'system:user:import'" @click="onImport">
                {{ $t('common.import') }}
              </Button>
              <Button v-access:code="'system:user:export'" @click="onExport">
                {{ $t('common.export') }}
              </Button>
            </div>
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>

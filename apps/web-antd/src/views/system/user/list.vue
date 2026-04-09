<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, Input, message, Modal, Tree } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDeptList } from '#/api/system/dept';
import { changeUserStatus, deleteUser, getUserList } from '#/api/system/user';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import ResetPwd from './modules/reset-pwd.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ResetPwdModal, resetPwdModalApi] = useVbenModal({
  connectedComponent: ResetPwd,
  destroyOnClose: true,
});

// 部门树相关
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

function onDeptSelect(selectedKeys: number[]) {
  selectedDeptId.value = selectedKeys.length > 0 ? selectedKeys[0] : undefined;
  gridApi.query();
}

// 用户操作
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'resetPwd': {
      onResetPwd(row);
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: SystemUserApi.SystemUser) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData({ deptId: selectedDeptId.value }).open();
}

function onDelete(row: SystemUserApi.SystemUser) {
  deleteUser(String(row.userId)).then(() => {
    message.success($t('ui.actionMessage.deleteSuccess', [row.userName]));
    onRefresh();
  });
}

function onResetPwd(row: SystemUserApi.SystemUser) {
  resetPwdModalApi
    .setData({ userId: row.userId, userName: row.userName })
    .open();
}

async function onStatusChange(
  newStatus: string,
  row: SystemUserApi.SystemUser,
) {
  const statusText = newStatus === '0' ? '启用' : '停用';
  return new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认要${statusText}用户"${row.userName}"吗？`,
      onOk: async () => {
        await changeUserStatus({ userId: row.userId, status: newStatus });
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
          const params: any = {
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          };
          // 部门树筛选
          if (selectedDeptId.value) {
            params.deptId = selectedDeptId.value;
          }
          // 日期范围
          if (formValues?.dateRange?.length === 2) {
            params.beginTime = formValues.dateRange[0];
            params.endTime = formValues.dateRange[1];
          }
          delete params.dateRange;
          return await getUserList(params);
        },
      },
    },
    rowConfig: {
      keyField: 'userId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

onMounted(() => {
  loadDeptTree();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <ResetPwdModal @success="onRefresh" />
    <div class="flex h-full gap-2">
      <!-- 左侧部门树 -->
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
      <!-- 右侧用户列表 -->
      <div class="flex-1">
        <Grid :table-title="$t('system.user.list')">
          <template #toolbar-tools>
            <Button type="primary" @click="onCreate">
              <Plus class="size-5" />
              {{ $t('ui.actionTitle.create', [$t('system.user.name')]) }}
            </Button>
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>

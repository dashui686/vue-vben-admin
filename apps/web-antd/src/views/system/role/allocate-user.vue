<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import { ArrowLeft } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { cancelAuthUser, cancelAuthUserAll, getAllocatedUserList } from '#/api';

import SelectUserModal from './modules/select-user.vue';

const router = useRouter();
const { closeCurrentTab } = useTabs();

// 从路由参数获取 roleId
const route = router.currentRoute.value;
const roleId = route.params.roleId as string;
const roleName = route.query.roleName as string;

// 添加用户弹窗
const selectUserVisible = ref(false);

// 已分配用户表格
const [AllocatedGrid, allocatedGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'userName',
        label: '用户名称',
        componentProps: {
          placeholder: '请输入用户名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'phonenumber',
        label: '手机号码',
        componentProps: {
          placeholder: '请输入手机号码',
        },
      },
    ],
    submitOnEnter: true,
    submitOnChange: true,
  },
  gridOptions: {
    checkboxConfig: {
      reserveCheckbox: true,
    },
    columns: [
      { type: 'checkbox', width: 50 },
      { field: 'userName', title: '用户名称' },
      { field: 'nickName', title: '用户昵称' },
      { field: 'email', title: '邮箱' },
      { field: 'phonenumber', title: '手机' },
      {
        field: 'status',
        title: '状态',
        align: 'center',
        cellRender: {
          name: 'CellTag',
          options: [
            { label: '正常', value: '0', color: 'success' },
            { label: '停用', value: '1', color: 'error' },
          ],
        },
      },
      {
        field: 'createTime',
        title: '创建时间',
        width: 180,
        align: 'center',
      },
      {
        align: 'center',
        cellRender: {
          attrs: {
            onClick: (e: any) => handleCancelAuthUser(e.row),
          },
          name: 'CellOperation',
          options: [
            {
              auth: 'system:role:edit',
              code: 'cancel',
              text: '取消授权',
              danger: true,
            },
          ],
        },
        field: 'action',
        fixed: 'right',
        title: '操作',
        width: 120,
      },
    ],
    height: 'auto',
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          if (!roleId) return { rows: [], total: 0 };
          return await getAllocatedUserList({
            roleId,
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            userName: formValues.userName || undefined,
            phonenumber: formValues.phonenumber || undefined,
          });
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
  } as VxeTableGridOptions,
});

// 选中的用户 ID
function getSelectedUserIds() {
  const checkedRecords = allocatedGridApi.grid.getCheckboxRecords();
  return checkedRecords.map((record: any) => record.userId);
}

// 取消授权
async function handleCancelAuthUser(row: any) {
  if (!roleId) return;

  Modal.confirm({
    title: '确认',
    content: `确认要取消该用户"${row.userName}"角色吗？`,
    onOk: async () => {
      await cancelAuthUser({
        roleId,
        userId: row.userId,
      });
      message.success('取消授权成功');
      allocatedGridApi.query();
    },
  });
}

// 批量取消授权
async function handleBatchCancel() {
  if (!roleId) return;

  const userIds = getSelectedUserIds();
  if (userIds.length === 0) {
    message.warning('请选择要取消授权的用户');
    return;
  }

  Modal.confirm({
    title: '确认',
    content: '是否取消选中用户授权数据项？',
    onOk: async () => {
      await cancelAuthUserAll({
        roleId,
        userIds: userIds.map(Number),
      });
      message.success('取消授权成功');
      allocatedGridApi.grid.clearCheckboxRow();
      allocatedGridApi.query();
    },
  });
}

// 打开选择用户弹窗
function openSelectUser() {
  selectUserVisible.value = true;
}

// 选择用户成功
function handleSelectUserSuccess() {
  selectUserVisible.value = false;
  allocatedGridApi.query();
}

// 关闭页面
function handleClose() {
  closeCurrentTab();
}
</script>

<template>
  <Page auto-content-height>
    <template #title>
      <div class="flex items-center gap-2">
        <Button type="text" @click="handleClose">
          <ArrowLeft class="size-5" />
        </Button>
        <span class="text-lg font-medium">分配用户 - {{ roleName }}</span>
      </div>
    </template>

    <template #extra>
      <div class="flex items-center gap-2">
        <Button type="primary" @click="openSelectUser">添加用户</Button>
        <Button danger @click="handleBatchCancel">批量取消授权</Button>
        <Button @click="handleClose">关闭</Button>
      </div>
    </template>

    <AllocatedGrid />

    <!-- 选择用户弹窗 -->
    <SelectUserModal
      :role-id="roleId"
      :open="selectUserVisible"
      @update:open="selectUserVisible = $event"
      @success="handleSelectUserSuccess"
    />
  </Page>
</template>

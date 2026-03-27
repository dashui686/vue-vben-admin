<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { allocateRoleUsers, getUnallocatedUserList } from '#/api';

const props = defineProps<{
  open?: boolean;
  roleId?: string;
}>();

const emits = defineEmits(['success', 'update:open']);

// 加载状态
const confirmLoading = ref(false);

// 未分配用户表格
const [UnallocatedGrid, unallocatedGridApi] = useVbenVxeGrid({
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
      { field: 'userName', title: '用户名称', width: 150 },
      { field: 'nickName', title: '用户昵称', width: 120 },
      { field: 'email', title: '邮箱', width: 180 },
      { field: 'phonenumber', title: '手机', width: 130 },
      {
        field: 'status',
        title: '状态',
        width: 100,
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
    ],
    height: 'auto',
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          if (!props.roleId) return { rows: [], total: 0 };
          return await getUnallocatedUserList({
            roleId: props.roleId,
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

// 获取选中的用户 ID
function getSelectedUserIds() {
  const checkedRecords = unallocatedGridApi.grid.getCheckboxRecords();
  return checkedRecords.map((record: any) => Number(record.userId));
}

// 确定分配
async function handleConfirm() {
  if (!props.roleId) return;

  const userIds = getSelectedUserIds();
  if (userIds.length === 0) {
    message.warning('请选择要分配的用户');
    return;
  }

  confirmLoading.value = true;
  try {
    await allocateRoleUsers({
      roleId: props.roleId,
      userIds,
    });
    message.success(`已分配 ${userIds.length} 个用户`);
    // 清除选中状态
    unallocatedGridApi.grid.clearCheckboxRow();
    emits('success');
    emits('update:open', false);
  } catch (error) {
    console.error('分配用户失败:', error);
  } finally {
    confirmLoading.value = false;
  }
}

// 关闭弹窗
function handleCancel() {
  // 清除选中状态
  unallocatedGridApi.grid.clearCheckboxRow();
  emits('update:open', false);
}

// 监听弹窗打开
watch(
  () => props.open,
  (val) => {
    if (val) {
      unallocatedGridApi.query();
    }
  },
);
</script>

<template>
  <Modal
    :open="open"
    title="选择用户"
    width="1000px"
    :mask-closable="false"
    :confirm-loading="confirmLoading"
    @cancel="handleCancel"
    @ok="handleConfirm"
  >
    <div class="p-4">
      <UnallocatedGrid />
    </div>
  </Modal>
</template>

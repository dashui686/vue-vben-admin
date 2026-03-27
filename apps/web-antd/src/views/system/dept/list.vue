<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDept, getDeptList, updateDept } from '#/api/system/dept';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/**
 * 编辑部门
 */
function onEdit(row: SystemDeptApi.SystemDept) {
  formModalApi.setData(row).open();
}

/**
 * 添加下级部门
 */
function onAppend(row: SystemDeptApi.SystemDept) {
  formModalApi.setData({ parentId: row.deptId, deptName: '' }).open();
}

/**
 * 创建新部门
 */
function onCreate() {
  formModalApi.setData({}).open();
}

/**
 * 删除部门
 */
function onDelete(row: SystemDeptApi.SystemDept) {
  deleteDept(row.deptId).then(() => {
    refreshGrid();
  });
}

/**
 * 状态切换
 */
async function onStatusChange(
  newStatus: string,
  row: SystemDeptApi.SystemDept,
) {
  const statusText = newStatus === '0' ? '启用' : '停用';
  return new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认要${statusText}部门"${row.deptName}"吗？`,
      onOk: async () => {
        await updateDept(row.deptId, { ...row, status: newStatus });
        message.success(`${statusText}成功`);
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
    });
  });
}

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemDeptApi.SystemDept>) {
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
      enabled: false,
    },
    rowConfig: {
      keyField: 'deptId',
    },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues) => {
          const list = await getDeptList(formValues);
          return list;
        },
      },
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
    treeConfig: {
      expandAll: true,
      parentField: 'parentId',
      rowField: 'deptId',
      transform: true,
    },
  } as VxeTableGridOptions,
});

/**
 * 刷新表格
 */
function refreshGrid() {
  gridApi.query();
}

/**
 * 全部展开
 */
function expandAll() {
  gridApi.grid.setAllTreeExpand(true);
}

/**
 * 全部折叠
 */
function collapseAll() {
  gridApi.grid.clearTreeExpand();
}

/**
 * 保存排序
 */
async function saveOrder() {
  const grid = gridApi.grid;
  const tableData = grid.getTableData().fullData;
  const orderList: Array<{ data: any; deptId: string }> = [];

  // 遍历表格数据，收集排序信息
  function collectOrder(data: any[]) {
    data.forEach((item) => {
      orderList.push({
        deptId: item.deptId,
        data: item,
      });
      if (item.children?.length) {
        collectOrder(item.children);
      }
    });
  }

  collectOrder(tableData);

  try {
    // 批量更新排序 - 只传递必要字段
    await Promise.all(
      orderList.map((item) =>
        updateDept(item.deptId, {
          parentId: item.data.parentId,
          deptName: item.data.deptName,
          deptCategory: item.data.deptCategory,
          orderNum: item.data.orderNum,
          leader: item.data.leader,
          phone: item.data.phone,
          email: item.data.email,
          status: item.data.status,
        }),
      ),
    );
    message.success('保存排序成功');
    refreshGrid();
  } catch (error) {
    console.error('保存排序失败:', error);
    message.error('保存排序失败');
  }
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid :table-title="$t('system.dept.list')">
      <template #toolbar-tools>
        <div class="flex items-center gap-2">
          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            {{ $t('ui.actionTitle.create', [$t('system.dept.name')]) }}
          </Button>
          <Button @click="saveOrder">保存排序</Button>
          <Button @click="expandAll">展开</Button>
          <Button @click="collapseAll">折叠</Button>
        </div>
      </template>
    </Grid>
  </Page>
</template>

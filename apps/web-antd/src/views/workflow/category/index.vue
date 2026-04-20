<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { nextTick } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { categoryList, categoryRemove } from '#/api/workflow/category';

import categoryModal from './category-modal.vue';
import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async (_, formValues = {}) => {
        const resp = await categoryList({
          ...formValues,
        });
        return { rows: resp };
      },
      querySuccess: () => {
        nextTick(() => {
          expandAll();
        });
      },
    },
  },
  scrollY: {
    enabled: false,
    gt: 0,
  },
  rowConfig: {
    keyField: 'categoryId',
  },
  treeConfig: {
    parentField: 'parentId',
    rowField: 'categoryId',
    transform: true,
  },
  id: 'workflow-category-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [CategoryModal, modalApi] = useVbenModal({
  connectedComponent: categoryModal,
});

function handleAdd(row?: Recordable<any>) {
  modalApi.setData({ parentId: row?.categoryId });
  modalApi.open();
}

async function handleEdit(row: Recordable<any>) {
  modalApi.setData({ id: row.categoryId });
  modalApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await categoryRemove(row.categoryId);
  await tableApi.query();
}

function expandAll() {
  tableApi.grid?.setAllTreeExpand(true);
}

function collapseAll() {
  tableApi.grid?.setAllTreeExpand(false);
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="流程分类列表">
      <template #toolbar-tools>
        <Space>
          <a-button @click="collapseAll"> 折叠全部 </a-button>
          <a-button @click="expandAll"> 展开全部 </a-button>
          <a-button
            type="primary"
            v-access:code="['workflow:category:add']"
            @click="handleAdd"
          >
            新增
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <a-button
            type="link"
            size="small"
            v-access:code="['workflow:category:edit']"
            @click.stop="handleEdit(row)"
          >
            编辑
          </a-button>
          <a-button
            type="link"
            size="small"
            v-access:code="['workflow:category:edit']"
            @click.stop="handleAdd(row)"
          >
            新增
          </a-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <a-button
              type="link"
              size="small"
              danger
              v-access:code="['workflow:category:remove']"
              @click.stop=""
            >
              删除
            </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <CategoryModal @reload="tableApi.query()" />
  </Page>
</template>

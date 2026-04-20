<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Spel } from '#/api/workflow/spel/model';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { configRemove } from '#/api/system/config';
import { spelList } from '#/api/workflow/spel';

import { columns, querySchema } from './data';
import spelDrawer from './spel-drawer.vue';

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
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await spelList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'workflow-spel-index',
  showOverflow: false,
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});
const [SpelDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: spelDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: Spel) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleDelete(row: Spel) {
  await configRemove([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: Spel) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await configRemove(ids);
      await tableApi.query();
    },
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="流程表达式列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            :disabled="tableApi.grid.getCheckboxRecords().length === 0"
            danger
            type="primary"
            v-access:code="['system:config:remove']"
            @click="handleMultiDelete"
          >
            删除
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:config:add']"
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
            v-access:code="['system:config:edit']"
            @click.stop="handleEdit(row)"
          >
            编辑
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
              v-access:code="['system:config:remove']"
              @click.stop=""
            >
              删除
            </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <SpelDrawer @reload="tableApi.query()" />
  </Page>
</template>

<script lang="ts" setup>
import type { ToolGenApi } from '#/api/tool/gen';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Form, FormItem, Input, message, Table } from 'ant-design-vue';

import { importTable, listDbTable } from '#/api/tool/gen';

const emit = defineEmits(['success']);

const dbTableList = ref<ToolGenApi.DbTable[]>([]);
const selectedRowKeys = ref<string[]>([]);
const loading = ref(false);
const total = ref(0);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  tableName: '',
  tableComment: '',
});

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if (isOpen) {
      selectedRowKeys.value = [];
      queryParams.value = {
        pageNum: 1,
        pageSize: 10,
        tableName: '',
        tableComment: '',
      };
      await loadDbTables();
    }
  },
});

async function loadDbTables() {
  loading.value = true;
  try {
    const res = await listDbTable(queryParams.value);
    // db/list 返回分页格式 { rows, total } 或数组
    if (Array.isArray(res)) {
      dbTableList.value = res;
      total.value = 0;
    } else {
      dbTableList.value = (res as any).rows || [];
      total.value = (res as any).total || 0;
    }
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  queryParams.value.pageNum = 1;
  loadDbTables();
}

function handleReset() {
  queryParams.value.tableName = '';
  queryParams.value.tableComment = '';
  queryParams.value.pageNum = 1;
  loadDbTables();
}

function handleTableChange(pagination: any) {
  queryParams.value.pageNum = pagination.current;
  queryParams.value.pageSize = pagination.pageSize;
  loadDbTables();
}

async function handleImport() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要导入的表');
    return;
  }
  const tables = selectedRowKeys.value.join(',');
  await importTable(tables);
  message.success('导入成功');
  modalApi.close();
  emit('success');
}

const rowSelection = {
  selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
  },
};
</script>

<template>
  <Modal title="导入表" class="w-[800px]">
    <Form layout="inline" class="mb-3">
      <FormItem label="表名称">
        <Input
          v-model:value="queryParams.tableName"
          placeholder="请输入表名称"
          @press-enter="handleSearch"
        />
      </FormItem>
      <FormItem label="表描述">
        <Input
          v-model:value="queryParams.tableComment"
          placeholder="请输入表描述"
          @press-enter="handleSearch"
        />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button class="ml-2" @click="handleReset">重置</Button>
      </FormItem>
    </Form>

    <Table
      :data-source="dbTableList"
      :loading="loading"
      :row-selection="rowSelection"
      row-key="tableName"
      :pagination="{
        current: queryParams.pageNum,
        pageSize: queryParams.pageSize,
        total,
        showSizeChanger: true,
        showTotal: (t: number) => `共 ${t} 条`,
      }"
      size="small"
      @change="handleTableChange"
    >
      <Table.Column title="表名称" data-index="tableName" />
      <Table.Column title="表描述" data-index="tableComment" />
      <Table.Column title="创建时间" data-index="createTime" width="160" />
      <Table.Column title="更新时间" data-index="updateTime" width="160" />
    </Table>

    <template #prepend-footer>
      <div class="flex-auto">
        <Button @click="modalApi.close()">取消</Button>
      </div>
    </template>
    <template #footer>
      <Button type="primary" @click="handleImport">确定</Button>
    </template>
  </Modal>
</template>

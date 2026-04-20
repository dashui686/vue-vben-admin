<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { ToolGenApi } from '#/api/tool/gen';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal, TabPane, Tabs } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchGenCode,
  delTable,
  genCode,
  listTable,
  previewTable,
  synchDb,
} from '#/api/tool/gen';

import { useColumns, useGridFormSchema } from './data';
import ImportTable from './modules/import-table.vue';

const router = useRouter();

const [ImportModal, importModalApi] = useVbenModal({
  connectedComponent: ImportTable,
  destroyOnClose: true,
});

// 预览相关
const previewOpen = ref(false);
const previewData = ref<Record<string, string>>({});
const activeTab = ref('');

function onActionClick({
  code,
  row,
}: OnActionClickParams<ToolGenApi.GenTable>) {
  // 未导入的表（tableId 为空）只有删除操作可用
  if (!row.tableId && code !== 'delete') {
    message.warning('请先导入该表后再进行操作');
    return;
  }
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'genCode': {
      onGenCode(row);
      break;
    }
    case 'preview': {
      onPreview(row);
      break;
    }
    case 'synchDb': {
      onSynchDb(row);
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: ToolGenApi.GenTable) {
  if (!row.tableId) {
    message.warning('请先导入该表');
    return;
  }
  router.push(`/tool/gen-edit/${row.tableId}`);
}

function onDelete(row: ToolGenApi.GenTable) {
  if (!row.tableId) {
    message.warning('未导入的表无需删除');
    return;
  }
  Modal.confirm({
    title: '系统提示',
    content: `确认要删除表"${row.tableName}"的生成配置吗？`,
    onOk: async () => {
      await delTable(String(row.tableId));
      message.success('删除成功');
      onRefresh();
    },
  });
}

async function onPreview(row: ToolGenApi.GenTable) {
  if (!row.tableId) return;
  try {
    const data = await previewTable(row.tableId);
    previewData.value = data || {};
    const keys = Object.keys(previewData.value);
    activeTab.value = keys.length > 0 ? getFileName(keys[0] as string) : '';
    previewOpen.value = true;
  } catch {
    message.error('预览失败');
  }
}

function onSynchDb(row: ToolGenApi.GenTable) {
  if (!row.tableId) return;
  Modal.confirm({
    title: '确认同步',
    content: `确认要强制同步"${row.tableName}"表结构吗？`,
    onOk: async () => {
      try {
        await synchDb(row.tableId);
        message.success('同步成功');
      } catch {
        message.error('同步失败');
      }
    },
  });
}

function onGenCode(row: ToolGenApi.GenTable) {
  if (!row.tableId) return;
  if (row.genType === '1') {
    genCode(row.tableName).then(() => {
      message.success(`成功生成到自定义路径：${row.genPath}`);
    });
  } else {
    batchGenCode(String(row.tableId));
  }
}

function onBatchGen() {
  const records = gridApi.grid.getCheckboxRecords();
  if (records.length === 0) {
    message.warning('请选择要生成的表');
    return;
  }
  // 过滤掉未导入的表
  const validRecords = records.filter((r: ToolGenApi.GenTable) => r.tableId);
  if (validRecords.length === 0) {
    message.warning('所选表均未导入，请先导入');
    return;
  }
  const ids = validRecords.map((r: ToolGenApi.GenTable) => r.tableId).join(',');
  batchGenCode(ids);
}

function onOpenImport() {
  importModalApi.setData({}).open();
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
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
          if (formValues?.dateRange?.length === 2) {
            params.beginTime = formValues.dateRange[0];
            params.endTime = formValues.dateRange[1];
          }
          delete params.dateRange;
          return await listTable(params);
        },
      },
    },
    // 使用 tableName 作为行 key（tableId 可能为 null）
    rowConfig: { keyField: 'tableName' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<ToolGenApi.GenTable>,
});

function getFileName(key: string): string {
  const prefix = key.startsWith('vben/') ? '[vben] ' : '';
  return prefix + key.slice(key.lastIndexOf('/') + 1, key.indexOf('.vm'));
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code);
  message.success('复制成功');
}
</script>

<template>
  <Page auto-content-height>
    <ImportModal @success="onRefresh" />

    <!-- 预览弹窗 -->
    <Modal
      v-model:open="previewOpen"
      title="代码预览"
      width="80%"
      :footer="null"
      style="top: 20px"
    >
      <Tabs v-model:active-key="activeTab">
        <TabPane
          v-for="(value, key) in previewData"
          :key="getFileName(key)"
          :tab="getFileName(key)"
        >
          <div class="relative">
            <Button
              size="small"
              class="absolute right-0 top-0 z-10"
              @click="copyCode(value)"
            >
              复制
            </Button>
            <pre
              class="mt-6 max-h-[600px] overflow-auto rounded bg-gray-50 p-4 text-sm"
            ><code>{{ value }}</code></pre>
          </div>
        </TabPane>
      </Tabs>
    </Modal>

    <Grid table-title="代码生成">
      <template #toolbar-tools>
        <div class="flex items-center gap-2">
          <Button
            v-access:code="'tool:gen:code'"
            type="primary"
            @click="onBatchGen"
          >
            生成
          </Button>
          <Button v-access:code="'tool:gen:import'" @click="onOpenImport">
            导入
          </Button>
        </div>
      </template>
    </Grid>
  </Page>
</template>

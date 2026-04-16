<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDictDataApi, SystemDictTypeApi } from '#/api/system/dict';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDictData,
  deleteDictType,
  exportDictType,
  getDictDataList,
  getDictTypeList,
  refreshDictCache,
} from '#/api/system/dict';
import { $t } from '#/locales';

import {
  useDictDataColumns,
  useDictDataGridFormSchema,
  useDictTypeColumns,
  useDictTypeGridFormSchema,
} from './data';
import DictDataForm from './modules/dict-data-form.vue';
import DictTypeForm from './modules/dict-type-form.vue';

// ===== 字典类型 =====
const [DictTypeFormModal, dictTypeFormModalApi] = useVbenModal({
  connectedComponent: DictTypeForm,
  destroyOnClose: true,
});

// ===== 字典数据 =====
const [DictDataFormModal, dictDataFormModalApi] = useVbenModal({
  connectedComponent: DictDataForm,
  destroyOnClose: true,
});

const currentDictType = ref<string>();

async function onDictTypeActionClick({
  code,
  row,
}: OnActionClickParams<SystemDictTypeApi.SystemDictType>) {
  switch (code) {
    case 'delete': {
      try {
        await deleteDictType(String(row.dictId));
        message.success($t('ui.actionMessage.deleteSuccess', [row.dictName]));
        dictTypeGridApi.query();
      } catch {}
      break;
    }
    case 'dictData': {
      currentDictType.value = row.dictType;
      dictDataGridApi.query();
      break;
    }
    case 'edit': {
      dictTypeFormModalApi.setData(row).open();
      break;
    }
  }
}

async function onDictDataActionClick({
  code,
  row,
}: OnActionClickParams<SystemDictDataApi.SystemDictData>) {
  switch (code) {
    case 'delete': {
      try {
        await deleteDictData(String(row.dictCode));
        message.success($t('ui.actionMessage.deleteSuccess', [row.dictLabel]));
        dictDataGridApi.query();
      } catch {}
      break;
    }
    case 'edit': {
      dictDataFormModalApi
        .setData({ ...row, dictType: currentDictType.value })
        .open();
      break;
    }
  }
}

// 字典类型列表
const [DictTypeGrid, dictTypeGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDictTypeGridFormSchema(),
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useDictTypeColumns(onDictTypeActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: true },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getDictTypeList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'dictId' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemDictTypeApi.SystemDictType>,
});

// 字典数据列表
const [DictDataGrid, dictDataGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDictDataGridFormSchema(),
    submitOnChange: true,
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useDictDataColumns(onDictDataActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: true },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          if (!currentDictType.value) return { rows: [], total: 0 };
          return await getDictDataList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            dictType: currentDictType.value,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'dictCode' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemDictDataApi.SystemDictData>,
});

function onCreateDictType() {
  dictTypeFormModalApi.setData({}).open();
}

function onCreateDictData() {
  dictDataFormModalApi.setData({ dictType: currentDictType.value }).open();
}

function onBackToTypes() {
  currentDictType.value = undefined;
}

async function onBatchDeleteDictType() {
  const records = dictTypeGridApi.grid.getCheckboxRecords();
  if (records.length === 0) {
    message.warning('请至少选择一条记录');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `确认要删除选中的${records.length}条记录吗？`,
    onOk: async () => {
      const dictIds = records
        .map((r: SystemDictTypeApi.SystemDictType) => r.dictId)
        .join(',');
      await deleteDictType(dictIds);
      message.success('删除成功');
      dictTypeGridApi.query();
    },
  });
}

async function onBatchDeleteDictData() {
  const records = dictDataGridApi.grid.getCheckboxRecords();
  if (records.length === 0) {
    message.warning('请至少选择一条记录');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `确认要删除选中的${records.length}条记录吗？`,
    onOk: async () => {
      const dictCodes = records
        .map((r: SystemDictDataApi.SystemDictData) => r.dictCode)
        .join(',');
      await deleteDictData(dictCodes);
      message.success('删除成功');
      dictDataGridApi.query();
    },
  });
}

async function onExportDictType() {
  const formValues = await dictTypeGridApi.formApi.getValues();
  await exportDictType(formValues);
  message.success('导出成功');
}

function onRefreshCache() {
  Modal.confirm({
    title: '确认刷新',
    content: '确认要刷新字典缓存吗？',
    onOk: async () => {
      await refreshDictCache();
      message.success('刷新成功');
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <DictTypeFormModal @success="dictTypeGridApi.query()" />
    <DictDataFormModal @success="dictDataGridApi.query()" />

    <!-- 字典数据视图 -->
    <template v-if="currentDictType">
      <DictDataGrid :table-title="`字典数据 - ${currentDictType}`">
        <template #toolbar-tools>
          <div class="flex items-center gap-2">
            <Button @click="onBackToTypes">返回字典类型</Button>
            <Button type="primary" @click="onCreateDictData">
              <Plus class="size-5" />
              {{ $t('ui.actionTitle.create', ['字典数据']) }}
            </Button>
            <Button danger @click="onBatchDeleteDictData">删除</Button>
          </div>
        </template>
      </DictDataGrid>
    </template>

    <!-- 字典类型视图 -->
    <template v-else>
      <DictTypeGrid :table-title="$t('system.dict.typeList')">
        <template #toolbar-tools>
          <div class="flex items-center gap-2">
            <Button type="primary" @click="onCreateDictType">
              <Plus class="size-5" />
              {{ $t('ui.actionTitle.create', [$t('system.dict.name')]) }}
            </Button>
            <Button danger @click="onBatchDeleteDictType">删除</Button>
            <Button @click="onExportDictType">导出</Button>
            <Button @click="onRefreshCache">刷新缓存</Button>
          </div>
        </template>
      </DictTypeGrid>
    </template>
  </Page>
</template>

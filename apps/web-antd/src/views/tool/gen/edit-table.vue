<script lang="ts" setup>
import type { ToolGenApi } from '#/api/tool/gen';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Checkbox,
  Form,
  FormItem,
  Input,
  message,
  RadioButton,
  RadioGroup,
  Select,
  Spin,
  Table,
  TabPane,
  Tabs,
  TreeSelect,
} from 'ant-design-vue';

import { getDictTypeOptionselect } from '#/api/system/dict';
import { getMenuTreeselect } from '#/api/system/menu';
import { getGenTable, updateGenTable } from '#/api/tool/gen';

const route = useRoute();
const router = useRouter();
const tableId = Number(route.params.tableId);

const activeTab = ref('basic');
const info = ref<ToolGenApi.GenTable>({} as ToolGenApi.GenTable);
const columns = ref<ToolGenApi.GenTableColumn[]>([]);
const tables = ref<ToolGenApi.GenTable[]>([]);
const loading = ref(false);
const dictOptions = ref<Array<{ dictName: string; dictType: string }>>([]);
const menuTree = ref<Array<any>>([]);
const submitting = ref(false);

const tplOptions = [
  { label: '单表（增删改查）', value: 'crud' },
  { label: '树表（增删改查）', value: 'tree' },
  { label: '主子表（增删改查）', value: 'sub' },
];

const tplWebTypeOptions = [
  { label: 'Vue3 Element Plus 模版', value: 'element-plus' },
  { label: 'Vue3 Vben Admin 模版', value: 'vben' },
];

const javaTypeOptions = [
  { label: 'Long', value: 'Long' },
  { label: 'String', value: 'String' },
  { label: 'Integer', value: 'Integer' },
  { label: 'Double', value: 'Double' },
  { label: 'BigDecimal', value: 'BigDecimal' },
  { label: 'Date', value: 'Date' },
  { label: 'Boolean', value: 'Boolean' },
];

const queryTypeOptions = [
  { label: '=', value: 'EQ' },
  { label: '!=', value: 'NE' },
  { label: '>', value: 'GT' },
  { label: '>=', value: 'GTE' },
  { label: '<', value: 'LT' },
  { label: '<=', value: 'LTE' },
  { label: 'LIKE', value: 'LIKE' },
  { label: 'BETWEEN', value: 'BETWEEN' },
];

const htmlTypeOptions = [
  { label: '文本框', value: 'input' },
  { label: '文本域', value: 'textarea' },
  { label: '下拉框', value: 'select' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '日期控件', value: 'datetime' },
  { label: '图片上传', value: 'imageUpload' },
  { label: '文件上传', value: 'fileUpload' },
  { label: '富文本控件', value: 'editor' },
];

// 字段选择列表(用于树编码/父编码/名称字段)
const columnOptions = computed(() =>
  columns.value.map((col) => ({
    label: `${col.columnName}：${col.columnComment || ''}`,
    value: col.columnName,
  })),
);

// 子表关联表选择列表
const tableOptions = computed(() =>
  tables.value.map((t) => ({
    label: `${t.tableName}：${t.tableComment || ''}`,
    value: t.tableName,
  })),
);

// 当前子表关联的外键列选择
const subTableFkOptions = computed(() => {
  if (!info.value.subTableName) return [];
  const subTable = tables.value.find(
    (t) => t.tableName === info.value.subTableName,
  );
  if (!subTable?.columns) return [];
  return subTable.columns.map((col) => ({
    label: `${col.columnName}：${col.columnComment || ''}`,
    value: col.columnName,
  }));
});

// 菜单树转换 (后端 Tree<Long> 结构: { id, name, weight, parentId, children })
const menuTreeData = computed(() => {
  return convertMenuTree(menuTree.value);
});

function convertMenuTree(
  list: Array<any>,
): Array<{ children?: any[]; key: number; title: string; value: number }> {
  return list.map((item) => ({
    title: item.name as string,
    value: item.id as number,
    key: item.id as number,
    children: item.children?.length
      ? convertMenuTree(item.children)
      : undefined,
  }));
}

// Checkbox 切换辅助 (后端字段值为 '0'/'1' 字符串)
function toggleStrField(record: any, field: string) {
  record[field] = record[field] === '1' ? '0' : '1';
}

onMounted(async () => {
  loading.value = true;
  try {
    const [genData, dictRes, menuRes] = await Promise.all([
      getGenTable(tableId),
      getDictTypeOptionselect(),
      getMenuTreeselect({}),
    ]);
    // 后端返回 { info: GenTable, rows: GenTableColumn[], tables: GenTable[] }
    info.value = genData.info;
    columns.value = genData.rows || [];
    tables.value = genData.tables || [];
    dictOptions.value = Array.isArray(dictRes) ? dictRes : [];
    menuTree.value = Array.isArray(menuRes) ? menuRes : [];
  } catch {
    message.error('加载表信息失败');
  } finally {
    loading.value = false;
  }
});

async function handleSave() {
  submitting.value = true;
  try {
    const data = {
      ...info.value,
      columns: columns.value,
      params: {
        treeCode: info.value.treeCode,
        treeName: info.value.treeName,
        treeParentCode: info.value.treeParentCode,
        parentMenuId: info.value.parentMenuId,
      },
    };
    await updateGenTable(data as any);
    message.success('保存成功');
    handleBack();
  } catch {
    message.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

function handleBack() {
  router.push('/tool/gen');
}
</script>

<template>
  <Page auto-content-height>
    <Spin :spinning="loading">
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span>修改生成配置 - {{ info.tableName }}</span>
            <div class="flex gap-2">
              <Button @click="handleBack">返回</Button>
              <Button
                type="primary"
                :loading="submitting"
                @click="handleSave"
              >
                保存
              </Button>
            </div>
          </div>
        </template>

        <Tabs v-model:active-key="activeTab">
          <!-- 基本信息 -->
          <TabPane key="basic" tab="基本信息">
            <Form layout="vertical" class="max-w-[800px]">
              <div class="grid grid-cols-2 gap-x-4">
                <FormItem label="表名称" required>
                  <Input v-model:value="info.tableName" />
                </FormItem>
                <FormItem label="表描述" required>
                  <Input v-model:value="info.tableComment" />
                </FormItem>
                <FormItem label="实体类名称" required>
                  <Input v-model:value="info.className" />
                </FormItem>
                <FormItem label="作者" required>
                  <Input v-model:value="info.functionAuthor" />
                </FormItem>
                <FormItem label="生成包路径">
                  <Input v-model:value="info.packageName" />
                </FormItem>
                <FormItem label="生成模块名">
                  <Input v-model:value="info.moduleName" />
                </FormItem>
                <FormItem label="生成业务名">
                  <Input v-model:value="info.businessName" />
                </FormItem>
                <FormItem label="生成功能名">
                  <Input v-model:value="info.functionName" />
                </FormItem>
                <FormItem label="数据源名称">
                  <Input v-model:value="info.dataName" />
                </FormItem>
                <FormItem label="备注">
                  <Input v-model:value="info.remark" />
                </FormItem>
              </div>
            </Form>
          </TabPane>

          <!-- 字段信息 -->
          <TabPane key="columns" tab="字段信息">
            <Table
              :data-source="columns"
              :pagination="false"
              :scroll="{ x: 1800 }"
              row-key="columnId"
              size="small"
              bordered
            >
              <Table.Column
                title="字段列名"
                data-index="columnName"
                width="120"
                fixed="left"
              />
              <Table.Column title="字段描述" width="120">
                <template #default="{ record }">
                  <Input
                    v-model:value="record.columnComment"
                    size="small"
                  />
                </template>
              </Table.Column>
              <Table.Column
                title="物理类型"
                data-index="columnType"
                width="100"
              />
              <Table.Column title="Java类型" width="120">
                <template #default="{ record }">
                  <Select
                    v-model:value="record.javaType"
                    size="small"
                    :options="javaTypeOptions"
                  />
                </template>
              </Table.Column>
              <Table.Column title="Java属性" width="120">
                <template #default="{ record }">
                  <Input v-model:value="record.javaField" size="small" />
                </template>
              </Table.Column>
              <Table.Column title="插入" width="60" align="center">
                <template #default="{ record }">
                  <Checkbox
                    :checked="record.isInsert === '1'"
                    @change="toggleStrField(record, 'isInsert')"
                  />
                </template>
              </Table.Column>
              <Table.Column title="编辑" width="60" align="center">
                <template #default="{ record }">
                  <Checkbox
                    :checked="record.isEdit === '1'"
                    @change="toggleStrField(record, 'isEdit')"
                  />
                </template>
              </Table.Column>
              <Table.Column title="列表" width="60" align="center">
                <template #default="{ record }">
                  <Checkbox
                    :checked="record.isList === '1'"
                    @change="toggleStrField(record, 'isList')"
                  />
                </template>
              </Table.Column>
              <Table.Column title="查询" width="60" align="center">
                <template #default="{ record }">
                  <Checkbox
                    :checked="record.isQuery === '1'"
                    @change="toggleStrField(record, 'isQuery')"
                  />
                </template>
              </Table.Column>
              <Table.Column title="查询方式" width="120">
                <template #default="{ record }">
                  <Select
                    v-model:value="record.queryType"
                    size="small"
                    :options="queryTypeOptions"
                  />
                </template>
              </Table.Column>
              <Table.Column title="必填" width="60" align="center">
                <template #default="{ record }">
                  <Checkbox
                    :checked="record.isRequired === '1'"
                    @change="toggleStrField(record, 'isRequired')"
                  />
                </template>
              </Table.Column>
              <Table.Column title="显示类型" width="140">
                <template #default="{ record }">
                  <Select
                    v-model:value="record.htmlType"
                    size="small"
                    :options="htmlTypeOptions"
                  />
                </template>
              </Table.Column>
              <Table.Column title="字典类型" width="180">
                <template #default="{ record }">
                  <Select
                    v-model:value="record.dictType"
                    size="small"
                    show-search
                    allow-clear
                    :options="
                      dictOptions.map((d) => ({
                        label: d.dictName,
                        value: d.dictType,
                      }))
                    "
                    placeholder="请选择字典"
                    :filter-option="
                      (input: string, option: any) =>
                        option.label?.includes(input) ||
                        option.value?.includes(input)
                    "
                  />
                </template>
              </Table.Column>
            </Table>
          </TabPane>

          <!-- 生成信息 -->
          <TabPane key="genInfo" tab="生成信息">
            <Form layout="vertical" class="max-w-[800px]">
              <div class="grid grid-cols-2 gap-x-4">
                <FormItem label="生成模板">
                  <Select
                    v-model:value="info.tplCategory"
                    :options="tplOptions"
                  />
                </FormItem>
                <FormItem label="前端类型">
                  <Select
                    v-model:value="info.tplWebType"
                    :options="tplWebTypeOptions"
                  />
                </FormItem>
                <FormItem label="生成包路径">
                  <Input v-model:value="info.packageName" />
                </FormItem>
                <FormItem label="生成模块名">
                  <Input v-model:value="info.moduleName" />
                </FormItem>
                <FormItem label="生成业务名">
                  <Input v-model:value="info.businessName" />
                </FormItem>
                <FormItem label="生成功能名">
                  <Input v-model:value="info.functionName" />
                </FormItem>
                <FormItem label="上级菜单">
                  <TreeSelect
                    v-model:value="info.parentMenuId"
                    :tree-data="menuTreeData"
                    placeholder="请选择上级菜单"
                    tree-default-expand-all
                    allow-clear
                    :field-names="{
                      label: 'title',
                      value: 'value',
                      children: 'children',
                    }"
                  />
                </FormItem>
                <FormItem label="生成代码方式">
                  <RadioGroup v-model:value="info.genType">
                    <RadioButton value="0">zip压缩包</RadioButton>
                    <RadioButton value="1">自定义路径</RadioButton>
                  </RadioGroup>
                </FormItem>
                <FormItem
                  v-if="info.genType === '1'"
                  label="自定义路径"
                  class="col-span-2"
                >
                  <Input v-model:value="info.genPath" />
                </FormItem>
              </div>

              <!-- 树表相关 -->
              <template v-if="info.tplCategory === 'tree'">
                <div class="mb-2 mt-4 text-base font-bold">树表信息</div>
                <div class="grid grid-cols-2 gap-x-4">
                  <FormItem label="树编码字段">
                    <Select
                      v-model:value="info.treeCode"
                      :options="columnOptions"
                      placeholder="请选择"
                      allow-clear
                    />
                  </FormItem>
                  <FormItem label="树父编码字段">
                    <Select
                      v-model:value="info.treeParentCode"
                      :options="columnOptions"
                      placeholder="请选择"
                      allow-clear
                    />
                  </FormItem>
                  <FormItem label="树名称字段">
                    <Select
                      v-model:value="info.treeName"
                      :options="columnOptions"
                      placeholder="请选择"
                      allow-clear
                    />
                  </FormItem>
                </div>
              </template>

              <!-- 主子表相关 -->
              <template v-if="info.tplCategory === 'sub'">
                <div class="mb-2 mt-4 text-base font-bold">关联信息</div>
                <div class="grid grid-cols-2 gap-x-4">
                  <FormItem label="关联子表的表名">
                    <Select
                      v-model:value="info.subTableName"
                      :options="tableOptions"
                      placeholder="请选择"
                      allow-clear
                    />
                  </FormItem>
                  <FormItem label="子表关联的外键名">
                    <Select
                      v-model:value="info.subTableFkName"
                      :options="subTableFkOptions"
                      placeholder="请选择"
                      allow-clear
                    />
                  </FormItem>
                </div>
              </template>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </Spin>
  </Page>
</template>

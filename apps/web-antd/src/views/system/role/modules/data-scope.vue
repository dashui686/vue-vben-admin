<script lang="ts" setup>
import { ref, watch } from 'vue';

import { Checkbox, Input, Modal, Radio, Spin, Tree } from 'ant-design-vue';

import { allocateDataScope, getRoleDeptTree } from '#/api';
import { getAllTreeKeys } from '#/composables/useGridHelper';

const props = defineProps<{
  dataScope?: string;
  open?: boolean;
  roleId?: string;
  roleKey?: string;
  roleName?: string;
}>();

const emits = defineEmits(['success', 'update:open']);

const loadingDeptTree = ref(false);
const deptTreeData = ref<any[]>([]);
const checkedDeptKeys = ref<string[]>([]);
const expandedDeptKeys = ref<string[]>([]);
const selectedDataScope = ref<string>('1');
const deptExpandAll = ref(false);
const deptCheckAll = ref(false);

const dataScopeOptions = [
  { label: '全部数据权限', value: '1' },
  { label: '自定数据权限', value: '2' },
  { label: '本部门数据权限', value: '3' },
  { label: '本部门及以下数据权限', value: '4' },
  { label: '仅本人数据权限', value: '5' },
];

async function loadDeptTree() {
  loadingDeptTree.value = true;
  try {
    const res = await getRoleDeptTree(props.roleId);
    deptTreeData.value = res.depts || [];
    checkedDeptKeys.value = (res.checkedKeys || []).map(String);
    expandedDeptKeys.value = getAllTreeKeys(deptTreeData.value);
  } finally {
    loadingDeptTree.value = false;
  }
}

async function handleConfirm() {
  if (!props.roleId) return;

  await allocateDataScope({
    roleId: props.roleId,
    dataScope: selectedDataScope.value,
    deptIds:
      selectedDataScope.value === '2' ? checkedDeptKeys.value.map(Number) : [],
  });

  emits('success');
  emits('update:open', false);
}

async function handleCancel() {
  emits('update:open', false);
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      selectedDataScope.value = props.dataScope || '1';
      if (props.roleId) {
        await loadDeptTree();
      }
    }
  },
);

watch(
  () => props.dataScope,
  (val) => {
    if (val) {
      selectedDataScope.value = val;
    }
  },
);

function onExpand(keys: any[]) {
  expandedDeptKeys.value = keys;
  deptExpandAll.value =
    deptTreeData.value.length > 0 &&
    keys.length === getAllTreeKeys(deptTreeData.value).length;
}

function onDeptExpandAll(e: any) {
  const checked = (e.target as HTMLInputElement).checked;
  deptExpandAll.value = checked;
  expandedDeptKeys.value = checked ? getAllTreeKeys(deptTreeData.value) : [];
}

function onDeptCheckAll(e: any) {
  const checked = (e.target as HTMLInputElement).checked;
  deptCheckAll.value = checked;
  checkedDeptKeys.value = checked ? getAllTreeKeys(deptTreeData.value) : [];
}

watch(checkedDeptKeys, (keys) => {
  const allKeys = getAllTreeKeys(deptTreeData.value);
  deptCheckAll.value = allKeys.length > 0 && keys.length === allKeys.length;
});
</script>

<template>
  <Modal
    :open="open"
    title="分配数据权限"
    width="500px"
    :mask-closable="false"
    @cancel="handleCancel"
    @ok="handleConfirm"
  >
    <div class="p-4">
      <div class="mb-4">
        <label class="block mb-2 font-medium">角色名称</label>
        <Input :value="roleName" disabled />
      </div>

      <div class="mb-4">
        <label class="block mb-2 font-medium">权限字符</label>
        <Input :value="roleKey" disabled />
      </div>

      <div class="mb-4">
        <label class="block mb-2 font-medium">数据范围</label>
        <Radio.Group
          v-model:value="selectedDataScope"
          :options="dataScopeOptions"
          button-style="solid"
        />
      </div>

      <div v-if="selectedDataScope === '2'" class="mt-4">
        <div class="flex items-center gap-4 mb-2">
          <Checkbox :checked="deptExpandAll" @change="onDeptExpandAll">
            展开/折叠
          </Checkbox>
          <Checkbox :checked="deptCheckAll" @change="onDeptCheckAll">
            全选/全不选
          </Checkbox>
        </div>
        <label class="block mb-2 font-medium">选择部门</label>
        <Spin :spinning="loadingDeptTree" wrapper-class-name="w-full">
          <div class="max-h-[300px] overflow-auto border rounded p-2">
            <Tree
              v-model:checked-keys="checkedDeptKeys"
              :tree-data="deptTreeData"
              checkable
              check-strictly
              :expanded-keys="expandedDeptKeys"
              :field-names="{ title: 'label', key: 'id', children: 'children' }"
              @expand="onExpand"
            />
          </div>
        </Spin>
      </div>

      <div class="mt-4 text-sm text-gray-500">
        <p>数据范围说明：</p>
        <ul class="list-disc ml-4 mt-1">
          <li>全部数据权限：可查看所有部门数据</li>
          <li>自定数据权限：可查看选择的部门数据</li>
          <li>本部门数据权限：仅查看本部门数据</li>
          <li>本部门及以下数据权限：查看本部门及下级部门数据</li>
          <li>仅本人数据权限：仅查看自己创建的数据</li>
        </ul>
      </div>
    </div>
  </Modal>
</template>

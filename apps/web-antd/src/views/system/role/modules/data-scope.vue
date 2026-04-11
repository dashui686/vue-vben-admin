<script lang="ts" setup>
import { ref, watch } from 'vue';

import { Modal, Radio, Spin, Tree } from 'ant-design-vue';

import { allocateDataScope, getRoleDeptTree } from '#/api';

const props = defineProps<{
  dataScope?: string;
  open?: boolean;
  roleId?: string;
}>();

const emits = defineEmits(['success', 'update:open']);

const loadingDeptTree = ref(false);
const deptTreeData = ref<any[]>([]);
const checkedDeptKeys = ref<string[]>([]);
const selectedDataScope = ref<string>('1');

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
    deptTreeData.value = res;
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

function onCheck(checkedKeys: string[]) {
  checkedDeptKeys.value = checkedKeys;
}
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
        <label class="block mb-2 font-medium">数据范围</label>
        <Radio.Group
          v-model:value="selectedDataScope"
          :options="dataScopeOptions"
          button-style="solid"
        />
      </div>

      <div v-if="selectedDataScope === '2'" class="mt-4">
        <label class="block mb-2 font-medium">选择部门</label>
        <Spin :spinning="loadingDeptTree" wrapper-class-name="w-full">
          <div class="max-h-[300px] overflow-auto border rounded p-2">
            <Tree
              :tree-data="deptTreeData"
              checkable
              :checked-keys="checkedDeptKeys"
              @check="onCheck"
              value-field="id"
              label-field="label"
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

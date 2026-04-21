<script setup lang="ts">
import type { PropType } from 'vue';

import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Empty, InputSearch, Skeleton, Tree } from 'ant-design-vue';

import { getUserDeptTree } from '#/api/system/user';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  api: getUserDeptTree,
});

const emit = defineEmits<{
  reload: [];
  select: [];
}>();

interface Props {
  api?: () => Promise<any[]>;
  showSearch?: boolean;
}

const selectDeptId = defineModel('selectDeptId', {
  required: true,
  type: Array as PropType<string[]>,
});

const searchValue = defineModel('searchValue', {
  type: String,
  default: '',
});

const deptTreeArray = ref<any[]>([]);
const showTreeSkeleton = ref(true);

async function loadTree() {
  showTreeSkeleton.value = true;
  searchValue.value = '';
  selectDeptId.value = [];

  const ret = await props.api();

  deptTreeArray.value = ret;
  showTreeSkeleton.value = false;
}

async function handleReload() {
  await loadTree();
  emit('reload');
}

onMounted(loadTree);
</script>

<template>
  <div :class="$attrs.class">
    <Skeleton
      :loading="showTreeSkeleton"
      :paragraph="{ rows: 8 }"
      active
      class="p-[8px]"
    >
      <div
        class="bg-background flex h-full flex-col overflow-y-auto rounded-lg"
      >
        <div
          v-if="showSearch"
          class="bg-background z-100 sticky left-0 top-0 p-[8px]"
        >
          <InputSearch
            v-model:value="searchValue"
            placeholder="搜索部门"
            size="small"
            allow-clear
          >
            <template #enterButton>
              <a-button @click="handleReload">
                <IconifyIcon icon="mdi:refresh" class="text-primary" />
              </a-button>
            </template>
          </InputSearch>
        </div>
        <div class="h-full overflow-x-hidden px-[8px]">
          <Tree
            v-bind="$attrs"
            v-if="deptTreeArray.length > 0"
            v-model:selected-keys="selectDeptId"
            :field-names="{ title: 'label', key: 'id' }"
            :show-line="{ showLeafIcon: false }"
            :tree-data="deptTreeArray"
            :virtual="false"
            default-expand-all
            @select="$emit('select')"
          >
            <template #title="{ label }">
              <span v-if="label.includes(searchValue)">
                {{ label.slice(0, label.indexOf(searchValue)) }}
                <span class="text-primary">{{ searchValue }}</span>
                {{
                  label.slice(label.indexOf(searchValue) + searchValue.length)
                }}
              </span>
              <span v-else>{{ label }}</span>
            </template>
          </Tree>
          <div v-else class="mt-5">
            <Empty
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="无部门数据"
            />
          </div>
        </div>
      </div>
    </Skeleton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep, getPopupContainer } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import {
  categoryAdd,
  categoryInfo,
  categoryList,
  categoryUpdate,
} from '#/api/workflow/category';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';
import { addFullName, listToTree } from '#/utils/tree';

import { modalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? '编辑' : '新增';
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    labelWidth: 80,
    componentProps: {
      class: 'w-full',
    },
  },
  schema: modalSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function setupCategorySelect() {
  const listData = await categoryList();
  const treeData = listToTree(listData, {
    id: 'categoryId',
    pid: 'parentId',
  });
  addFullName(treeData, 'categoryName', ' / ');
  formApi.updateSchema([
    {
      fieldName: 'parentId',
      componentProps: {
        treeData,
        treeLine: { showLeafIcon: false },
        fieldNames: { label: 'categoryName', value: 'categoryId' },
        treeDefaultExpandAll: true,
        treeNodeLabelProp: 'fullName',
        getPopupContainer,
      },
    },
  ]);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id, parentId } = modalApi.getData() as {
      id?: number | string;
      parentId?: number | string;
    };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await categoryInfo(id);
      await formApi.setValues(record);
    }
    if (parentId) {
      await formApi.setValues({ parentId });
    }
    await setupCategorySelect();
    await markInitialized();

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    await (isUpdate.value ? categoryUpdate(data) : categoryAdd(data));
    resetInitialized();
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}
</script>

<template>
  <BasicModal :title="title" class="min-h-[500px]">
    <BasicForm />
  </BasicModal>
</template>

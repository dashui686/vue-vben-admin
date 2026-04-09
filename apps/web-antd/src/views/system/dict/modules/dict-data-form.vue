<script lang="ts" setup>
import type { SystemDictDataApi } from '#/api/system/dict';

import { computed, ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { Button } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { createDictData, getDictData, updateDictData } from '#/api/system/dict';
import { $t } from '#/locales';
import { useDictDataFormSchema } from '../data';

const emit = defineEmits(['success']);
const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useDictDataFormSchema(),
  showDefaultActions: false,
});
const dictCode = ref<number | undefined>();
const getTitle = computed(() =>
  dictCode.value ? '编辑字典数据' : '新增字典数据',
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        if (dictCode.value) {
          data.dictCode = dictCode.value;
          await updateDictData(data);
        } else {
          await createDictData(data);
        }
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemDictDataApi.SystemDictData>();
      formApi.resetForm();
      if (data?.dictCode) {
        const detail = await getDictData(data.dictCode);
        dictCode.value = detail.dictCode;
        formApi.setValues({
          ...detail,
          dictType: data.dictType || detail.dictType,
        });
      } else {
        dictCode.value = undefined;
        formApi.setValues({ dictType: data?.dictType, ...data });
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="formApi.resetForm()">{{
          $t('common.reset')
        }}</Button>
      </div>
    </template>
  </Modal>
</template>

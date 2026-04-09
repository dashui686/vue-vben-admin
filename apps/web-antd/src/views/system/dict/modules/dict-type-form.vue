<script lang="ts" setup>
import type { SystemDictTypeApi } from '#/api/system/dict';

import { computed, ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { Button } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { createDictType, getDictType, updateDictType } from '#/api/system/dict';
import { $t } from '#/locales';
import { useDictTypeFormSchema } from '../data';

const emit = defineEmits(['success']);
const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useDictTypeFormSchema(),
  showDefaultActions: false,
});
const dictId = ref<number | undefined>();
const getTitle = computed(() =>
  dictId.value
    ? $t('ui.actionTitle.edit', [$t('system.dict.name')])
    : $t('ui.actionTitle.create', [$t('system.dict.name')]),
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        if (dictId.value) {
          data.dictId = dictId.value;
          await updateDictType(data);
        } else {
          await createDictType(data);
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
      const data = modalApi.getData<SystemDictTypeApi.SystemDictType>();
      formApi.resetForm();
      if (data?.dictId) {
        const detail = await getDictType(data.dictId);
        dictId.value = detail.dictId;
        formApi.setValues(detail);
      } else {
        dictId.value = undefined;
        formApi.setValues(data || {});
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

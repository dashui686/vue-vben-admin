<script lang="ts" setup>
import type { SystemConfigApi } from '#/api/system/config';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createConfig, getConfig, updateConfig } from '#/api/system/config';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});
const configId = ref<number | undefined>();
const getTitle = computed(() =>
  configId.value
    ? $t('ui.actionTitle.edit', [$t('system.config.name')])
    : $t('ui.actionTitle.create', [$t('system.config.name')]),
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        if (configId.value) {
          data.configId = configId.value;
          await updateConfig(data);
        } else {
          await createConfig(data);
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
      const data = modalApi.getData<SystemConfigApi.SystemConfig>();
      formApi.resetForm();
      if (data?.configId) {
        const detail = await getConfig(data.configId);
        configId.value = detail.configId;
        formApi.setValues(detail);
      } else {
        configId.value = undefined;
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
        <Button type="primary" danger @click="formApi.resetForm()">
{{
          $t('common.reset')
        }}
</Button>
      </div>
    </template>
  </Modal>
</template>

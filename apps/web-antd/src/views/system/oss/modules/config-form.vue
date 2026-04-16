<script lang="ts" setup>
import type { SystemOssApi } from '#/api/system/oss';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createOssConfig,
  getOssConfig,
  updateOssConfig,
} from '#/api/system/oss';
import { $t } from '#/locales';

import { useConfigFormSchema } from '../data';

const emit = defineEmits(['success']);
const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useConfigFormSchema(),
  showDefaultActions: false,
});
const ossConfigId = ref<number | undefined>();
const getTitle = computed(() =>
  ossConfigId.value
    ? $t('ui.actionTitle.edit', [$t('system.oss.configName')])
    : $t('ui.actionTitle.create', [$t('system.oss.configName')]),
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        if (ossConfigId.value) {
          data.ossConfigId = ossConfigId.value;
          await updateOssConfig(data);
        } else {
          await createOssConfig(data);
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
      const data = modalApi.getData<SystemOssApi.SystemOssConfig>();
      formApi.resetForm();
      if (data?.ossConfigId) {
        const detail = await getOssConfig(data.ossConfigId);
        ossConfigId.value = detail.ossConfigId;
        formApi.setValues(detail);
      } else {
        ossConfigId.value = undefined;
        formApi.setValues(data || {});
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-[600px]">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="formApi.resetForm()">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

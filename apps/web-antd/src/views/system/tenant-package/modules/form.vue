<script lang="ts" setup>
import type { SystemTenantPackageApi } from '#/api/system/tenantPackage';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createTenantPackage,
  getTenantPackage,
  updateTenantPackage,
} from '#/api/system/tenantPackage';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const packageId = ref<number | undefined>();

const getTitle = computed(() => {
  return packageId.value
    ? $t('ui.actionTitle.edit', [$t('system.tenantPackage.name')])
    : $t('ui.actionTitle.create', [$t('system.tenantPackage.name')]);
});

function resetForm() {
  formApi.resetForm();
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        if (packageId.value) {
          data.packageId = packageId.value;
          await updateTenantPackage(data);
        } else {
          await createTenantPackage(data);
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
      const data =
        modalApi.getData<SystemTenantPackageApi.SystemTenantPackage>();
      formApi.resetForm();

      if (data?.packageId) {
        const packageData = await getTenantPackage(data.packageId);
        packageId.value = packageData.packageId;
        formApi.setValues(packageData);
      } else {
        packageId.value = undefined;
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
        <Button type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

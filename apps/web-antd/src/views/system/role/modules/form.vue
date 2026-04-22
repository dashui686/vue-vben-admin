<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemRoleApi } from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Checkbox, Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createRole, getMenuTreeselect, getRole, updateRole } from '#/api';
import { handleFormOpenChange } from '#/composables/useFormModal';
import { getAllTreeKeys } from '#/composables/useGridHelper';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.SystemRole>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<any[]>([]);
const defaultCheckedKeys = ref<string[]>([]);
const loadingPermissions = ref(false);
const menuExpandAll = ref(false);
const menuCheckAll = ref(false);

const roleId = ref();

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    // 使用 defaultCheckedKeys 获取选中的菜单 ID
    const menuIds = defaultCheckedKeys.value;

    const values = await formApi.getValues();
    values.menuIds = menuIds;

    drawerApi.lock();

    try {
      await (roleId.value
        ? updateRole(roleId.value, values)
        : createRole(values));
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      await handleFormOpenChange(formApi, drawerApi, data, {
        getDetailApi: getRole,
        idField: 'roleId',
      });
      if (data?.roleId) {
        formData.value = await getRole(data.roleId);
        roleId.value = data.roleId;
      } else {
        roleId.value = undefined;
      }
      await loadPermissions();
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data && data.menuIds && data.menuIds.length > 0) {
        defaultCheckedKeys.value = data.menuIds.map(String);
      }
    }
  },
});

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = await getMenuTreeselect();
    permissions.value = res;
  } finally {
    loadingPermissions.value = false;
  }
}

const getDrawerTitle = computed(() => {
  return formData.value?.roleId
    ? $t('common.edit', $t('system.role.name'))
    : $t('common.create', $t('system.role.name'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}

function onMenuExpandAll(e: any) {
  menuExpandAll.value = (e.target as HTMLInputElement).checked;
}

function onMenuCheckAll(e: any) {
  menuCheckAll.value = (e.target as HTMLInputElement).checked;
  defaultCheckedKeys.value = menuCheckAll.value
    ? getAllTreeKeys(permissions.value)
    : [];
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #menuIds="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <div class="flex items-center gap-4 mb-2">
            <Checkbox :checked="menuExpandAll" @change="onMenuExpandAll">
              展开/折叠
            </Checkbox>
            <Checkbox :checked="menuCheckAll" @change="onMenuCheckAll">
              全选/全不选
            </Checkbox>
          </div>
          <Tree
            :tree-data="permissions"
            checkable
            multiple
            :default-expanded-level="0"
            :get-node-class="getNodeClass"
            value-field="id"
            label-field="label"
            icon-field="icon"
            v-bind="slotProps"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.icon" :icon="value.icon" />
              {{ $t(value.label) }}
            </template>
          </Tree>
        </Spin>
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    @apply ml-5 hidden;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    @apply ml-5 flex flex-auto justify-end;
  }
}
</style>

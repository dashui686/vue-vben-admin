import type { VxeGridListeners } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

/**
 * Recursively collect all node keys from a tree structure.
 * Default key field is 'id', child field is 'children'.
 */
export function getAllTreeKeys(
  nodes: any[],
  keyField = 'id',
  childrenField = 'children',
): string[] {
  const keys: string[] = [];
  for (const node of nodes) {
    keys.push(String(node[keyField]));
    if (node[childrenField]?.length) {
      keys.push(
        ...getAllTreeKeys(node[childrenField], keyField, childrenField),
      );
    }
  }
  return keys;
}

/**
 * Grid checkbox selection state management.
 * Returns reactive refs for toolbar button disabled states and a gridEvents object.
 */
export function useGridSelection<T = any>(getGridApi: () => any) {
  const selectedCount = ref(0);
  const editDisabled = computed(() => selectedCount.value !== 1);
  const deleteDisabled = computed(() => selectedCount.value === 0);

  function onSelectionChange() {
    selectedCount.value = getGridApi().grid.getCheckboxRecords().length;
  }

  function onToolbarEdit(editFn: (row: T) => void) {
    const records = getGridApi().grid.getCheckboxRecords();
    if (records.length !== 1) {
      message.warning('请选择一条数据');
      return;
    }
    editFn(records[0] as T);
  }

  const gridEvents: VxeGridListeners<T> = {
    checkboxChange: onSelectionChange,
    checkboxAll: onSelectionChange,
  };

  return {
    deleteDisabled,
    editDisabled,
    gridEvents,
    onToolbarEdit,
    selectedCount,
  };
}

/**
 * Batch delete with confirm dialog.
 * Collects checked record IDs, joins them, and calls the delete API.
 */
export function useBatchDelete(
  getGridApi: () => any,
  deleteFn: (ids: string) => Promise<any>,
  idField: string,
) {
  async function onBatchDelete() {
    const records = getGridApi().grid.getCheckboxRecords();
    if (records.length === 0) {
      message.warning('请至少选择一条记录');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确认要删除选中的${records.length}条记录吗？`,
      onOk: async () => {
        const ids = records.map((r: any) => r[idField]).join(',');
        await deleteFn(ids);
        message.success('删除成功');
        getGridApi().query();
      },
    });
  }

  return { onBatchDelete };
}

/**
 * Status toggle with confirm dialog for CellSwitch beforeChange.
 * Wraps the actual API call with a confirm prompt.
 */
export function useStatusConfirm<T = any>(
  statusFn: (data: { id: any; status: string }) => Promise<any>,
  options?: {
    idField?: string;
    nameField?: string;
  },
) {
  const idField = options?.idField ?? 'id';
  const nameField = options?.nameField ?? 'name';

  function onStatusChange(
    newStatus: string,
    row: T,
  ): Promise<boolean | undefined> {
    const statusText = newStatus === '0' ? '启用' : '停用';
    const rowAny = row as any;
    return new Promise((resolve) => {
      Modal.confirm({
        title: '确认操作',
        content: `确认要${statusText}"${rowAny[nameField]}"吗？`,
        onOk: async () => {
          await statusFn({ id: rowAny[idField], status: newStatus });
          message.success(`${statusText}成功`);
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  }

  return { onStatusChange };
}

import type { VbenFormSchema } from '#/adapter/form';

import { message, Modal } from 'ant-design-vue';

import { $t } from '#/locales';

/**
 * Common status select options for search forms.
 * Returns enabled/disabled options with i18n labels.
 */
export function getStatusSelectOptions() {
  return [
    { label: $t('common.enabled'), value: '0' },
    { label: $t('common.disabled'), value: '1' },
  ];
}

/**
 * Status Select field for search forms.
 * Reusable across all CRUD modules with status filtering.
 */
export function statusSelectField(label: string): VbenFormSchema {
  return {
    component: 'Select',
    fieldName: 'status',
    label,
    componentProps: {
      allowClear: true,
      placeholder: '请选择状态',
      options: getStatusSelectOptions(),
    },
  };
}

/**
 * Status RadioGroup field for edit forms.
 * Default value is '0' (enabled) unless overridden.
 */
export function statusRadioField(
  label: string,
  defaultValue: string = '0',
): VbenFormSchema {
  return {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getStatusSelectOptions(),
      optionType: 'button',
    },
    defaultValue,
    fieldName: 'status',
    label,
  };
}

/**
 * Remark Textarea field for edit forms.
 */
export function remarkField(label: string): VbenFormSchema {
  return {
    component: 'Textarea',
    fieldName: 'remark',
    label,
    componentProps: {
      placeholder: '请输入备注',
      rows: 3,
    },
  };
}

/**
 * Status column for table with CellSwitch/CellTag conditional rendering.
 */
export function statusColumn(
  title: string,
  onStatusChange?: (
    newStatus: any,
    row: any,
  ) => PromiseLike<boolean | undefined>,
  auth?: string,
) {
  return {
    cellRender: {
      attrs: { auth, beforeChange: onStatusChange },
      name: onStatusChange ? 'CellSwitch' : 'CellTag',
    },
    field: 'status',
    title,
    width: 100,
  };
}

/**
 * Operation column with CellOperation renderer.
 */
export function operationColumn(
  title: string,
  onActionClick: any,
  options: Array<{ code: string; text: string }>,
  nameField: string,
  nameTitle: string,
  extra: Record<string, any> = {},
) {
  const {
    maxInline,
    nameField: _nf,
    nameTitle: _nt,
    onClick: _oc,
    ...columnProps
  } = extra;
  const attrs: Record<string, any> = {
    nameField,
    nameTitle,
    onClick: onActionClick,
  };
  if (maxInline !== null && maxInline !== undefined) {
    attrs.maxInline = maxInline;
  }
  return {
    align: 'center' as const,
    cellRender: {
      name: 'CellOperation' as const,
      attrs,
      options,
    },
    field: 'operation',
    fixed: 'right' as const,
    headerAlign: 'center' as const,
    showOverflow: false,
    title,
    ...columnProps,
  };
}

/**
 * 统一的状态切换确认函数
 * @param newStatus - 新状态值 '0' 或 '1'
 * @param row - 当前行数据
 * @param nameField - 名称字段
 * @param nameValue - 名称值
 * @param updateApi - 更新状态的 API 函数
 * @param successMsg - 成功提示消息
 */
export async function confirmStatusChange(
  newStatus: string,
  row: any,
  nameField: string,
  nameValue: string,
  updateApi: (id: number | string, data: any) => Promise<any>,
  idField: string = 'id',
): Promise<boolean> {
  const statusText = newStatus === '0' ? '启用' : '停用';
  const displayName = row[nameField] || nameValue || '该项';

  return new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认要${statusText}"${displayName}"吗？`,
      onOk: async () => {
        try {
          await updateApi(row[idField], { ...row, status: newStatus });
          message.success(`${statusText}成功`);
          resolve(true);
        } catch (error) {
          console.error('状态更新失败:', error);
          resolve(false);
        }
      },
      onCancel: () => {
        resolve(false);
      },
    });
  });
}

/**
 * 通用的 API Select 字段配置（单选）
 */
export function apiSelectField(
  fieldName: string,
  label: string,
  api: () => Promise<any[]>,
  config: {
    labelField?: string;
    multiple?: boolean;
    placeholder?: string;
    required?: boolean;
    valueField?: string;
  } = {},
): VbenFormSchema {
  const {
    labelField = 'name',
    valueField = 'id',
    placeholder = `请选择${label}`,
    required = false,
    multiple = false,
  } = config;

  return {
    component: 'ApiSelect',
    fieldName,
    label,
    componentProps: {
      api,
      labelField,
      valueField,
      mode: multiple ? 'multiple' : undefined,
      placeholder,
      allowClear: true,
    },
    rules: required ? 'required' : undefined,
  };
}

/**
 * 通用的 API TreeSelect 字段配置
 */
export function apiTreeSelectField(
  fieldName: string,
  label: string,
  api: () => Promise<any[]>,
  config: {
    childrenField?: string;
    labelField?: string;
    placeholder?: string;
    required?: boolean;
    treeDefaultExpandAll?: boolean;
    valueField?: string;
  } = {},
): VbenFormSchema {
  const {
    labelField = 'name',
    valueField = 'id',
    childrenField = 'children',
    placeholder = `请选择${label}`,
    required = false,
    treeDefaultExpandAll = true,
  } = config;

  return {
    component: 'ApiTreeSelect',
    fieldName,
    label,
    componentProps: {
      api,
      labelField,
      valueField,
      childrenField,
      placeholder,
      allowClear: true,
      treeDefaultExpandAll,
      class: 'w-full',
    },
    rules: required ? 'required' : undefined,
  };
}

import type { VbenFormSchema } from '#/adapter/form';

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
) {
  return {
    cellRender: {
      attrs: { beforeChange: onStatusChange },
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

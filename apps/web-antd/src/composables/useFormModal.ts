import { ref } from 'vue';

import { z } from '#/adapter/form';

interface UseFormModalOptions<T> {
  /** 获取详情的 API 函数 */
  getDetailApi?: (id: number | string) => Promise<T>;
  /** ID 字段名 */
  idField?: string;
  /** 额外的值处理函数 */
  onValuesReady?: (values: T) => T;
  /** 重置表单前的回调 */
  beforeReset?: () => Promise<void> | void;
}

/**
 * 通用的表单 Modal/Drawer 数据加载逻辑
 * 统一处理 resetForm + setValues 模式
 *
 * @example
 * ```ts
 * const [FormModal, modalApi] = useVbenModal({
 *   async onConfirm() {
 *     const { valid } = await formApi.validate();
 *     if (!valid) return;
 *     const data = await formApi.getValues();
 *     await (formData.value?.id ? update(data) : create(data));
 *   },
 *   async onOpenChange(isOpen) {
 *     if (isOpen) {
 *       const data = modalApi.getData();
 *       await handleFormOpenChange(formApi, modalApi, data, {
 *         getDetailApi: getDetail,
 *         idField: 'id',
 *       });
 *     }
 *   },
 * });
 * ```
 */
export async function handleFormOpenChange<T extends Record<string, any>>(
  formApi: {
    resetForm: () => void;
    setValues: (values: T) => void;
  },
  modalApi: {
    getData: () => T | undefined;
  },
  data: T | undefined,
  options: UseFormModalOptions<T> = {},
) {
  const { getDetailApi, idField = 'id', onValuesReady, beforeReset } = options;

  if (beforeReset) {
    await beforeReset();
  }

  formApi.resetForm();

  if (data?.[idField]) {
    // 编辑模式：获取详情
    if (getDetailApi) {
      const detail = await getDetailApi(data[idField]);
      const values = onValuesReady ? onValuesReady(detail) : detail;
      formApi.setValues(values as T);
    } else {
      formApi.setValues(data);
    }
  } else {
    // 新增模式
    formApi.setValues(data || ({} as T));
  }
}

/**
 * 创建通用的 ID Ref
 */
export function useFormId(initialValue?: number | string) {
  const idRef = ref<number | string | undefined>(initialValue);
  return idRef;
}

/**
 * 通用的验证密码规则
 */
export function createPasswordRules(config?: {
  max?: number;
  message?: string;
  min?: number;
}) {
  const { min = 5, max = 20, message } = config || {};
  return z
    .string()
    .min(min, message || `密码长度不能少于${min}个字符`)
    .max(max, message || `密码长度不能超过${max}个字符`)
    .regex(/^[^<>"'|\\]+$/, String.raw`不能包含非法字符：< > " ' \ |`);
}

/**
 * 通用的手机号验证规则
 */
export function createPhoneRules() {
  return z
    .string()
    .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
    .optional()
    .or(z.literal(''));
}

/**
 * 通用的邮箱验证规则
 */
export function createEmailRules() {
  return z.string().email('请输入有效的邮箱地址').optional().or(z.literal(''));
}

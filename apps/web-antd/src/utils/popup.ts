import type { ExtendedFormApi } from '@vben/common-ui';
import type { MaybePromise } from '@vben/types';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Modal } from 'ant-design-vue';
import { isFunction } from 'lodash-es';

interface BeforeCloseDiffProps {
  /**
   * How to get the initialized value
   * @returns Promise<string>
   */
  initializedGetter: () => MaybePromise<string>;
  /**
   * How to get the current value
   * @returns Promise<string>
   */
  currentGetter: () => MaybePromise<string>;
  /**
   * Custom compare function
   * @param init initial value
   * @param current current value
   * @returns boolean
   */
  compare?: (init: string, current: string) => boolean;
}

/**
 * Used for Drawer/Modal to determine whether the form has changed and whether to show a confirmation dialog
 * @param props props
 * @returns hook
 */
export function useBeforeCloseDiff(props: BeforeCloseDiffProps) {
  const { initializedGetter, currentGetter, compare } = props;
  /**
   * Record initial value json
   */
  const initialized = ref<string>('');
  /**
   * Whether initialization is complete. If false, close directly without showing dialog
   */
  const isInitialized = ref(false);

  /**
   * Mark as initialized, subsequent comparisons will be needed
   * @param data custom initialization data, optional
   */
  async function markInitialized(data?: string) {
    initialized.value = data || (await initializedGetter());
    isInitialized.value = true;
  }

  /**
   * Reset initialization state, should be called before closed or when opening window
   */
  function resetInitialized() {
    initialized.value = '';
    isInitialized.value = false;
  }

  /**
   * For useVbenForm/useVbenDrawer usage
   * @returns whether to allow closing
   */
  async function onBeforeClose(): Promise<boolean> {
    if (!isInitialized.value) {
      return true;
    }

    try {
      const current = await currentGetter();
      if (isFunction(compare) && compare(initialized.value, current)) {
        return true;
      } else {
        if (current === initialized.value) {
          return true;
        }
      }

      return new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: $t('pages.common.tip'),
          content: $t('pages.common.beforeCloseTip'),
          centered: true,
          okButtonProps: { danger: true },
          cancelText: $t('common.cancel'),
          okText: $t('common.confirm'),
          onOk: () => {
            resolve(true);
            isInitialized.value = false;
          },
          onCancel: () => resolve(false),
        });
      });
    } catch (error) {
      console.error('Failed to compare data:', error);
      return true;
    }
  }

  return {
    onBeforeClose,
    markInitialized,
    resetInitialized,
  };
}

/**
 * Wrapper function for useVbenForm
 * @param formApi form instance
 * @returns getter
 */
export function defaultFormValueGetter(formApi: ExtendedFormApi) {
  return async () => {
    const v = await formApi.getValues();
    return JSON.stringify(v);
  };
}

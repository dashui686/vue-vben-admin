import type { VxeUI } from 'vxe-table';

import type { Recordable } from '@vben/types';

import { h } from 'vue';

import { useAccess } from '@vben/access';
import { IconifyIcon } from '@vben/icons';
import { $t, $te } from '@vben/locales';
import { get, isFunction, isString } from '@vben/utils';

import { objectOmit } from '@vueuse/core';
import {
  Button,
  Dropdown,
  Image,
  Input,
  InputNumber,
  Menu,
  MenuItem,
  Popconfirm,
  Switch,
  Tag,
} from 'ant-design-vue';

/**
 * 注册所有单元格渲染器
 */
export function registerCellRenderers(vxeUI: VxeUI) {
  // 单元格渲染：图片
  vxeUI.renderer.add('CellImage', {
    renderTableDefault(renderOpts, params) {
      const { props } = renderOpts;
      const { column, row } = params;
      return h(Image, { src: row[column.field], ...props });
    },
  });

  // 单元格渲染：链接按钮
  vxeUI.renderer.add('CellLink', {
    renderTableDefault(renderOpts) {
      const { props } = renderOpts;
      return h(
        Button,
        { size: 'small', type: 'link' },
        { default: () => props?.text },
      );
    },
  });

  // 单元格渲染：标签
  vxeUI.renderer.add('CellTag', {
    renderTableDefault({ options, props }, { column, row }) {
      const value = get(row, column.field);
      const tagOptions = options ?? [
        { color: 'success', label: $t('common.enabled'), value: '0' },
        { color: 'error', label: $t('common.disabled'), value: '1' },
      ];
      const tagItem = tagOptions.find((item) => item.value === value);
      return h(
        Tag,
        {
          ...props,
          ...objectOmit(tagItem ?? {}, ['label']),
        },
        { default: () => tagItem?.label ?? value },
      );
    },
  });

  // 单元格渲染：开关
  vxeUI.renderer.add('CellSwitch', {
    renderTableDefault({ attrs, props }, { column, row }) {
      const loadingKey = `__loading_${column.field}`;
      const statusMap: Record<string, string> = {
        '0': $t('common.enabled'),
        '1': $t('common.disabled'),
      };

      async function onChange(newVal: any) {
        row[loadingKey] = true;
        try {
          const result = await attrs?.beforeChange?.(newVal, row);
          if (result !== false) {
            row[column.field] = newVal;
          }
        } finally {
          row[loadingKey] = false;
        }
      }

      if (attrs?.auth) {
        const { hasAccessByCodes } = useAccess();
        if (!hasAccessByCodes([attrs.auth])) {
          return h('span', null, statusMap[row[column.field]] ?? row[column.field]);
        }
      }

      const finallyProps = {
        checkedChildren: $t('common.enabled'),
        checkedValue: '0',
        unCheckedChildren: $t('common.disabled'),
        unCheckedValue: '1',
        ...props,
        checked: row[column.field],
        loading: row[loadingKey] ?? false,
        'onUpdate:checked': onChange,
      };
      return h(Switch, finallyProps);
    },
  });

  // 单元格渲染：可编辑输入框
  vxeUI.renderer.add('CellInput', {
    renderTableDefault(renderOpts, { column, row }) {
      const { attrs, props } = renderOpts;
      const value = row[column.field];
      const align = attrs?.align || 'left';
      const alignClass = `cell-input-align-${align}`;

      return h(
        'div',
        { class: ['w-full', alignClass] },
        h(Input, {
          allowClear: true,
          bordered: false,
          class: 'w-full',
          placeholder: $t('common.inputPlaceholder'),
          value,
          ...props,
          size: props?.size || 'small',
          'onUpdate:value': (val: string) => {
            row[column.field] = val;
            attrs?.onChange?.(val, row);
          },
          onBlur: () => {
            attrs?.onBlur?.(row[column.field], row);
          },
        }),
      );
    },
  });

  // 单元格渲染：可编辑数字输入框
  vxeUI.renderer.add('CellInputNumber', {
    renderTableDefault(renderOpts, { column, row }) {
      const { attrs, props } = renderOpts;
      const value = row[column.field];
      const align = attrs?.align || 'left';
      const alignClass = `cell-input-align-${align}`;

      return h(
        'div',
        { class: ['w-full', alignClass] },
        h(InputNumber, {
          allowClear: true,
          bordered: false,
          class: 'w-full',
          controls: false,
          min: 0,
          placeholder: $t('common.inputPlaceholder'),
          precision: 0,
          value,
          ...props,
          size: props?.size || 'small',
          'onUpdate:value': (val: null | number) => {
            row[column.field] = val;
            attrs?.onChange?.(val, row);
          },
          onBlur: () => {
            attrs?.onBlur?.(row[column.field], row);
          },
        }),
      );
    },
  });

  // 单元格渲染：操作按钮
  vxeUI.renderer.add('CellOperation', {
    renderTableDefault({ attrs, options, props }, { column, row }) {
      const defaultProps = { size: 'small', type: 'link', ...props };
      let align: string;
      switch (column.align) {
        case 'center': {
          align = 'center';
          break;
        }
        case 'left': {
          align = 'start';
          break;
        }
        default: {
          align = 'end';
          break;
        }
      }
      const presets: Recordable<Recordable<any>> = {
        delete: {
          danger: true,
          text: $t('common.delete'),
        },
        edit: {
          text: $t('common.edit'),
        },
      };

      // 处理操作选项
      const allOperations: Array<Recordable<any>> = (
        options || ['edit', 'delete']
      )
        .map((opt) => {
          if (isString(opt)) {
            return presets[opt]
              ? { code: opt, ...presets[opt], ...defaultProps }
              : {
                  code: opt,
                  text: $te(`common.${opt}`) ? $t(`common.${opt}`) : opt,
                  ...defaultProps,
                };
          } else {
            return { ...defaultProps, ...presets[opt.code], ...opt };
          }
        })
        .map((opt) => {
          const optBtn: Recordable<any> = {};
          Object.keys(opt).forEach((key) => {
            optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
          });
          return optBtn;
        })
        .filter((opt) => opt.show !== false)
        .filter((opt) => {
          if (!opt.auth) return true;
          const { hasAccessByCodes } = useAccess();
          return hasAccessByCodes([opt.auth]);
        });

      const maxInline = attrs?.maxInline ?? Infinity;
      const inlineOperations = allOperations.slice(0, maxInline);
      const moreOperations = allOperations.slice(maxInline);

      function renderBtn(opt: Recordable<any>, listen = true) {
        return h(
          Button,
          {
            ...props,
            ...opt,
            icon: undefined,
            onClick: listen
              ? () =>
                  attrs?.onClick?.({
                    code: opt.code,
                    row,
                  })
              : undefined,
          },
          {
            default: () => {
              const content = [];
              if (opt.icon) {
                content.push(
                  h(IconifyIcon, { class: 'size-5', icon: opt.icon }),
                );
              }
              content.push(opt.text);
              return content;
            },
          },
        );
      }

      function renderConfirm(opt: Recordable<any>) {
        let viewportWrapper: HTMLElement | null = null;
        return h(
          Popconfirm,
          {
            getPopupContainer(el) {
              viewportWrapper = el.closest('.vxe-table--viewport-wrapper');
              return document.body;
            },
            placement: 'topLeft',
            title: $t('ui.actionTitle.delete', [attrs?.nameTitle || '']),
            ...props,
            ...opt,
            icon: undefined,
            onOpenChange: (open: boolean) => {
              if (open) {
                viewportWrapper?.style.setProperty('pointer-events', 'none');
              } else {
                viewportWrapper?.style.removeProperty('pointer-events');
              }
            },
            onConfirm: () => {
              attrs?.onClick?.({
                code: opt.code,
                row,
              });
            },
          },
          {
            default: () => renderBtn({ ...opt }, false),
            description: () =>
              h(
                'div',
                { class: 'truncate' },
                $t('ui.actionMessage.deleteConfirm', [
                  row[attrs?.nameField || 'name'],
                ]),
              ),
          },
        );
      }

      const inlineBtns = inlineOperations.map((opt) =>
        opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
      );

      function renderMoreDropdown() {
        if (moreOperations.length === 0) return null;

        const menuItems = moreOperations.map((opt) => {
          if (opt.code === 'delete') {
            return h(
              MenuItem,
              {
                key: opt.code,
                class: opt.danger ? 'text-red' : '',
              },
              {
                default: () =>
                  h(
                    Popconfirm,
                    {
                      placement: 'left',
                      title: $t('ui.actionTitle.delete', [
                        attrs?.nameTitle || '',
                      ]),
                      onConfirm: () => {
                        attrs?.onClick?.({ code: opt.code, row });
                      },
                    },
                    {
                      default: () => opt.text,
                      description: () =>
                        $t('ui.actionMessage.deleteConfirm', [
                          row[attrs?.nameField || 'name'],
                        ]),
                    },
                  ),
              },
            );
          }

          return h(
            MenuItem,
            {
              key: opt.code,
              class: opt.danger ? 'text-red' : '',
              onClick: () => {
                attrs?.onClick?.({ code: opt.code, row });
              },
            },
            {
              default: () =>
                h('span', { class: 'flex items-center' }, [
                  opt.icon &&
                    h(IconifyIcon, { class: 'mr-1 size-4', icon: opt.icon }),
                  opt.text,
                ]),
            },
          );
        });

        const menu = h(
          Menu,
          { class: 'min-w-24' },
          { default: () => menuItems },
        );

        const moreBtn = h(
          Button,
          {
            size: 'small',
            type: 'link',
          },
          { default: () => $t('common.more') },
        );

        return h(
          Dropdown,
          {
            placement: 'bottomRight',
            trigger: ['click'],
          },
          {
            default: () => moreBtn,
            overlay: () => menu,
          },
        );
      }

      const moreDropdown = renderMoreDropdown();
      const allBtns = moreDropdown ? [...inlineBtns, moreDropdown] : inlineBtns;

      return h(
        'div',
        {
          class: 'flex table-operations',
          style: { justifyContent: align },
        },
        allBtns,
      );
    },
  });
}

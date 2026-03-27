import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { useVbenForm } from '../form';
import { registerCellRenderers } from './renderers';

import './style.css';

export * from './types';

export type * from '@vben/plugins/vxe-table';

export { useVbenVxeGrid };

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    // 全局配置
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          enabled: false,
          submitOnEnter: true,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'rows',
            total: 'total',
            list: 'rows',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    // 注册单元格渲染器
    registerCellRenderers(vxeUI);

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add
  },
  useVbenForm,
});

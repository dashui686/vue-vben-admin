import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteMeta,
  RouteRecordStringComponent,
} from '@vben/types';

import type { Menu } from '#/api';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { message } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

import { localMenuList } from './routes/local';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');
const NotFoundComponent = () => import('#/views/_core/fallback/not-found.vue');

const routeMetaMapping: Record<string, Omit<RouteMeta, 'title'>> = {
  '/system/role-auth/user/:roleId': {
    activePath: '/system/role',
    requireHomeRedirect: true,
  },
  '/system/dict-data/index/:dictId': {
    activePath: '/system/dict',
    requireHomeRedirect: true,
  },
  '/system/oss-config/index': {
    activePath: '/system/oss',
    requireHomeRedirect: true,
  },
  '/tool/gen-edit/index/:tableId': {
    activePath: '/tool/gen',
    requireHomeRedirect: true,
  },
};

function backMenuToVbenMenu(
  menuList: Menu[],
  parentPath = '',
): RouteRecordStringComponent[] {
  const resultList: RouteRecordStringComponent[] = [];
  menuList.forEach((menu) => {
    // RootMenu: path='/' with exactly 1 child
    if (menu.path === '/' && menu.children && menu.children.length === 1) {
      if (!menu.children || !menu.children[0]) {
        return;
      }

      // Handle inner link at root level
      if (/^https?:\/\//.test(menu.children[0].path)) {
        menu.children[0].component = 'InnerLink';
        menu.children[0].path = menu.children[0].path
          .replaceAll(/^https?:\/\//g, '')
          .replaceAll('/#/', '')
          .replaceAll('#', '')
          .replaceAll(/[?&]/g, '');
      }

      const path = menu.children[0].path;
      menu.meta = menu.children[0].meta;
      menu.path = `/${path}`;
      menu.component = 'RootMenu';
      menu.children[0].path = '';
    }

    // External link: http(s):// + Layout/ParentView
    if (
      /^https?:\/\//.test(menu.path) &&
      (menu.component === 'Layout' || menu.component === 'ParentView')
    ) {
      menu.component = 'Link';
    }

    // Inner iframe with InnerLink component
    if (menu.meta?.link && menu.component === 'InnerLink') {
      menu.component = 'IFrameView';
    }

    // Concat path
    if (parentPath && menu.path) {
      menu.path = `${parentPath}/${menu.path}`;
    }

    const vbenRoute: RouteRecordStringComponent = {
      component: menu.component,
      meta: {
        hideInMenu: menu.hidden || menu.meta?.hideInMenu,
        icon: menu.meta?.icon,
        keepAlive: !menu.meta?.noCache,
        title: menu.meta?.title,
        activeIcon: menu.meta?.activeIcon,
        activePath: menu.meta?.activePath,
        affixTab: menu.meta?.affixTab,
        affixTabOrder: menu.meta?.affixTabOrder,
        badge: menu.meta?.badge,
        badgeType: menu.meta?.badgeType,
        badgeVariants: menu.meta?.badgeVariants,
        hideChildrenInMenu: menu.meta?.hideChildrenInMenu,
        hideInBreadcrumb: menu.meta?.hideInBreadcrumb,
        hideInTab: menu.meta?.hideInTab,
        maxNumOfOpenTab: menu.meta?.maxNumOfOpenTab,
        iframeSrc: menu.meta?.iframeSrc,
        link: menu.meta?.link,
        order: menu.meta?.order,
      },
      name: menu.name,
      path: menu.path,
    };

    // Apply routeMetaMapping
    if (Object.keys(routeMetaMapping).includes(vbenRoute.path)) {
      const routeMeta = routeMetaMapping[vbenRoute.path];
      if (routeMeta) {
        vbenRoute.meta = {
          ...vbenRoute.meta,
          ...(routeMeta as RouteMeta),
        };
      }
    }

    // Parse query params
    if (menu.query) {
      try {
        const query = JSON.parse(menu.query);
        if (vbenRoute.meta) {
          vbenRoute.meta.query = query;
        }
      } catch {
        console.error('Invalid route query param, expected JSON format');
      }
    }

    // Component mapping
    switch (menu.component) {
      case 'IFrameView': {
        vbenRoute.component = 'IFrameView';
        if (vbenRoute.meta) {
          vbenRoute.meta.iframeSrc = menu.meta.link;
        }
        vbenRoute.path = vbenRoute.path
          .replaceAll(/^https?:\/\//g, '')
          .replaceAll('/#/', '')
          .replaceAll('#', '')
          .replaceAll(/[?&]/g, '');
        break;
      }
      case 'Layout': {
        vbenRoute.component = 'BasicLayout';
        break;
      }
      case 'Link': {
        if (vbenRoute.meta) {
          vbenRoute.meta.link = menu.meta.link;
        }
        vbenRoute.component = 'BasicLayout';
        break;
      }
      case 'ParentView': {
        vbenRoute.component = '';
        break;
      }
      case 'RootMenu': {
        if (vbenRoute.meta) {
          vbenRoute.meta.hideChildrenInMenu = true;
        }
        vbenRoute.component = 'BasicLayout';
        break;
      }
      default: {
        vbenRoute.component = `/${menu.component}`;
        break;
      }
    }

    if (menu.children && menu.children.length > 0) {
      vbenRoute.children = backMenuToVbenMenu(menu.children, menu.path);
    }

    resultList.push(vbenRoute);
  });
  return resultList;
}

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
    NotFoundComponent,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.destroy();
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1,
      });
      const backMenuList = await getAllMenusApi();
      const vbenMenuList = backMenuToVbenMenu(backMenuList);
      return [...cloneDeep(localMenuList), ...vbenMenuList];
    },
    forbiddenComponent,
    layoutMap,
    pageMap,
  });
}

export { generateAccess };

import type { Recordable } from '@vben/types';

import type { BackendMenu, FrontendMenu } from '#/views/system/menu/types';

import { requestClient } from '#/api/request';
import {
  toBackendMenu,
  toFrontendMenu,
  toFrontendMenuList,
} from '#/views/system/menu/transform';

export namespace SystemMenuApi {
  export const BadgeVariants = [
    'default',
    'destructive',
    'primary',
    'success',
    'warning',
  ] as const;

  export const BadgeTypes = ['dot', 'normal'] as const;

  export const MenuTypes = [
    'catalog',
    'menu',
    'embedded',
    'link',
    'button',
  ] as const;

  export interface SystemMenu {
    [key: string]: any;
    id?: string;
    pid?: string;
    name?: string;
    path?: string;
    component?: string;
    redirect?: string;
    type?: (typeof MenuTypes)[number];
    authCode?: string;
    children?: SystemMenu[];
    meta?: {
      activeIcon?: string;
      activePath?: string;
      affixTab?: boolean;
      affixTabOrder?: number;
      badge?: string;
      badgeType?: (typeof BadgeTypes)[number];
      badgeVariants?: (typeof BadgeVariants)[number];
      hideChildrenInMenu?: boolean;
      hideInBreadcrumb?: boolean;
      hideInMenu?: boolean;
      hideInTab?: boolean;
      icon?: string;
      iframeSrc?: string;
      keepAlive?: boolean;
      link?: string;
      maxNumOfOpenTab?: number;
      order?: number;
      query?: Recordable<any>;
      title?: string;
    };
    menuId?: string;
    parentId?: string;
    menuName?: string;
    orderNum?: number;
    queryParam?: string;
    isFrame?: string;
    isCache?: string;
    menuType?: string;
    visible?: string;
    status?: string;
    perms?: string;
    title?: string;
    activeIcon?: string;
    activePath?: string;
    affixTab?: number;
    affixTabOrder?: number;
    badge?: string;
    badgeType?: 'dot' | 'normal';
    badgeVariants?: string;
    hideChildren?: number;
    hideBreadcrumb?: number;
    hideTab?: number;
    linkSrc?: string;
    maxOpenTab?: number;
  }

  export interface SystemMenuPageQuery extends Recordable<any> {
    menuName?: string;
    status?: string;
    menuType?: string;
  }

  export interface MenuTreeSelect {
    id: number;
    label: string;
    value: number;
    children?: MenuTreeSelect[];
  }

  export interface RoleMenuTreeSelect {
    checkedKeys: number[];
    menus: SystemMenu[];
  }
}

export async function getMenuList(params?: SystemMenuApi.SystemMenuPageQuery) {
  const data = await requestClient.get<Array<BackendMenu>>(
    '/system/menu/list',
    { params },
  );
  return toFrontendMenuList(data);
}

export async function getMenuTreeselect(
  params?: SystemMenuApi.SystemMenuPageQuery,
) {
  return requestClient.get<Array<SystemMenuApi.MenuTreeSelect>>(
    '/system/menu/treeselect',
    { params },
  );
}

export async function getRoleMenuTreeselect(roleId: string) {
  return requestClient.get<SystemMenuApi.RoleMenuTreeSelect>(
    `/system/menu/roleMenuTreeselect/${roleId}`,
  );
}

export async function getRouters() {
  return requestClient.get<Array<SystemMenuApi.SystemMenu>>(
    '/system/menu/getRouters',
  );
}

export async function getMenu(menuId: string) {
  const data = await requestClient.get<BackendMenu>(`/system/menu/${menuId}`);
  return toFrontendMenu(data);
}

export async function createMenu(data: FrontendMenu) {
  return requestClient.postWithMsg('/system/menu', toBackendMenu(data));
}

export async function updateMenu(data: FrontendMenu) {
  return requestClient.putWithMsg('/system/menu', toBackendMenu(data));
}

export async function deleteMenu(id: string) {
  return requestClient.delete(`/system/menu/${id}`);
}

export async function cascadeDeleteMenu(menuIds: string) {
  return requestClient.deleteWithMsg(`/system/menu/cascade/${menuIds}`);
}

import type { Recordable } from '@vben/types';

import type { BackendMenu, FrontendMenu } from '#/views/system/menu/types';

import { requestClient } from '#/api/request';
import {
  toBackendMenu,
  toFrontendMenu,
  toFrontendMenuList,
} from '#/views/system/menu/transform';

export namespace SystemMenuApi {
  /** 徽标颜色集合 */
  export const BadgeVariants = [
    'default',
    'destructive',
    'primary',
    'success',
    'warning',
  ] as const;
  /** 徽标类型集合 */
  export const BadgeTypes = ['dot', 'normal'] as const;
  /** 菜单类型集合 */
  export const MenuTypes = [
    'catalog',
    'menu',
    'embedded',
    'link',
    'button',
  ] as const;
  /** 菜单类型（M目录 C菜单 F按钮） */
  export const BackendMenuTypes = ['M', 'C', 'F'] as const;
  /** 显示状态（0显示 1隐藏） */
  export const VisibleTypes = ['0', '1'] as const;
  /** 菜单状态（0正常 1停用） */
  export const StatusTypes = ['0', '1'] as const;
  /** 是否为外链（0是 1否） */
  export const FrameTypes = ['0', '1'] as const;
  /** 是否缓存（0缓存 1不缓存） */
  export const CacheTypes = ['0', '1'] as const;

  /**
   * 系统菜单（兼容前端和后端格式）
   * 用于菜单编辑表单
   */
  export interface SystemMenu {
    [key: string]: any;

    // ========== 前端格式字段 ==========
    /** 菜单ID */
    id?: string;
    /** 父级ID */
    pid?: string;
    /** 路由名称 */
    name?: string;
    /** 路由路径 */
    path?: string;
    /** 组件路径 */
    component?: string;
    /** 重定向地址 */
    redirect?: string;
    /** 菜单类型 */
    type?: (typeof MenuTypes)[number];
    /** 权限标识 */
    authCode?: string;
    /** 子级 */
    children?: SystemMenu[];
    /** 菜单元数据 */
    meta?: {
      /** 激活时显示的图标 */
      activeIcon?: string;
      /** 作为路由时，需要激活的菜单的Path */
      activePath?: string;
      /** 固定在标签栏 */
      affixTab?: boolean;
      /** 在标签栏固定的顺序 */
      affixTabOrder?: number;
      /** 徽标内容 */
      badge?: string;
      /** 徽标类型 */
      badgeType?: (typeof BadgeTypes)[number];
      /** 徽标颜色 */
      badgeVariants?: (typeof BadgeVariants)[number];
      /** 在菜单中隐藏下级 */
      hideChildrenInMenu?: boolean;
      /** 在面包屑中隐藏 */
      hideInBreadcrumb?: boolean;
      /** 在菜单中隐藏 */
      hideInMenu?: boolean;
      /** 在标签栏中隐藏 */
      hideInTab?: boolean;
      /** 菜单图标 */
      icon?: string;
      /** 内嵌Iframe的URL */
      iframeSrc?: string;
      /** 是否缓存页面 */
      keepAlive?: boolean;
      /** 外链页面的URL */
      link?: string;
      /** 同一个路由最大打开的标签数 */
      maxNumOfOpenTab?: number;
      /** 菜单排序 */
      order?: number;
      /** 额外的路由参数 */
      query?: Recordable<any>;
      /** 菜单标题 */
      title?: string;
    };

    // ========== 后端API字段 ==========
    /** 菜单ID(后端) */
    menuId?: number;
    /** 父菜单ID(后端) */
    parentId?: number;
    /** 菜单名称(后端) */
    menuName?: string;
    /** 显示顺序(后端) */
    orderNum?: number;
    /** 路由参数(后端) */
    queryParam?: string;
    /** 是否为外链（0是 1否）(后端) */
    isFrame?: string;
    /** 是否缓存（0缓存 1不缓存）(后端) */
    isCache?: string;
    /** 菜单类型（M目录 C菜单 F按钮）(后端) */
    menuType?: string;
    /** 显示状态（0显示 1隐藏）(后端) */
    visible?: string;
    /** 菜单状态（0正常 1停用）(后端) */
    status?: string;
    /** 权限标识(后端) */
    perms?: string;
    /** 菜单图标(后端) */
    icon?: string;

    // ========== 后端扩展字段 ==========
    /** 菜单标题(多语言key) */
    title?: string;
    /** 激活图标 */
    activeIcon?: string;
    /** 激活路径 */
    activePath?: string;
    /** 是否固定标签页（0否 1是） */
    affixTab?: number;
    /** 固定标签页顺序 */
    affixTabOrder?: number;
    /** 徽标内容 */
    badge?: string;
    /** 徽标类型 */
    badgeType?: 'dot' | 'normal';
    /** 徽标颜色 */
    badgeVariants?: string;
    /** 是否隐藏子菜单（0否 1是） */
    hideChildren?: number;
    /** 是否在面包屑中隐藏（0否 1是） */
    hideBreadcrumb?: number;
    /** 是否在标签栏中隐藏（0否 1是） */
    hideTab?: number;
    /** 外链/内嵌地址 */
    linkSrc?: string;
    /** 最大打开标签数 */
    maxOpenTab?: number;
  }

  /** 菜单查询参数 */
  export interface SystemMenuPageQuery extends Recordable<any> {
    /** 菜单名称 */
    menuName?: string;
    /** 菜单状态 */
    status?: string;
    /** 菜单类型 */
    menuType?: string;
  }

  /** 菜单树选择项 */
  export interface MenuTreeSelect {
    id: number;
    label: string;
    value: number;
    children?: MenuTreeSelect[];
  }

  /** 角色菜单树选择项 */
  export interface RoleMenuTreeSelect {
    checkedKeys: number[];
    menus: SystemMenu[];
  }
}

/**
 * 获取菜单数据列表
 */
async function getMenuList(params?: SystemMenuApi.SystemMenuPageQuery) {
  const data = await requestClient.get<Array<BackendMenu>>(
    '/system/menu/list',
    { params },
  );
  return toFrontendMenuList(data);
}

/**
 * 获取菜单下拉树列表
 */
async function getMenuTreeselect(params?: SystemMenuApi.SystemMenuPageQuery) {
  return requestClient.get<Array<SystemMenuApi.MenuTreeSelect>>(
    '/system/menu/treeselect',
    { params },
  );
}

/**
 * 加载对应角色菜单列表树
 * @param roleId 角色ID
 */
async function getRoleMenuTreeselect(roleId: number) {
  return requestClient.get<SystemMenuApi.RoleMenuTreeSelect>(
    `/system/menu/roleMenuTreeselect/${roleId}`,
  );
}

/**
 * 获取路由信息(用户登录后获取的路由)
 */
async function getRouters() {
  return requestClient.get<Array<SystemMenuApi.SystemMenu>>(
    '/system/menu/getRouters',
  );
}

/**
 * 根据菜单编号获取详细信息
 * @param menuId 菜单ID
 */
async function getMenu(menuId: number) {
  const data = await requestClient.get<BackendMenu>(`/system/menu/${menuId}`);
  return toFrontendMenu(data);
}

/**
 * 创建菜单
 * @param data 菜单数据
 */
async function createMenu(data: FrontendMenu) {
  const backendData = toBackendMenu(data);
  return requestClient.post('/system/menu', backendData);
}

/**
 * 更新菜单
 * @param data 菜单数据
 */
async function updateMenu(data: FrontendMenu) {
  const backendData = toBackendMenu(data);
  return requestClient.put('/system/menu', backendData);
}

/**
 * 删除菜单
 * @param id 菜单 ID
 */
async function deleteMenu(id: string) {
  return requestClient.delete(`/system/menu/${id}`);
}

export {
  createMenu,
  deleteMenu,
  getMenu,
  getMenuList,
  getMenuTreeselect,
  getRoleMenuTreeselect,
  getRouters,
  updateMenu,
};

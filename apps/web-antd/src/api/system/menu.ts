import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

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

  /** 系统菜单 */
  export interface SystemMenu {
    [key: string]: any;
    /** 后端权限标识 */
    authCode: string;
    /** 子级 */
    children?: SystemMenu[];
    /** 组件 */
    component?: string;
    /** 菜单ID */
    id: string;
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
      /** 徽标内容(当徽标类型为normal时有效) */
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
      /** 无需基础布局 */
      noBasicLayout?: boolean;
      /** 是否在新窗口打开 */
      openInNewWindow?: boolean;
      /** 菜单排序 */
      order?: number;
      /** 额外的路由参数 */
      query?: Recordable<any>;
      /** 菜单标题 */
      title?: string;
    };
    /** 菜单名称 */
    name: string;
    /** 路由路径 */
    path: string;
    /** 父级ID */
    pid: string;
    /** 重定向 */
    redirect?: string;
    /** 菜单类型 */
    type: (typeof MenuTypes)[number];

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
  return requestClient.get<Array<SystemMenuApi.SystemMenu>>(
    '/system/menu/list',
    { params },
  );
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
  return requestClient.get<SystemMenuApi.SystemMenu>(`/system/menu/${menuId}`);
}

async function isMenuNameExists(
  name: string,
  id?: string,
) {
  return requestClient.get<boolean>('/system/menu/name-exists', {
    params: { id, name },
  });
}

async function isMenuPathExists(
  path: string,
  id?: string,
) {
  return requestClient.get<boolean>('/system/menu/path-exists', {
    params: { id, path },
  });
}

/**
 * 创建菜单
 * @param data 菜单数据
 */
async function createMenu(
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return requestClient.post('/system/menu', data);
}

/**
 * 更新菜单
 *
 * @param id 菜单 ID
 * @param data 菜单数据
 */
async function updateMenu(
  id: string,
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return requestClient.put(`/system/menu/${id}`, data);
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
  getRouters,
  getRoleMenuTreeselect,
  isMenuNameExists,
  isMenuPathExists,
  updateMenu,
};

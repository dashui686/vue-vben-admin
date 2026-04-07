/**
 * 菜单数据转换工具
 * 处理后端格式和前端格式之间的双向转换
 *
 * 转换规则：
 * 1. 布尔值转换：前端 true/false <-> 后端 0/1 或 '0'/'1'
 * 2. 菜单类型：M<->catalog, C<->menu, F<->button (另 embedded->C, link->M)
 * 3. 相反值：visible(0显示) <-> hideInMenu(true隐藏)
 * 4. 字段名映射：orderNum<->order, keepAlive<->isCache(值相反)
 */

import type {
  BackendMenu,
  BackendMenuType,
  BackendStatus,
  FrontendMenu,
  FrontendMenuMeta,
  FrontendMenuType,
} from './types';

/**
 * 菜单类型映射：后端 -> 前端
 */
const MENU_TYPE_TO_FRONTEND: Record<string, FrontendMenuType> = {
  M: 'catalog',
  C: 'menu',
  F: 'button',
};

/**
 * 菜单类型映射：前端 -> 后端
 */
const MENU_TYPE_TO_BACKEND: Record<FrontendMenuType, BackendMenuType> = {
  catalog: 'M',
  menu: 'C',
  button: 'F',
  embedded: 'C',
  link: 'M',
};

/**
 * 数值转布尔值（后端 0/1 -> 前端 true/false）
 * 后端：0=否，1=是
 */
function numberToBoolean(value: number | undefined): boolean {
  return value === 1;
}

/**
 * 布尔值转数值（前端 true/false -> 后端 0/1）
 */
function booleanToNumber(value: boolean | undefined): number {
  return value ? 1 : 0;
}

/**
 * 字符串状态转布尔值（后端 '0'/'1' -> 前端 true/false）
 * 后端：'0'=是/正常，'1'=否/停用
 * @param invert 是否反转结果
 */
function statusToBoolean(value: string | undefined, invert = false): boolean {
  const result = value === '0';
  return invert ? !result : result;
}

/**
 * 后端菜单转换为前端菜单
 */
export function toFrontendMenu(backend: BackendMenu): FrontendMenu {
  // 确定菜单类型
  let finalType: FrontendMenuType = MENU_TYPE_TO_FRONTEND[backend.menuType] || 'menu';
  let link: string | undefined;
  let iframeSrc: string | undefined;

  // 外链：isFrame='0' 且 path 是 http 开头
  if (backend.isFrame === '0' && backend.path?.startsWith('http')) {
    finalType = 'link';
    link = backend.path;
  }
  // 内嵌：component 是 Iframe 或有 linkSrc
  else if (backend.component === 'Iframe' || backend.linkSrc) {
    finalType = 'embedded';
    iframeSrc = backend.linkSrc || backend.path;
  }

  const meta: FrontendMenuMeta = {
    // 基础信息
    title: backend.title || backend.menuName,
    icon: backend.icon,
    activeIcon: backend.activeIcon,
    order: backend.orderNum,
    // 缓存（后端：0缓存 1不缓存）
    keepAlive: statusToBoolean(backend.isCache),
    // 菜单显隐（后端：0显示 1隐藏，前端：hideInMenu=true隐藏）
    hideInMenu: statusToBoolean(backend.visible, true),
    // 扩展功能
    hideInTab: numberToBoolean(backend.hideTab),
    hideInBreadcrumb: numberToBoolean(backend.hideBreadcrumb),
    hideChildrenInMenu: numberToBoolean(backend.hideChildren),
    affixTab: numberToBoolean(backend.affixTab),
    affixTabOrder: backend.affixTabOrder,
    // 徽标
    badge: backend.badge,
    badgeType: backend.badgeType as 'dot' | 'normal',
    badgeVariants: backend.badgeVariants,
    // 路由
    activePath: backend.activePath,
    link,
    iframeSrc,
    maxNumOfOpenTab: backend.maxOpenTab,
    query: backend.queryParam ? JSON.parse(backend.queryParam) : undefined,
  };

  return {
    id: String(backend.menuId),
    pid: String(backend.parentId || 0),
    name: backend.menuName,
    path: backend.path || '',
    component: backend.component,
    redirect: backend.redirect,
    type: finalType,
    authCode: backend.perms,
    meta,
    status: backend.status as BackendStatus,
    children: backend.children?.map((element) => toFrontendMenu(element)),
  };
}

/**
 * 前端菜单转换为后端菜单
 */
export function toBackendMenu(frontend: FrontendMenu): BackendMenu {
  const menuType = MENU_TYPE_TO_BACKEND[frontend.type] || 'C';
  const meta = frontend.meta;

  // 判断是否为外链
  let isFrame: BackendStatus = '1';
  let path = frontend.path;

  if (frontend.type === 'link' && meta.link) {
    isFrame = '0';
    path = meta.link;
  }

  return {
    // 基础字段
    menuId: frontend.id ? Number(frontend.id) : undefined,
    parentId: Number(frontend.pid) || 0,
    menuName: frontend.name,
    orderNum: meta.order ?? 0,
    path,
    component: frontend.component,
    queryParam: meta.query ? JSON.stringify(meta.query) : undefined,
    isFrame,
    // 缓存（前端：keepAlive=true缓存 -> 后端：'0'缓存）
    isCache: meta.keepAlive ? '0' : '1',
    menuType,
    // 显隐（前端：hideInMenu=true隐藏 -> 后端：'1'隐藏）
    visible: meta.hideInMenu ? '1' : '0',
    status: frontend.status || '0',
    perms: frontend.authCode,
    icon: meta.icon,
    // 扩展字段
    title: meta.title,
    activeIcon: meta.activeIcon,
    activePath: meta.activePath,
    affixTab: booleanToNumber(meta.affixTab),
    affixTabOrder: meta.affixTabOrder,
    badge: meta.badge,
    badgeType: meta.badgeType,
    badgeVariants: meta.badgeVariants,
    hideChildren: booleanToNumber(meta.hideChildrenInMenu),
    hideBreadcrumb: booleanToNumber(meta.hideInBreadcrumb),
    hideTab: booleanToNumber(meta.hideInTab),
    // 外链/内嵌地址
    linkSrc: frontend.type === 'embedded' ? meta.iframeSrc : meta.link,
    maxOpenTab: meta.maxNumOfOpenTab,
    redirect: frontend.redirect,
  };
}

/**
 * 批量转换：后端 -> 前端
 */
export function toFrontendMenuList(list: BackendMenu[]): FrontendMenu[] {
  return list.map((element) => toFrontendMenu(element));
}

/**
 * 批量转换：前端 -> 后端
 */
export function toBackendMenuList(list: FrontendMenu[]): BackendMenu[] {
  return list.map((element) => toBackendMenu(element));
}

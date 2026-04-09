import type {
  BackendMenu,
  BackendMenuType,
  BackendStatus,
  FrontendMenu,
  FrontendMenuMeta,
  FrontendMenuType,
} from './types';

const MENU_TYPE_TO_FRONTEND: Record<string, FrontendMenuType> = {
  M: 'catalog',
  C: 'menu',
  F: 'button',
};

const MENU_TYPE_TO_BACKEND: Record<FrontendMenuType, BackendMenuType> = {
  catalog: 'M',
  menu: 'C',
  button: 'F',
  embedded: 'C',
  link: 'M',
};

function toBool(
  value: number | string | undefined,
  zeroMeansTrue = true,
): boolean {
  return zeroMeansTrue
    ? value === '0' || value === 0
    : value === '1' || value === 1;
}

function fromBool(value: boolean | undefined): number {
  return value ? 1 : 0;
}

function fromBoolStr(value: boolean | undefined): BackendStatus {
  return value ? '0' : '1';
}

export function toFrontendMenu(backend: BackendMenu): FrontendMenu {
  let finalType: FrontendMenuType =
    MENU_TYPE_TO_FRONTEND[backend.menuType] || 'menu';
  let link: string | undefined;
  let iframeSrc: string | undefined;

  if (backend.isFrame === '0' && backend.path?.startsWith('http')) {
    finalType = 'link';
    link = backend.path;
  } else if (backend.component === 'Iframe' || backend.linkSrc) {
    finalType = 'embedded';
    iframeSrc = backend.linkSrc || backend.path;
  }

  const meta: FrontendMenuMeta = {
    title: backend.title || backend.menuName,
    icon: backend.icon,
    activeIcon: backend.activeIcon,
    order: backend.orderNum,
    keepAlive: toBool(backend.isCache),
    hideInMenu: !toBool(backend.visible),
    hideInTab: toBool(backend.hideTab, false),
    hideInBreadcrumb: toBool(backend.hideBreadcrumb, false),
    hideChildrenInMenu: toBool(backend.hideChildren, false),
    affixTab: toBool(backend.affixTab, false),
    affixTabOrder: backend.affixTabOrder,
    badge: backend.badge,
    badgeType: backend.badgeType as 'dot' | 'normal',
    badgeVariants: backend.badgeVariants,
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
    children: backend.children?.map((e) => toFrontendMenu(e)),
  };
}

export function toBackendMenu(frontend: FrontendMenu): BackendMenu {
  const menuType = MENU_TYPE_TO_BACKEND[frontend.type] || 'C';
  const meta = frontend.meta;

  let isFrame: BackendStatus = '1';
  let path = frontend.path;

  if (frontend.type === 'link' && meta.link) {
    isFrame = '0';
    path = meta.link;
  }

  return {
    menuId: frontend.id ? Number(frontend.id) : undefined,
    parentId: Number(frontend.pid) || 0,
    menuName: frontend.name,
    orderNum: meta.order ?? 0,
    path,
    component: frontend.component,
    queryParam: meta.query ? JSON.stringify(meta.query) : undefined,
    isFrame,
    isCache: fromBoolStr(meta.keepAlive),
    menuType,
    visible: fromBoolStr(!meta.hideInMenu),
    status: frontend.status || '0',
    perms: frontend.authCode,
    icon: meta.icon,
    title: meta.title,
    activeIcon: meta.activeIcon,
    activePath: meta.activePath,
    affixTab: fromBool(meta.affixTab),
    affixTabOrder: meta.affixTabOrder,
    badge: meta.badge,
    badgeType: meta.badgeType,
    badgeVariants: meta.badgeVariants,
    hideChildren: fromBool(meta.hideChildrenInMenu),
    hideBreadcrumb: fromBool(meta.hideInBreadcrumb),
    hideTab: fromBool(meta.hideInTab),
    linkSrc: frontend.type === 'embedded' ? meta.iframeSrc : meta.link,
    maxOpenTab: meta.maxNumOfOpenTab,
    redirect: frontend.redirect,
  };
}

export function toFrontendMenuList(list: BackendMenu[]): FrontendMenu[] {
  return list.map((item) => toFrontendMenu(item));
}

export function toBackendMenuList(list: FrontendMenu[]): BackendMenu[] {
  return list.map((item) => toBackendMenu(item));
}

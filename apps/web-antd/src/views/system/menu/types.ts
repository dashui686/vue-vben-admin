import type { Recordable } from '@vben/types';

export type BackendMenuType = 'C' | 'F' | 'M';
export type BackendStatus = '0' | '1';

export interface BackendMenu {
  menuId?: string;
  parentId: string;
  menuName: string;
  orderNum: number;
  path: string;
  component?: string;
  queryParam?: string;
  isFrame?: BackendStatus;
  isCache?: BackendStatus;
  menuType: BackendMenuType;
  visible?: BackendStatus;
  status?: BackendStatus;
  perms?: string;
  icon?: string;
  createTime?: string;
  remark?: string;
  // 扩展字段
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
  redirect?: string;
  hideInMenu?: number;
  children?: BackendMenu[];
}

export type FrontendMenuType =
  | 'button'
  | 'catalog'
  | 'embedded'
  | 'link'
  | 'menu';

export interface FrontendMenuMeta {
  title: string;
  icon?: string;
  activeIcon?: string;
  order?: number;
  keepAlive?: boolean;
  hideInMenu?: boolean;
  hideInTab?: boolean;
  hideInBreadcrumb?: boolean;
  hideChildrenInMenu?: boolean;
  affixTab?: boolean;
  affixTabOrder?: number;
  badge?: string;
  badgeType?: 'dot' | 'normal';
  badgeVariants?: string;
  activePath?: string;
  link?: string;
  iframeSrc?: string;
  maxNumOfOpenTab?: number;
  query?: Recordable<any>;
}

export interface FrontendMenu {
  id: string;
  pid: string;
  name: string;
  path: string;
  component?: string;
  redirect?: string;
  type: FrontendMenuType;
  authCode?: string;
  meta: FrontendMenuMeta;
  status?: BackendStatus;
  children?: FrontendMenu[];
  linkSrc?: string;
}

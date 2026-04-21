import { requestClient } from '#/api/request';

export interface MenuMeta {
  icon: string;
  link?: string;
  noCache?: boolean;
  title: string;
  activeIcon?: string;
  activePath?: string;
  affixTab?: boolean;
  affixTabOrder?: number;
  badge?: string;
  badgeType?: string;
  badgeVariants?: string;
  hideChildrenInMenu?: boolean;
  hideInBreadcrumb?: boolean;
  hideInTab?: boolean;
  iframeSrc?: string;
  maxNumOfOpenTab?: number;
  hideInMenu?: boolean;
  order?: number;
}

export interface Menu {
  alwaysShow?: boolean;
  children: Menu[];
  component: string;
  hidden: boolean;
  meta: MenuMeta;
  name: string;
  path: string;
  query?: string;
  redirect?: string;
}

export async function getAllMenusApi() {
  return requestClient.get<Menu[]>('/system/menu/getRouters');
}

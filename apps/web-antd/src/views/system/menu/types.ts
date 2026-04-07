/**
 * 菜单数据类型定义
 * 区分后端格式和前端格式
 */

import type { Recordable } from '@vben/types';

// ========== 后端菜单格式 ==========

/** 后端菜单类型 */
export type BackendMenuType = 'C' | 'F' | 'M';

/** 后端状态类型（0/1字符串） */
export type BackendStatus = '0' | '1';

/**
 * 后端菜单格式（对应 sys_menu 表）
 *
 * 字段说明：
 * - 基础字段：RuoYi原有字段
 * - 扩展字段：Vben Admin前端扩展字段
 */
export interface BackendMenu {
  // ========== 基础字段 ==========
  /** 菜单ID */
  menuId?: number;
  /** 父菜单ID */
  parentId: number;
  /** 菜单名称（路由name） */
  menuName: string;
  /** 显示顺序 */
  orderNum: number;
  /** 路由地址 */
  path: string;
  /** 组件路径 */
  component?: string;
  /** 路由参数（JSON字符串） */
  queryParam?: string;
  /** 是否为外链（0是 1否） */
  isFrame?: BackendStatus;
  /** 是否缓存（0缓存 1不缓存） */
  isCache?: BackendStatus;
  /** 菜单类型（M目录 C菜单 F按钮） */
  menuType: BackendMenuType;
  /** 显示状态（0显示 1隐藏） */
  visible?: BackendStatus;
  /** 菜单状态（0正常 1停用） */
  status?: BackendStatus;
  /** 权限标识 */
  perms?: string;
  /** 菜单图标 */
  icon?: string;
  /** 创建时间 */
  createTime?: string;
  /** 备注 */
  remark?: string;

  // ========== 前端扩展字段 ==========
  /** 菜单标题（多语言key或直接文本，用于显示，与menuName区分） */
  title?: string;
  /** 激活图标 */
  activeIcon?: string;
  /** 激活路径（作为路由时需要激活的菜单路径） */
  activePath?: string;
  /** 是否固定标签页（0否 1是） */
  affixTab?: number;
  /** 固定标签页顺序 */
  affixTabOrder?: number;
  /** 徽标内容 */
  badge?: string;
  /** 徽标类型（dot点 normal普通） */
  badgeType?: 'dot' | 'normal';
  /** 徽标颜色（default/primary/success/warning/destructive） */
  badgeVariants?: string;
  /** 是否隐藏子菜单（0否 1是） */
  hideChildren?: number;
  /** 是否在面包屑中隐藏（0否 1是） */
  hideBreadcrumb?: number;
  /** 是否在标签栏中隐藏（0否 1是，与visible区分） */
  hideTab?: number;
  /** 外链/内嵌地址 */
  linkSrc?: string;
  /** 最大打开标签数 */
  maxOpenTab?: number;
  /** 重定向地址 */
  redirect?: string;

  // ========== 非数据库字段 ==========
  /** 子菜单 */
  children?: BackendMenu[];
}

// ========== 前端菜单格式 ==========

/** 前端菜单类型 */
export type FrontendMenuType =
  | 'button'
  | 'catalog'
  | 'embedded'
  | 'link'
  | 'menu';

/**
 * 前端菜单元数据
 * 对应 Vben Admin 的 RouteMeta 定义
 */
export interface FrontendMenuMeta {
  /** 菜单标题 */
  title?: string;
  /** 菜单图标 */
  icon?: string;
  /** 激活图标 */
  activeIcon?: string;
  /** 菜单排序 */
  order?: number;
  /** 是否缓存页面 */
  keepAlive?: boolean;
  /** 是否在菜单中隐藏 */
  hideInMenu?: boolean;
  /** 是否在标签栏中隐藏 */
  hideInTab?: boolean;
  /** 是否在面包屑中隐藏 */
  hideInBreadcrumb?: boolean;
  /** 是否隐藏子菜单 */
  hideChildrenInMenu?: boolean;
  /** 是否固定标签页 */
  affixTab?: boolean;
  /** 固定标签页顺序 */
  affixTabOrder?: number;
  /** 徽标内容 */
  badge?: string;
  /** 徽标类型 */
  badgeType?: 'dot' | 'normal';
  /** 徽标颜色 */
  badgeVariants?: 'default' | 'destructive' | 'primary' | 'success' | 'warning' | string;
  /** 激活路径 */
  activePath?: string;
  /** 外链地址 */
  link?: string;
  /** 内嵌地址 */
  iframeSrc?: string;
  /** 最大打开标签数 */
  maxNumOfOpenTab?: number;
  /** 路由参数 */
  query?: Recordable<any>;
}

/**
 * 前端菜单格式
 * 对应前端路由配置
 */
export interface FrontendMenu {
  /** 菜单ID */
  id?: string;
  /** 父菜单ID */
  pid?: string;
  /** 路由名称 */
  name?: string;
  /** 路由路径 */
  path?: string;
  /** 组件路径 */
  component?: string;
  /** 重定向 */
  redirect?: string;
  /** 菜单类型 */
  type?: FrontendMenuType;
  /** 权限标识 */
  authCode?: string;
  /** 菜单元数据 */
  meta?: FrontendMenuMeta;
  /** 状态 */
  status?: BackendStatus;
  /** 子菜单 */
  children?: FrontendMenu[];
  /** 外链/内嵌地址（临时字段，用于表单编辑） */
  linkSrc?: string;
}

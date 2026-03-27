import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    /** 角色ID */
    roleId: string;
    /** 角色名称 */
    roleName: string;
    /** 角色权限字符串 */
    roleKey: string;
    /** 显示顺序 */
    roleSort: number;
    /** 数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限 5：仅本人数据权限 6：部门及以下或本人数据权限） */
    dataScope?: string;
    /** 菜单树选择项是否关联显示 */
    menuCheckStrictly?: boolean;
    /** 部门树选择项是否关联显示 */
    deptCheckStrictly?: boolean;
    /** 角色状态（0正常 1停用） */
    status: string;
    /** 菜单ID列表 */
    menuIds: string[];
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
  }

  export interface SystemRolePageQuery extends Recordable<any> {
    /** 角色ID */
    roleId: string;
    /** 角色名称 */
    roleName?: string;
    /** 角色权限字符串 */
    roleKey?: string;
    /** 角色状态 */
    status?: string;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
  }
}

/**
 * 获取角色列表数据
 */
export const getRoleList = async function (
  params: SystemRoleApi.SystemRolePageQuery,
) {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>(
    '/system/role/list',
    { params },
  );
};

/**
 * 获取角色详情
 * @param id 角色 ID
 */
export const getRole = async function (id: number | string) {
  return requestClient.get<SystemRoleApi.SystemRole>(`/system/role/${id}`);
};

/**
 * 获取角色选择框列表
 */
export const getRoleOptionselect = async function (params?: {
  roleIds?: number[];
}) {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>(
    '/system/role/optionselect',
    { params },
  );
};

/**
 * 获取角色选择框列表
 */
export const getRoleDeptTree = async function (roleId?: any) {
  return requestClient.get(`/system/role/deptTree/${roleId || 1}`);
};

/**
 * 创建角色
 * @param data 角色数据
 */
export const createRole = async function (
  data: Omit<SystemRoleApi.SystemRole, 'roleId'>,
) {
  return requestClient.postWithMsg('/system/role', data);
};

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
export const updateRole = async function (
  roleId: string,
  data: Omit<SystemRoleApi.SystemRole, 'roleId'>,
) {
  data.roleId = roleId;
  return requestClient.putWithMsg(`/system/role`, data);
};

/**
 * 更新角色状态
 *
 * @param data 角色数据(包含status)
 */
export const changeRoleStatus = async function (data: {
  roleId: string;
  status: string;
}) {
  return requestClient.putWithMsg('/system/role/changeStatus', data);
};

/**
 * 删除角色
 * @param ids 角色 ID 数组
 */
export const deleteRole = async function (roleIds: string | string[]) {
  return requestClient.deleteWithMsg(
    `/system/role/${Array.isArray(roleIds) ? roleIds.join(',') : roleIds}`,
  );
};

/**
 * 分配数据权限
 * @param roleId 角色 ID
 * @param dataScope 数据范围
 * @param deptIds 部门 ID 列表
 */
export const allocateDataScope = async function (data: {
  dataScope: string;
  deptIds?: number[];
  roleId: string;
}) {
  return requestClient.putWithMsg('/system/role/dataScope', data);
};

/**
 * 批量选择用户授权
 * @param roleId 角色 ID
 * @param userIds 用户 ID 列表
 */
export const allocateRoleUsers = async function (data: {
  roleId: string;
  userIds: number[];
}) {
  return requestClient.putWithMsg('/system/role/authUser/selectAll', data, {
    params: {
      roleId: data.roleId,
      userIds: data.userIds.join(','),
    },
  });
};

/**
 * 取消授权用户
 * @param data 包含 roleId 和 userId
 */
export const cancelAuthUser = async function (data: {
  roleId: string;
  userId: string;
}) {
  return requestClient.putWithMsg('/system/role/authUser/cancel', data);
};

/**
 * 批量取消授权用户
 * @param roleId 角色 ID
 * @param userIds 用户 ID 列表
 */
export const cancelAuthUserAll = async function (data: {
  roleId: string;
  userIds: number[];
}) {
  return requestClient.putWithMsg('/system/role/authUser/cancelAll', data, {
    params: {
      roleId: data.roleId,
      userIds: data.userIds.join(','),
    },
  });
};

/**
 * 导出角色信息列表
 */
export const exportRole = async function (
  data?: SystemRoleApi.SystemRolePageQuery,
) {
  return requestClient.download('/system/role/export', {
    data,
    method: 'POST',
  });
};

/**
 * 获取已分配的用户列表
 * @param roleId 角色 ID
 */
export const getAllocatedUserList = async function (params: {
  pageNum?: number;
  pageSize?: number;
  phonenumber?: string;
  roleId: string;
  userName?: string;
}) {
  return requestClient.get(`/system/role/authUser/allocatedList`, { params });
};

/**
 * 获取未分配的用户列表
 * @param roleId 角色 ID
 */
export const getUnallocatedUserList = async function (params: {
  pageNum?: number;
  pageSize?: number;
  phonenumber?: string;
  roleId: string;
  userName?: string;
}) {
  return requestClient.get(`/system/role/authUser/unallocatedList`, { params });
};

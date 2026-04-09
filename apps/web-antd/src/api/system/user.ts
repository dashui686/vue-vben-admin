import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    /** 用户ID */
    userId: number;
    /** 部门ID */
    deptId?: number;
    /** 用户账号 */
    userName: string;
    /** 用户昵称 */
    nickName: string;
    /** 用户类型 */
    userType?: string;
    /** 用户邮箱 */
    email?: string;
    /** 手机号码 */
    phonenumber?: string;
    /** 用户性别（0男 1女 2未知） */
    sex?: string;
    /** 密码 */
    password?: string;
    /** 账号状态（0正常 1停用） */
    status: string;
    /** 备注 */
    remark?: string;
    /** 角色组 */
    roleIds?: number[];
    /** 岗位组 */
    postIds?: number[];
    /** 头像地址 */
    avatar?: number;
    /** 最后登录IP */
    loginIp?: string;
    /** 最后登录时间 */
    loginDate?: string;
    /** 创建时间 */
    createTime?: string;
    /** 部门名 */
    deptName?: string;
    /** 部门列表 */
    dept?: Recordable<any>;
    /** 角色列表 */
    roles?: Array<Recordable<any>>;
  }

  export interface SystemUserPageQuery extends Recordable<any> {
    userName?: string;
    nickName?: string;
    phonenumber?: string;
    status?: string;
    deptId?: number;
    beginTime?: string;
    endTime?: string;
  }

  export interface SystemUserInfo {
    user: SystemUser;
    roleIds: number[];
    roles: Array<Recordable<any>>;
    postIds: number[];
    posts: Array<Recordable<any>>;
  }
}

/**
 * 获取用户列表（分页）
 */
export async function getUserList(params?: SystemUserApi.SystemUserPageQuery) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    '/system/user/list',
    { params },
  );
}

/**
 * 获取用户详情（含角色/岗位信息）
 */
export async function getUser(userId: number) {
  return requestClient.get<SystemUserApi.SystemUserInfo>(
    `/system/user/${userId}`,
  );
}

/**
 * 新增用户
 */
export async function createUser(data: SystemUserApi.SystemUser) {
  return requestClient.postWithMsg('/system/user', data);
}

/**
 * 修改用户
 */
export async function updateUser(data: SystemUserApi.SystemUser) {
  return requestClient.putWithMsg('/system/user', data);
}

/**
 * 修改用户状态
 */
export async function changeUserStatus(data: {
  status: string;
  userId: number;
}) {
  return requestClient.putWithMsg('/system/user/changeStatus', data);
}

/**
 * 重置密码
 */
export async function resetUserPwd(data: { password: string; userId: number; }) {
  return requestClient.putWithMsg('/system/user/resetPwd', data);
}

/**
 * 删除用户
 */
export async function deleteUser(userIds: string) {
  return requestClient.deleteWithMsg(`/system/user/${userIds}`);
}

/**
 * 获取部门树列表
 */
export async function getUserDeptTree() {
  return requestClient.get('/system/user/deptTree');
}

import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace ProfileApi {
  export interface ProfileVo {
    user: {
      avatar: string;
      dept?: { deptName: string };
      deptId: number;
      email: string;
      nickName: string;
      phonenumber: string;
      roles?: Array<{ roleId: number; roleKey: string; roleName: string }>;
      sex: string;
      userName: string;
    };
    roleGroup: string;
    postGroup: string;
  }

  export interface UpdateProfileBo {
    nickName?: string;
    email?: string;
    phonenumber?: string;
    sex?: string;
  }

  export interface UpdatePasswordBo {
    oldPassword: string;
    newPassword: string;
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('system/user/getInfo');
}

/** 获取个人中心信息 */
export function getUserProfileApi() {
  return requestClient.get<ProfileApi.ProfileVo>('system/user/profile');
}

/** 修改用户个人信息 */
export function updateUserProfileApi(data: ProfileApi.UpdateProfileBo) {
  return requestClient.putWithMsg('system/user/profile', data);
}

/** 修改用户密码 */
export function updateUserPasswordApi(data: ProfileApi.UpdatePasswordBo) {
  return requestClient.putWithMsg('system/user/profile/updatePwd', data, {
    encrypt: true,
  });
}

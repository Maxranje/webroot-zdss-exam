export interface LoginParams {
    username: string;
    password: string;
}

export interface ResetPasswordParams {
    username: string;
    oldPassword: string;
    newPassword: string;
}

export interface UserInfo {
    nickname: string;
    type: number;
    roleType: number;
    uid: number;
    avatar: string;
    sex: string;
    school: string;
    graduate: string;
    sopname: string;
}

export interface LoginResponse {
    status: number;
    msg: string;
    data: {
        user: UserInfo;
        auth_token: string;
        redirect?: string;
    };
}

export interface AuthState {
    isLoggedIn: boolean;
    userInfo: UserInfo | null;
    token: string | null;
    loading: boolean;
}

export interface ApiResponse<T = any> {
    status: number;
    msg: string;
    data: T;
}

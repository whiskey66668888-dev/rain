import request from '@/core/sdk/request';
import { useQueryHook } from '@/core/query/hooks';
import { ResponseData } from '@/core/sdk/request/model';

import { buildLoginRequestOptions } from './loginRequestOptions';

export interface LoginParams {
  loginName: string;
  password: string;
  uuid?: string;
  // 1=true, 0=false
  keepLogin: '1' | '0';
  visitorId?: string;
  token?: string;
  // 极验验证码参数
  captchaId?: string;
  captchaOutput?: string;
  lotNumber?: string;
  passToken?: string;
  genTime?: string;
  mouseAction?: string;
}
export interface LoginResponse {
  /** ws token */
  Authorization: string;
  loginName: string;
  realName: string | null;
  gender: string;
  groupId: number;
  haveCashPass: boolean;
  isAgent: boolean;
  email: string;
  phone: string;
  countryCode: string;
  securityCode: boolean;
  bindingCount: number;
  isOtherSessionKickOff: boolean;
}
// 登录
export const loginReq = (data: LoginParams): Promise<ResponseData<LoginResponse>> => {
  return request.post<LoginResponse, LoginParams>('/v3/login2', buildLoginRequestOptions(data));
};
// 二次登录
export const loginWithTokenReq = (data: LoginParams): Promise<ResponseData<LoginResponse>> => {
  return request.post<LoginResponse, LoginParams>('/v3/loginWithToken', {
    isErrorToast: true,
    body: data,
  });
};

// 登录日志发送
export const loginLogReq = (data: LoginParams): Promise<void> => {
  return request
    .post<void, LoginParams>('/v3/getLoginLog', buildLoginRequestOptions(data, undefined, false))
    .then((res) => res.data);
};

// 退出登录
export const logoutReq = (): Promise<ResponseData<void>> => {
  return request.post('/api/website/logout', {});
};

// 注册
export interface RegisterParams {
  loginName: string;
  password: string;
  confirmPassword: string;
  inviter?: string; // 邀请码
  agentLoginName?: string; // 代理登录名
  uuid?: string;
  captchaId?: string;
  captchaOutput?: string;
  lotNumber?: string;
  passToken?: string;
  genTime?: string;
}

export interface RegisterResponse {
  loginName: string;
  [key: string]: unknown;
}

export const registerReq = (data: RegisterParams): Promise<ResponseData<RegisterResponse>> => {
  return request.post<RegisterResponse, RegisterParams>('/v3/register', {
    isErrorToast: true,
    body: data,
  });
};

// 验证码相关接口
export interface CaptchaData {
  key: string;
  img: string;
}

export interface VerifyCaptchaParams {
  key: string;
  answer: string;
}

// 获取验证码图片
export const getCaptchaReq = (): Promise<ResponseData<CaptchaData>> => {
  return request.post<CaptchaData, void>('/v3/util/captcha', {
    isErrorToast: false,
  });
};

// 验证验证码
export const verifyCaptchaReq = (data: VerifyCaptchaParams): Promise<ResponseData<void>> => {
  return request.post<void, VerifyCaptchaParams>('/v3/util/verifyCaptcha', {
    isErrorToast: false,
    body: data,
  });
};

// 忘记密码相关接口
export interface CheckLoginNameParams {
  loginName: string;
  key?: string; // 验证码 key（从 verifyCaptcha 获取，参数名可能是 key 而不是 captchaKey）
  captchaKey?: string; // 兼容旧参数名
  captchaId?: string;
  captchaOutput?: string;
  lotNumber?: string;
  passToken?: string;
  genTime?: string;
}

// 检查账号是否存在
export interface ExistLoginNameResponse {
  existLoginName?: boolean;
  [key: string]: unknown;
}

export const existLoginNameReq = (
  data: CheckLoginNameParams,
): Promise<ResponseData<ExistLoginNameResponse>> => {
  return request.post<ExistLoginNameResponse, CheckLoginNameParams>('/v3/existLoginName', {
    isErrorToast: true, // 与老项目保持一致，自动显示错误提示
    body: data,
  });
};

export interface ResetPasswordParams {
  loginName: string;
  newPassword: string;
  confirmPassword: string;
  captchaKey: string;
}

// 获取安全信息（用于获取可用的找回方式）
export interface SecurityInfoResponse {
  haveCashPass?: boolean; // 是否有支付密码
  securityCode?: boolean; // 是否有安全码
  email?: string; // 邮箱
  phone?: string; // 手机号
  [key: string]: unknown;
}

export interface GetSecurityInfoParams {
  loginName?: string;
  [key: string]: unknown;
}

export const getSecurityInfoReq = (
  data?: GetSecurityInfoParams,
): Promise<ResponseData<SecurityInfoResponse>> => {
  return request.post<SecurityInfoResponse, GetSecurityInfoParams>('/v3/securityInfo', {
    isErrorToast: true, // 与老项目保持一致
    body: data || {},
  });
};

// 获取安全中心信息（用于获取可用的找回方式）
// 通过 securityBindList 判断：Pay_Password + bind=true 表示已开启支付密码
export interface SecurityBindItem {
  securityKey?: string;
  bind?: boolean;
  title?: string;
  describe?: string;
  [key: string]: unknown;
}

export interface AccountBindItem {
  accountBindType: string;
  bind: boolean;
  max: number;
  number: number;
  title: string;
}

export interface SecurityCenterResponse {
  haveCashPass?: boolean;
  securityCode?: boolean;
  email?: string;
  phone?: string;
  securityBindList?: SecurityBindItem[];
  accountBindList?: AccountBindItem[];
  [key: string]: unknown;
}

export interface GetSecurityCenterParams {
  loginName?: string;
  [key: string]: unknown;
}

export const getSecurityCenterReq = (
  data?: GetSecurityCenterParams,
): Promise<ResponseData<SecurityCenterResponse>> => {
  return request.post<SecurityCenterResponse, GetSecurityCenterParams>(
    '/v3/member/securityCenter2',
    {
      isErrorToast: true,
      body: data || {},
    },
  );
};

export const useSecurityDataQuery = (): ReturnType<
  typeof useQueryHook<SecurityCenterResponse, Error>
> => {
  return useQueryHook<SecurityCenterResponse, Error>({
    queryKey: ['member', 'securityCenter2'],
    queryFn: () =>
      getSecurityCenterReq()
        .then((res) => res.data)
        .catch(() => {
          return {};
        }),
    staleTime: 30 * 1000,
    retry: false,
    refetchOnMount: false,
  });
};

export interface NotPopCurrendDayParams {
  securityId?: string | number;
  [key: string]: unknown;
}

export const notPopCurrendDayReq = (
  data: NotPopCurrendDayParams,
): Promise<ResponseData<unknown>> => {
  return request.post<unknown, NotPopCurrendDayParams>('/v3/member/notPopCurrendDay', {
    isErrorToast: true,
    body: data,
  });
};

// 验证支付密码（
// 成功返回 token，用于后续 resetLoginPassword 接口
// type: 2 = 忘记登录密码，后端据此下发对应 token
export interface VerifyCashPasswordParams {
  loginName: string; // 账号
  cashPassword: string; // 支付密码
  type?: number; // 2=忘记登录密码
  [key: string]: unknown;
}

export interface VerifyCashPasswordResponse {
  token?: string;
  email?: string;
  phone?: string;
  securityCode?: boolean;
  bindGesturePwd?: boolean;
  securityType?: boolean;
  [key: string]: unknown;
}

export const verifyCashPasswordReq = (
  data: VerifyCashPasswordParams,
): Promise<ResponseData<VerifyCashPasswordResponse>> => {
  return request.post<VerifyCashPasswordResponse, VerifyCashPasswordParams>(
    '/v3/member/verifyCashPassword',
    {
      isErrorToast: true,
      body: data,
    },
  );
};

// 2. 登录密码相关接口（忘记密码流程）
export interface LoginPasswordParams {
  loginName: string;
  paymentPassword: string;
  key?: string; // 验证码 key
  [key: string]: unknown;
}

export const loginPasswordReq = (data: LoginPasswordParams): Promise<ResponseData<void>> => {
  return request.post<void, LoginPasswordParams>('/mine/safeCenter/loginPassWord', {
    isErrorToast: true,
    body: data,
  });
};

// 3. IP检查接口
export interface CheckIp2RegionData {
  ip?: string;
  Country?: string;
  City?: string;
  Province?: string;
}

export const checkIp2Req = (): Promise<ResponseData<CheckIp2RegionData>> => {
  return request.get<CheckIp2RegionData, void>('/api/website/check/ip2', {
    isErrorToast: false,
  });
};

// 重置密码（忘记密码流程 ）
export interface ResetLoginPasswordParams {
  loginName: string;
  password: string;
  confirmPassword: string;
  token: string; // 支付密码验证成功后返回的 token
  [key: string]: unknown;
}

export const resetLoginPasswordReq = (
  data: ResetLoginPasswordParams,
): Promise<ResponseData<void>> => {
  return request.post<void, ResetLoginPasswordParams>('/v3/member/resetLoginPassword', {
    isErrorToast: true,
    body: data,
  });
};

// 获取人工客服信息（忘记密码走人工时：有 orderId 直接跳客服，无则进入预设密码步骤）
export interface GetCustomerServiceInfoParams {
  loginName: string;
  type: number; // 2 = 忘记登录密码
}
export interface GetCustomerServiceInfoResponse {
  orderId?: string;
  kefu?: string;
  [key: string]: unknown;
}
export const getCustomerServiceInfoReq = (
  data: GetCustomerServiceInfoParams,
): Promise<ResponseData<GetCustomerServiceInfoResponse>> => {
  return request.post<GetCustomerServiceInfoResponse, GetCustomerServiceInfoParams>(
    '/v3/getCustomerServiceInfo',
    { isErrorToast: true, body: data },
  );
};

// 人工重置登录密码（预设密码后提交，返回客服链接）
export interface ResetPasswordByManualParams {
  loginName: string;
  password: string;
  type: number; // 2 = 忘记登录密码
}
export interface ResetPasswordByManualResponse {
  kefu?: string;
  orderId?: string;
  [key: string]: unknown;
}
export const resetPasswordByManualReq = (
  data: ResetPasswordByManualParams,
): Promise<ResponseData<ResetPasswordByManualResponse>> => {
  return request.post<ResetPasswordByManualResponse, ResetPasswordByManualParams>(
    '/v3/member/resetPasswordByManual',
    { isErrorToast: true, body: data },
  );
};

// 修改登录密码（已登录状态下，需要旧密码）
export const resetPasswordReq = (data: ResetPasswordParams): Promise<ResponseData<void>> => {
  return request.post<void, ResetPasswordParams>('/v3/member/vAndRLoginPassword', {
    isErrorToast: true,
    body: data,
  });
};

/** 修改登录密码（原密码 + 新密码 + 确认） */
export interface VAndRLoginPasswordParams {
  loginPassword: string;
  newLoginPassword: string;
  confirmNewLoginPassword: string;
  [key: string]: unknown;
}
export const vAndRLoginPasswordReq = (
  data: VAndRLoginPasswordParams,
): Promise<ResponseData<void>> => {
  return request.post<void, VAndRLoginPasswordParams>('/v3/member/vAndRLoginPassword', {
    isErrorToast: true,
    body: data,
  });
};

/** 首次登录修改密码（无需旧密码） */
export interface ChangeLoginPasswordParams {
  loginName: string;
  newLoginPassword: string;
  confirmNewLoginPassword: string;
  [key: string]: unknown;
}

export const changeLoginPasswordReq = (
  data: ChangeLoginPasswordParams,
): Promise<ResponseData<void>> => {
  return request.post<void, ChangeLoginPasswordParams>('/v3/verifyAndChangeLoginPassword', {
    isErrorToast: true,
    body: data,
  });
};

// ---------- 安全中心 - 手机绑定 ----------
export interface CountryCodeItem {
  value: string;
  name?: string;
  label?: string;
  [key: string]: unknown;
}

export const getCountryCodeListReq = (): Promise<ResponseData<CountryCodeItem[]>> => {
  return request.post<CountryCodeItem[], void>('/v3/util/getCountryCodeList', {
    isErrorToast: true,
  });
};

export interface GetCodeBySMSParams {
  loginName?: string;
  phone: string;
  countryCode: string;
  type: number;
  token?: string;
  unbindType?: string;
  [key: string]: unknown;
}

export const getCodeBySMSReq = (data: GetCodeBySMSParams): Promise<ResponseData<unknown>> => {
  return request.post('/v3/getCodeBySMS', {
    isErrorToast: true,
    body: data,
  });
};

export interface BindPhoneParams {
  loginName?: string;
  phone: string;
  countryCode: string;
  type: number;
  code: string;
  token?: string;
  unbindType?: string;
  [key: string]: unknown;
}

export const bindPhoneReq = (data: BindPhoneParams): Promise<ResponseData<unknown>> => {
  return request.post('/v3/member/bindPhone', {
    isErrorToast: true,
    body: data,
  });
};

/** 通用解绑接口（解绑手机、邮箱、微软验证器等） */
export interface UnbindByTypeParams {
  type: number | string; // 7=手机解绑，9=邮箱解绑，11=微软安全令牌解绑
  token: string;
  loginName?: string;
}
export const unbindByTypeReq = (data: UnbindByTypeParams): Promise<ResponseData<unknown>> => {
  return request.post('/v3/member/unbindByType', {
    isErrorToast: true,
    body: data,
  });
};

/** 手机验证码校验，返回 token 供 bindPhone / unbindByType 等使用（与 verifyByEmail 对称） */
export interface VerifyByPhoneParams {
  phone: string;
  countryCode: string;
  code: string;
  type: number;
  loginName?: string;
  unbindType?: string;
  [key: string]: unknown;
}
export interface VerifyByPhoneResponse {
  token?: string;
  [key: string]: unknown;
}
export const verifyByPhoneReq = (
  data: VerifyByPhoneParams,
): Promise<ResponseData<VerifyByPhoneResponse>> => {
  return request.post<VerifyByPhoneResponse, VerifyByPhoneParams>('/v3/verifyBySMS', {
    isErrorToast: true,
    body: data,
  });
};

/** 向邮箱发送验证码，type 8=邮箱绑定 */
export interface GetCodeByEmailParams {
  email: string;
  type: number;
  loginName?: string;
  token?: string;
  unbindType?: string;
  [key: string]: unknown;
}
export const getCodeByEmailReq = (data: GetCodeByEmailParams): Promise<ResponseData<unknown>> => {
  return request.post('/v3/getCodeByEmail', {
    isErrorToast: true,
    body: data,
  });
};

/** 通过邮箱验证码验证，返回 token，type 8=邮箱绑定、9=邮箱解绑等 */
export interface VerifyByEmailParams {
  email: string;
  code: string;
  type: number;
  loginName?: string;
  token?: string;
  unbindType?: string;
  [key: string]: unknown;
}
export interface VerifyByEmailResponse {
  token?: string;
  [key: string]: unknown;
}
export const verifyByEmailReq = (
  data: VerifyByEmailParams,
): Promise<ResponseData<VerifyByEmailResponse>> => {
  return request.post<VerifyByEmailResponse, VerifyByEmailParams>('/v3/verifyByEmail', {
    isErrorToast: true,
    body: data,
  });
};

/** 绑定邮箱，type 8 */
export interface BindEmailParams {
  loginName?: string;
  email: string;
  type: number;
  code: string;
  token?: string;
  unbindType?: string;
  [key: string]: unknown;
}
export const bindEmailReq = (data: BindEmailParams): Promise<ResponseData<unknown>> => {
  return request.post('/v3/member/bindEmail', {
    isErrorToast: true,
    body: data,
  });
};

// ---------- 安全中心 - 设置支付密码（验证登录密码 + 设置支付密码） ----------
export interface VerifyLoginPasswordParams {
  loginName?: string;
  loginPassword: string;
  type: number;
}

export interface VerifyLoginPasswordResponse {
  token?: string;
  [key: string]: unknown;
}

export const verifyLoginPasswordReq = (
  data: VerifyLoginPasswordParams,
): Promise<ResponseData<VerifyLoginPasswordResponse>> => {
  return request.post<VerifyLoginPasswordResponse, VerifyLoginPasswordParams>(
    '/v3/member/verifyLoginPassword',
    { isErrorToast: true, body: data },
  );
};

export interface SetCashPasswordParams {
  loginName?: string;
  cashPassword: string;
  confirmCashPassword: string;
  token: string;
  type: number;
}

export const setCashPasswordReq = (data: SetCashPasswordParams): Promise<ResponseData<unknown>> => {
  return request.post('/v3/member/resetCashPassword', {
    isErrorToast: true,
    body: data,
  });
};

/** 修改支付密码（原密码 + 新密码 + 确认新密码），*/
export interface VAndRCashPasswordParams {
  cashPassword: string;
  newCashPassword: string;
  confirmNewCashPassword: string;
  [key: string]: unknown;
}
export const vAndRCashPasswordReq = (
  data: VAndRCashPasswordParams,
): Promise<ResponseData<unknown>> => {
  return request.post('/v3/member/vAndRCashPassword', {
    isErrorToast: true,
    body: data,
  });
};

// 微软安全令牌
export interface GetAuthKeyParams {
  loginName?: string;
}
export interface AuthKeyData {
  secret?: string;
  qrCode?: string;
  graphicUrl?: string;
  videoUrl?: string;
  [key: string]: unknown;
}
export const getAuthKeyReq = (data: GetAuthKeyParams): Promise<ResponseData<AuthKeyData>> => {
  return request.post<AuthKeyData, GetAuthKeyParams>('/v3/member/getAuthKey', {
    isErrorToast: true,
    body: data,
  });
};

export interface BindAuthKeyParams {
  code: string;
  type: string | number;
  secret: string;
  token?: string;
  unbindType?: string;
  loginName?: string;
  [key: string]: unknown;
}
export const bindAuthKeyReq = (data: BindAuthKeyParams): Promise<ResponseData<unknown>> => {
  return request.post('/v3/member/bindAuthKey', {
    isErrorToast: true,
    body: data,
  });
};

export interface AuthenticatorURLResponse {
  ios?: string;
  android?: string;
  [key: string]: unknown;
}
export const getAuthenticatorURLReq = (): Promise<ResponseData<AuthenticatorURLResponse>> => {
  return request.post<AuthenticatorURLResponse, object>('/v3/util/authenticatorURL', {
    isErrorToast: true,
    body: {},
  });
};

// 微软安全令牌验证（用于身份验证等流程，成功返回 token 供后续 bindPhone/getCodeBySMS 使用）
export interface VerifyByMicrosoftParams {
  code: string;
  type?: number; // 业务类型，如 6=手机绑定
  loginName: string;
  unbindType?: string;
  [key: string]: unknown;
}
export interface VerifyByMicrosoftResponse {
  token?: string;
  [key: string]: unknown;
}
export const verifyByMicrosoftReq = (
  data: VerifyByMicrosoftParams,
): Promise<ResponseData<VerifyByMicrosoftResponse>> => {
  return request.post<VerifyByMicrosoftResponse, VerifyByMicrosoftParams>('/v3/verifyByMicrosoft', {
    isErrorToast: true,
    body: data,
  });
};

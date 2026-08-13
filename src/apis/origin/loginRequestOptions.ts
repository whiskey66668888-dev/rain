import type { CustomerServiceDeviceInfo } from '@/common/utils/customerServiceDeviceInfo';
import { getCustomerServiceDeviceInfo } from '@/common/utils/customerServiceDeviceInfo';

import type { LoginParams } from './login';

export function buildLoginRequestOptions(
  data: LoginParams,
  deviceInfo: CustomerServiceDeviceInfo = getCustomerServiceDeviceInfo(),
  isErrorToast = true,
) {
  return {
    isErrorToast,
    body: data,
    headers: {
      devicemodel: deviceInfo.phoneModel,
      osversion: deviceInfo.phoneOs,
    },
  };
}

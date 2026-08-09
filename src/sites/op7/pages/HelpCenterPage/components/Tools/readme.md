# Flutter H5 交互页面映射文档

## 概述

本文档描述了 H5 应用中各个功能模块与 Flutter 应用页面的对应关系和交互方式。

## Hook 使用

项目使用 `useFlutterBridge` Hook 来处理与 Flutter 的交互：

```tsx
import useFlutterBridge from '@/hooks/useFlutterBridge';

const { sendToFlutter, isInFlutter } = useFlutterBridge();
```

## 页面映射表

### 登录认证类

| H5 路由/功能           | Flutter Action | 说明           |
| ---------------------- | -------------- | -------------- |
| `/login`               | `toLogin`      | 登录页面       |
| 未登录状态下的任何操作 | `toLogin`      | 统一跳转到登录 |

### 安全中心类

| H5 路由                                      | Flutter Action       | 触发条件       | 说明              |
| -------------------------------------------- | -------------------- | -------------- | ----------------- |
| `/mine/safeCenter/手机绑定`                  | `onMobileCardHandle` | 未绑定手机号   | 手机号绑定页面    |
| `/mine/safeCenter/手机解绑?unbind=1`         | `onMobileCardHandle` | 已绑定手机号   | 手机号解绑页面    |
| `/mine/safeCenter/checkLogin?type=4`         | `toCashPwdVerify`    | 已有支付密码   | 支付密码验证/修改 |
| `/mine/withdrawPassWord`                     | `toCashPwdVerify`    | 未设置支付密码 | 支付密码设置      |
| `/mine/safeCenter/邮箱绑定`                  | `toEmailVerify`      | 未绑定邮箱     | 邮箱绑定页面      |
| `/mine/safeCenter/邮箱解绑?unbind=1`         | `toEmailVerify`      | 已绑定邮箱     | 邮箱解绑页面      |
| `/mine/safeCenter/微软安全令牌绑定`          | `onMicrosoftHandle`  | 未绑定令牌     | 微软令牌绑定      |
| `/mine/safeCenter/微软安全令牌解绑?unbind=1` | `onMicrosoftHandle`  | 已绑定令牌     | 微软令牌解绑      |

### 账户资产类

| H5 路由              | Flutter Action  | 参数           | 说明           |
| -------------------- | --------------- | -------------- | -------------- |
| `/mine/bank?index=0` | `toAccountPage` | `{ value: 0 }` | 银行卡管理页面 |
| `/mine/bank?index=1` | `toAccountPage` | `{ value: 1 }` | 虚拟货币页面   |
| `/mine/bank?index=2` | `toAccountPage` | `{ value: 2 }` | 数字货币页面   |

## 使用示例

### 基本用法

```tsx
const Tools = () => {
  const { sendToFlutter, isInFlutter } = useFlutterBridge();

  const handleItemClick = (item: any) => {
    if (isLogin()) {
      if (item.toolsKey === 'bank_card') {
        if (isInFlutter()) {
          sendToFlutter('toAccountPage', { value: 0 });
          return;
        }
        router.push('/mine/bank?index=0');
      }
    } else {
      if (isInFlutter()) {
        sendToFlutter('toLogin');
      } else {
        router.push('/login');
      }
    }
  };
};
```

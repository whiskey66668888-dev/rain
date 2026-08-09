'use client';

import React, { useEffect } from 'react';

import { checkIp2Req } from '@/apis/origin/login';
import { getServiceInfoReq } from '@/apis/origin/customerService';
import { getPreInfoReq } from '@/apis/origin/setting';
import Button from '@/common/components/Button';
import { useAppDispatch } from '@/core/store/hooks';
import { requestOpenCustomerService } from '@/core/store/slices/customerServiceUISlice';
import { CustomerServiceHeadsetSvg, Op7LogoSvg } from '@/sites/op7/components/SvgIcons';

import styles from './AccessRestPage.module.scss';

/** IP 地区访问受限说明页 */
const AccessRestPage: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    getPreInfoReq().catch(() => {});
    getServiceInfoReq(1).catch(() => {});
    checkIp2Req().catch(() => {});
  }, []);

  return (
    <div className={styles.accessRest}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <header className={styles.header}>
          <Op7LogoSvg className={styles.logo} />
        </header>
        <div className={styles.main}>
          <div className={styles.hero}>
            <img
              src="/images/common/limit-access.png"
              className={styles.heroImg}
              width={672}
              height={809}
              decoding="async"
            />
          </div>
          <div className={styles.copy}>
            <h1 className={styles.title}>访问限制</h1>
            <div className={styles.desc}>
              <p className={styles.descGreeting}>亲爱的玩家：</p>
              <p className={styles.descBody}>
                您的IP地址所属国家或地区不在我们服务范围内，您无法访问本平台的应用。我们感谢您的理解与支持。如有疑问，您可以通过客服渠道与我们联系。
              </p>
            </div>
            <div className={styles.actions}>
              <Button
                type="primary"
                size="middle"
                className={styles.contactBtn}
                icon={
                  <span className={styles.contactBtnIconWrap}>
                    <CustomerServiceHeadsetSvg className={styles.contactBtnIcon} />
                  </span>
                }
                onClick={() => dispatch(requestOpenCustomerService())}
              >
                联系客服
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessRestPage;

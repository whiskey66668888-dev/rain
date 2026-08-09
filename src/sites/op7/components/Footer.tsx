import React, { useState } from 'react';

import LazyImage from '@/common/components/LazyImage';
import clsx from 'clsx';
import LegalContentPopup from './Footer/LegalContentPopup';
import { LEGAL_LINK_ITEMS, type LegalLinkKey } from './Footer/legalContents';

const licenseImages = [
  {
    // url: 'https://cert.gcb.cw/certificate?id=ZXlKcGRpSTZJbTk1VDAwdlRuQm9VRUpSWW5ac2JVcHJjRzl2Y0ZFOVBTSXNJblpoYkhWbElqb2lTUzlTV0VKM1FVaFZaVUp0V0RaT1pVbEtjblUyUVQwOUlpd2liV0ZqSWpvaU1USTVaakUzWkRWak1UaGhZVEEzWkRCa016WTRNalEyTkRZNU1tRXlZMkUyT1dSaFpHTTRabUZsTTJReU5UTTRZVGhpWVdVeU5UUmpNRFZrWTJJek15SXNJblJoWnlJNklpSjk=',
    url: 'https://cert.cga.cw/certificate?id=ZXlKcGRpSTZJbXhFUm01Sk9FbHJTMGhGVDJKSmFsVkdVMmd6WmtFOVBTSXNJblpoYkhWbElqb2lOMmhaV25aNGFqQlpjRWhZZEVwd09XZHRTR1JHVVQwOUlpd2liV0ZqSWpvaU5HUXdNemt5WmpKbE4yUmtZMkkyTUdSa01qaGxabVF3WkRRNE1qQTNaakZpTTJFelpUZzFOVGs1WVRZeU5HTXpNemcwWkdNNE9Ua3pOek5pTnpRelpDSXNJblJoWnlJNklpSjk=',
    image: '/images/common/footer/L1.svg',
  },
  {
    url: '',
    image: '/images/common/footer/L2.svg',
  },
  {
    url: 'https://www.mga.org.mt/',
    image: '/images/common/footer/L3.svg',
  },
  {
    url: 'https://www.gamblingcommission.gov.uk/',
    image: '/images/common/footer/L4.svg',
  },
  {
    url: 'https://igamingontario.ca/en',
    image: '/images/common/footer/L5.svg',
  },
  {
    url: 'https://www.bigtimegaming.com/',
    image: '/images/common/footer/L6.svg',
  },
  {
    url: 'https://gamingcontrolboard.pa.gov/',
    image: '/images/common/footer/L7.svg',
  },
  {
    url: 'https://www.gamingcommission.gov.gr/',
    image: '/images/common/footer/L8.svg',
  },
];

/**
 * 底部页脚组件
 */
const Footer: React.FC = () => {
  const [activeLegal, setActiveLegal] = useState<LegalLinkKey | null>(null);

  return (
    <>
      <div className="mx-auto flex w-full max-w-1200px flex-col gap-12px overflow-hidden rounded-t-10px px-12px pb-20px pt-12px">
        <div className="flex w-full flex-col gap-12px">
          <div className="flex w-full flex-col gap-14px">
            <p className="_tf[14] m-0 font-600 leading-[1.5] text-[var(--Text-Main-10)]">
              游戏牌照
            </p>
            <div className="flex w-full flex-row items-center gap-8px overflow-x-auto overflow-y-hidden">
              {licenseImages.map((item, index) => (
                <div
                  key={index}
                  className={clsx(
                    'flex h-48px w-15% min-w-95px flex-shrink-0 items-center justify-center rounded-10px bg-[var(--Background-300)]',
                    item.url && 'cursor-pointer',
                  )}
                >
                  <LazyImage
                    src={item.image}
                    onClick={() => item.url && window.open(item.url, '_blank')}
                    className="h-24px w-55px object-contain"
                    lazy={false}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-14px">
            <p className="_tf[14] m-0 font-600 leading-[1.5] text-[var(--Text-Main-10)]">关于OP7</p>
            <p className="_tf[12] m-0 max-w-1200px font-weight-400 leading-[1.5] text-[var(--Text-700)]">
              本网站的运营方为SKY SPORTS N.V.，注册地址为库拉索汉奇·斯诺阿19号特里亚斯大厦。SKY
              SPORTS
              N.V.已获得库拉索博彩监管委员会颁发的许可证，自2025年5月19日起，根据国家机会游戏条例（Landsverordening
              op de kansspelen，LOK）提供牌照号为OGL/2024/434/0469。
            </p>
          </div>
        </div>

        <div className="h-0 w-full border-t-0.5px border-t-solid border-t-[var(--Line-100)]" />

        <div className="flex w-full items-center justify-center gap-8px lg:gap-24px">
          {LEGAL_LINK_ITEMS.map((link, index) => (
            <React.Fragment key={link.key}>
              {index > 0 ? (
                <span className="h-10px w-0 border-l-0.5px border-l-solid border-l-[var(--Text-800)]" />
              ) : null}
              <button
                type="button"
                className="_tf[12] cursor-pointer border-b-0.5px border-b-solid border-b-[var(--Text-800)] bg-transparent p-0 leading-16px whitespace-nowrap text-[var(--Text-800)]"
                onClick={() => setActiveLegal(link.key)}
              >
                {link.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <LegalContentPopup linkKey={activeLegal} onClose={() => setActiveLegal(null)} />
    </>
  );
};

export default Footer;

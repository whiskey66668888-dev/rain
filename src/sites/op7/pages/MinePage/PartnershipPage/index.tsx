import clsx from 'clsx';

import H5Header from '../../../components/H5Header';
import {
  Op7LogoSvg,
  PartnershipTitleShortSvg,
  PartnershipTitleSvg,
} from '../../../components/SvgIcons';
import CopyButton from '../../../components/CopyButton';
import LazyImage from '@/common/components/LazyImage';
import Button from '@/common/components/Button';
import { TContactsData, useContactsQuery } from '@/apis/origin/contacts';
import { useCallback, useMemo } from 'react';
import { isAndroid, isIos } from '@/utils/env';

const FEATURE_CARDS = [
  {
    image: '/images/common/partnership/member_data.webp',
    title: '会员数据',
    desc: '实时的会员游戏数据',
  },
  {
    image: '/images/common/partnership/sub_system.webp',
    title: '下级系统',
    desc: '完善的代理制度',
  },
  {
    image: '/images/common/partnership/exclusive_domain.webp',
    title: '专属域名',
    desc: '客制化专属渠道',
  },
  {
    image: '/images/common/partnership/commission_bonus.webp',
    title: '佣金分红',
    desc: '公开透明的计算方式',
  },
];

const CONTACTS: {
  logo: string;
  title: string;
  subTitle?: string;
  subTitleKey: keyof TContactsData;
  content?: string;
  contentKey: keyof TContactsData;
  getExternalUrl?: (data: TContactsData) => string;
}[] = [
  {
    logo: '/images/common/contacts/logo_microsoft.webp',
    title: 'Teams',
    subTitleKey: 'skypeReal',
    contentKey: 'skype',
  },
  {
    logo: '/images/common/contacts/logo_telegram.webp',
    title: 'Telegram',
    subTitleKey: 'telegramReal',
    contentKey: 'telegram',
    getExternalUrl: () =>
      isAndroid()
        ? 'https://play.google.com/store/apps/details?id=org.telegram.messenger'
        : 'https://apps.apple.com/app/telegram-messenger/id686449807',
  },
  {
    logo: '/images/common/contacts/logo_gmail.webp',
    title: 'Mail',
    subTitleKey: 'emailReal',
    contentKey: 'email',
    getExternalUrl: (data) =>
      isIos() ? 'MESSAGE://' : `https://mail.google.com/mail/?view=cm&to=${data.emailReal}`,
  },
] as const;

const TitleSection = ({ title }: { title: string }) => {
  return (
    <div
      className={clsx(
        'flex items-center overflow-hidden',
        'justify-center gap-16px',
        'text-[var(--ThemeColor-Main)]',
      )}
    >
      <PartnershipTitleShortSvg className="h-21px lg:hidden" />
      <PartnershipTitleSvg className="h-21px hidden lg:block" />
      <div className="_tf[24] font-700 leading-[1.33] text-nowrap">{title}</div>
      <PartnershipTitleShortSvg className="h-21px scale-x-[-1] lg:hidden" />
      <PartnershipTitleSvg className="h-21px scale-x-[-1] hidden lg:block" />
    </div>
  );
};

export default function PartnershipPage() {
  const { data: contactsData } = useContactsQuery();

  const contactsList = useMemo(() => {
    return CONTACTS.map((item) => {
      return {
        ...item,
        subTitle: contactsData?.[item.subTitleKey],
        content: contactsData?.[item.contentKey],
        externalUrl: contactsData && item.getExternalUrl ? item.getExternalUrl(contactsData) : '',
      };
    }).filter((item) => item.subTitle && item.content);
  }, [contactsData]);

  const handleContactAgent = useCallback(() => {
    if (contactsData?.kefu) {
      window.open(contactsData.kefu, '_blank');
    }
  }, [contactsData]);

  const handleContactCardClick = useCallback((externalUrl?: string) => {
    if (externalUrl) {
      window.open(externalUrl, '_blank');
    }
  }, []);

  return (
    <div
      data-desc="mine-partnership-page"
      className={clsx(
        'self-center w-full ',
        'flex-1 flex flex-col ',
        'overflow-y-auto lg:overflow-initial',
        'lg:max-w-[1220px]',
      )}
    >
      <H5Header title="加入合营" />

      <div className={clsx('flex flex-col gap-24px p-12px', 'lg:gap-40px lg:p-24px')}>
        <div className="self-center py-12px">
          <Op7LogoSvg className="h-24px w-64px text-[var(--ThemeColor-Main)]" />
        </div>

        <section className="flex flex-col gap-16px lg:gap-24px">
          <TitleSection title="联盟合营" />

          <div className="grid grid-cols-2 gap-10px lg:gap-24px">
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex flex-col items-center gap-4px lg:gap-8px rounded-12px bg-[var(--Background-300)] p-10px"
              >
                <LazyImage src={card.image} alt={card.title} className="h-100px w-100px" />
                <div className="_tf[14] font-500 leading-[1.43] text-[var(--ThemeColor-Main)]">
                  {card.title}
                </div>
                <div className="_tf[12] leading-[1.33] text-[var(--Text-800)]">{card.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-16px lg:gap-24px">
          <TitleSection title="联络我们" />

          <div className="flex flex-col gap-10px lg:gap-12px">
            {contactsList.map((item) => (
              <div
                key={item.title}
                className={clsx(
                  'flex items-center rounded-12px bg-[var(--Background-300)] py-14px',
                  'px-12px lg:px-24px',
                  'gap-10px lg:gap-24px',
                  item.externalUrl && 'cursor-pointer',
                )}
                onClick={() => handleContactCardClick(item.externalUrl)}
              >
                <LazyImage src={item.logo} alt={item.title} className="w-28px shrink-0" />

                <div className="w-1px h-28px shrink-0 bg-[var(--Line-100)]" />

                <div className="flex-1">
                  <div className="_tf[14] font-500 leading-[1.43] text-[var(--Text-Main-10)]">
                    {item.title}
                  </div>
                  <div className="_tf[12] font-500 leading-[1.33] text-[var(--Text-700)] break-all">
                    {item.subTitle}
                  </div>
                </div>

                <div
                  className="shrink-0 flex"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <CopyButton text={item.content || ''} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 底部按钮 */}
        <Button type="primary" className="w-full" onClick={handleContactAgent}>
          联系代理专员
        </Button>
      </div>
    </div>
  );
}

import React from 'react';

import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { PATHS } from '@/sites/op7/routes/paths';
import { generatePath } from 'react-router-dom';

type FeatureCardItem = {
  title: string;
  description: string;
  image: string;
  path: string;
  icon: React.ReactNode;
};

const featureCards: FeatureCardItem[] = [
  {
    title: '体育赛事',
    description: '提供足球、篮球、网球、排球等赛事投注和直播',
    image: '/images/common/landing/sport-card2.png',
    path: PATHS.sports,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <g clipPath="url(#clip0_38182_21451)">
          <path
            d="M18 9C18 13.9706 13.9706 18 9 18C4.02942 18 0 13.9706 0 9C0 4.02942 4.02942 0 9 0C13.9706 0 18 4.02942 18 9ZM16.2581 9L16.258 8.98977L15.3121 9.81504L13.0374 7.69206L13.6346 4.63079L14.8794 4.74227C13.9762 3.50056 12.7019 2.56163 11.2247 2.08796L11.7201 3.24704L9 4.75403L6.27993 3.24708L6.77533 2.088C5.30082 2.56079 4.02525 3.4986 3.12057 4.74231L4.37494 4.63079L4.96256 7.69206L2.68795 9.81504L1.74208 8.98977L1.74197 9C1.74197 10.561 2.23178 12.0466 3.13813 13.2819L3.41771 12.0518L6.5074 12.4309L7.82477 15.2553L6.73962 15.9007C8.19856 16.3769 9.79853 16.3779 11.2604 15.9007L10.1752 15.2553L11.4926 12.4309L14.5823 12.0518L14.8619 13.2819C15.7683 12.0466 16.2581 10.561 16.2581 9ZM7.25436 11.5248L6.1695 8.21101L9 6.15963L11.8305 8.21101L10.7555 11.5248H7.25436Z"
            fill="#1A81FF"
          />
        </g>
        <defs>
          <clipPath id="clip0_38182_21451">
            <rect width="18" height="18" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    title: '综合娱乐',
    description: '尽情体验真人娱乐城和老虎机等游戏。',
    image: '/images/common/landing/entertainment-card2.png',
    path: generatePath(PATHS.entertainment, { pageType: 'home', id: '' }),
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <g clipPath="url(#clip0_38182_21459)">
          <path
            d="M8.98526 2.89679e-05C9.15774 0.00431551 9.29222 0.0456636 9.43425 0.133599C9.6993 0.297628 9.93902 0.510848 10.1825 0.700852L11.51 1.73697L13.9348 3.6307C14.3858 3.98265 14.8441 4.32889 15.2865 4.6895C15.7939 5.10309 16.3526 5.64983 16.7425 6.1542C17.3985 7.00266 17.9321 8.17205 17.9915 9.21649C18.0662 10.5297 17.6482 11.921 16.6672 12.9089C15.8701 13.7117 14.7327 14.1483 13.5544 14.2022C12.1908 14.2646 10.874 13.9939 9.84255 13.1438C9.91003 13.3986 9.96996 13.6549 10.0452 13.9079C10.3322 14.871 10.7688 15.8814 11.5862 16.5776C11.847 16.7998 12.1557 16.9237 12.4041 17.1245C12.5266 17.2236 12.6255 17.3472 12.6315 17.5018C12.6362 17.6197 12.5869 17.742 12.4965 17.8269C12.4104 17.908 12.2999 17.9438 12.1807 17.9633C11.8271 18.0211 11.3871 17.9921 11.0256 17.9922L9.01169 17.9918L6.9962 17.9921C6.6308 17.9921 6.21696 18.0215 5.85811 17.9671C5.69466 17.9424 5.54414 17.8853 5.44779 17.7562C5.37358 17.6566 5.34643 17.5339 5.37241 17.4159C5.43461 17.1391 5.79097 16.9744 6.02567 16.8275C7.26167 16.0539 7.87987 14.4168 8.14124 13.1355C7.40989 13.7834 6.36728 14.1015 5.36688 14.1842C4.05561 14.2927 2.76163 14.0408 1.73687 13.2598C0.676221 12.4513 0.146281 11.2313 0.0265315 10.0011C-0.00342115 9.69344 -0.0120815 9.37322 0.0219396 9.06574C0.155088 7.86251 0.813195 6.62443 1.6608 5.7055C1.99485 5.34541 2.35307 5.00446 2.73343 4.68459C3.12095 4.36087 3.53401 4.0569 3.93311 3.74467L6.35137 1.85655L7.78938 0.734325C8.04199 0.537088 8.29169 0.311684 8.56692 0.141552C8.70144 0.0584125 8.8218 0.0129551 8.98526 2.89679e-05Z"
            fill="#1A81FF"
          />
        </g>
        <defs>
          <clipPath id="clip0_38182_21459">
            <rect width="18" height="18" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
];

const FeatureCards: React.FC = () => {
  const navigate = useNavigateWithLanguage();

  return (
    <section className="mt-16px px-12px">
      <div className="grid grid-cols-1 gap-12px lg:grid-cols-2">
        {featureCards.map((item) => (
          <article
            key={item.title}
            className="relative flex min-h-124px cursor-pointer overflow-hidden rounded-12px bg-[var(--Background-300)] px-20px py-18px can-hover:transition-transform can-hover:duration-200 can-hover:ease can-hover:hover:-translate-y-1 lg:min-h-156px lg:px-24px"
            onClick={() => navigate(item.path)}
          >
            <div className="relative z-1 flex  flex-1 flex-col  gap-10px pr-12px mt-28px lg:min-w-[40px] lg:gap-12px">
              <div className="flex items-center gap-10px text-[var(--Text-Main-10)]">
                {item.icon}
                <h3 className="_tf[18] m-0 leading-[1.5] font-600">{item.title}</h3>
              </div>
              <p className="_tf[14] m-0 leading-[1.5] text-[var(--Text-700)]">{item.description}</p>
            </div>
            <div
              className="pointer-events-none  h-120px w-120px  bg-center bg-contain bg-no-repeat lg:right-20px lg:h-118px lg:w-120px"
              style={{ backgroundImage: `url(${item.image})` }}
            />
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;

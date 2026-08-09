import React from 'react';
import HomePartnersSection from '@/sites/op7/components/home/HomePartnersSection';
import HomeGameProvidersSection from '@/sites/op7/components/home/HomeGameProvidersSection';
// import { licenseLogos } from './sponsorLogos';

const Footer: React.FC = () => {
  return (
    <section className="mt-16px rounded-12px bg-transparent">
      <div className="flex flex-col gap-12px lg:gap-20px">
        <HomePartnersSection />

        <HomeGameProvidersSection />

        {/* <div className="flex flex-col gap-12px">
          <div className="flex items-center gap-10px text-[var(--Text-Main-10)]">
            <p className="_tf[14] m-0 font-600 text-[var(--Text-800)]">游戏牌照</p>
          </div>
          <div className="flex gap-8px overflow-x-auto overflow-y-hidden scrollbar-none">
            {licenseLogos.map((item) => (
              <div
                key={item.label}
                className="flex h-40px w-[98px] shrink-0 items-center justify-center rounded-8px bg-[var(--Background-100)] px-10px"
              >
                {item.svgLogo}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-10px text-[var(--Text-800)]">
          <p className="_tf[14] font-600 text-[var(--Text-800)]">关于OP7</p>
          <p className="_tf[12] leading-[1.6]">
            OP7.io 由 mBet Solutions NV 运营，注册地址：Schout Bij Nacht Doormanweg 40, P.O. Box
            4745, Curacao。GCB 是 mBet Solutions N.V. 的许可和监管者，其许可证号
            OGL/2023/110/0072，颁发日期为 2024 年 7 月 22
            日，有效期为一年，部分付款方式由其全资子公司 mProcessing Solutions Ltd, Cyprus
            (Menandrou 4, 1066, Nicosia, Cyprus) 处理。
          </p>
          <p className="_tf[12] leading-[1.6]">
            若要在本网站注册，用户必须接受一般规则与条款。如果一般规则与条款发生更新，现有用户可以选择在上述更新生效之前（即发布后至少两周）停止使用产品和服务。
          </p>
        </div> */}
      </div>
    </section>
  );
};

export default Footer;

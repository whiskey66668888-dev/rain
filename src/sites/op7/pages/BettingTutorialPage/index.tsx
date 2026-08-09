import { Op7LogoSvg } from '@/sites/op7/components/SvgIcons';
import SupportDetailPage from '../HelpCenterPage/Detail';

const BettingTutorialPage = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--Background-700)]">
      <div className="flex items-center gap-12px h-48px px-20px shrink-0  bg-[var(--Background-300)]">
        <Op7LogoSvg className="h-24px text-[var(--ThemeColor-Main)]" />
        <span className="_tf[14] leading-[1.43] font-semibold text-[var(--Text-Main-10)]">
          盘口教程
        </span>
      </div>
      <SupportDetailPage layoutMode="pc-popup" />
    </div>
  );
};

export default BettingTutorialPage;

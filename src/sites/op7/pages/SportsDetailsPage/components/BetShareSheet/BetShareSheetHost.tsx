import BetShareSheet from '.';
import { useBetShareState, closeBetShare } from '../share/betShareStore';

/**
 * 注单分享弹窗宿主：全局挂载一次，由 betShareStore 驱动。
 * 各入口（H5 卡片 / 侧边注单 / PC 注单历史）调 openBetShare 即可弹出。
 */
const BetShareSheetHost: React.FC = () => {
  const { open, order, venueId } = useBetShareState();
  return <BetShareSheet show={open} order={order} venueId={venueId} onClose={closeBetShare} />;
};

export default BetShareSheetHost;

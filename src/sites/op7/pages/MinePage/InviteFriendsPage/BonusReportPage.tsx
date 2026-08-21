import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { requestOpenCustomerService } from '@/core/store/slices/customerServiceUISlice';
import H5Header from '@/sites/op7/components/H5Header';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { NEW_FRIEND_ROUTE_KEY } from './paths';
import styles from './report.module.scss';
import BonusReportPanel from './components/BonusReportPanel';
import { KefuIcon } from '@/sites/op7/pages/MinePage/InviteFriendsPage/components/icons';
import { safeGetLocalString } from '@/utils/storage/webStorage';

function BonusReportPage() {
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const navigate = useNavigateWithLanguage();
  const dispatch = useAppDispatch();
  const { sendToFlutter, isInFlutter } = useFlutterBridge();

  const onBack = () => {
    const prev = safeGetLocalString(NEW_FRIEND_ROUTE_KEY) || '';
    if (isInFlutter()) {
      sendToFlutter(prev);
    }
    navigate(-1);
  };

  return (
    <div className={clsx(styles.reportPage, isMobile && styles.reportPageH5)}>
      <H5Header
        title="奖金报表"
        onBack={onBack}
        right={
          <button
            type="button"
            className="flex items-center justify-center text-[var(--ThemeColor-Main)] rounded-full w-20px h-20px"
            onClick={() => dispatch(requestOpenCustomerService())}
          >
            <KefuIcon className="w-20px h-20px text-[var(--Text-Main-10)]" />
          </button>
        }
      />
      <BonusReportPanel />
    </div>
  );
}

export default BonusReportPage;

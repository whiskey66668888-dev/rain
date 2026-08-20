import { memo, useRef, useCallback, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  shallowEqual,
  useBettingDataSelector,
} from '@/common/hooks/bet/context/BettingDataContext';
import type { TUseVenueBetData } from '@/common/hooks/bet/useVenueBetData';
import useBetMethods from '@/common/hooks/bet/useBetMethods';
import { zIndexMap } from '@/utils/constants/zIndex';
import { BET_FLOATING_BUTTON_Y_KEY } from '@/utils/constants/cacheKey';
import clsx from 'clsx';

const getStoredY = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(BET_FLOATING_BUTTON_Y_KEY);
    if (raw == null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
};

const FloatingButton = () => {
  const { floatingBetCount, showBetDrawer, singleCount, parlayCount, syncSingleParlay, isParlay } =
    useBettingDataSelector(
      (state: TUseVenueBetData) => ({
        floatingBetCount: state.floatingBetCount,
        showBetDrawer: state.showBetDrawer,
        singleCount: state.singleBetData.ids.length,
        parlayCount: state.parlayBetData.ids.length,
        syncSingleParlay: state.syncSingleParlay,
        isParlay: state.isParlay,
      }),
      shallowEqual,
    );
  const { showBetDrawerFn } = useBetMethods();
  const constraintRef = useRef<HTMLDivElement>(null);

  const [initialY] = useState(getStoredY);

  const y = useMotionValue(initialY);

  const handleDragEnd = useCallback(() => {
    try {
      localStorage.setItem(BET_FLOATING_BUTTON_Y_KEY, String(y.get()));
    } catch {}
  }, [y]);

  if ((!singleCount && !parlayCount) || showBetDrawer) return null;

  const showParlayIcon = !syncSingleParlay && isParlay;

  const content = (
    <>
      <div ref={constraintRef} className="fixed inset-0 pointer-events-none" aria-hidden />
      <motion.div
        className={clsx(
          'w-52px h-52px rounded-full bg-[var(--Background-100)] shadow-[0_2px_8px_0_var(--Shadow-400)]',
          'cursor-pointer touch-none select-none',
          'flex items-center justify-center',
          'right-[4px] bottom-[calc(160px+env(safe-area-inset-bottom,0px))]',
        )}
        onClick={showBetDrawerFn}
        drag="y"
        dragConstraints={constraintRef}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        initial={false}
        style={{
          position: 'fixed',
          y,
          zIndex: zIndexMap.betFloatingButton,
        }}
      >
        <div className="w-28px h-28px relative flex items-center justify-center">
          {showParlayIcon ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <path
                d="M26 14C26 7.37258 20.6274 2 14 2C7.37258 2 2 7.37258 2 14C2 20.6274 7.37258 26 14 26V28C6.26801 28 0 21.732 0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28V26C20.6274 26 26 20.6274 26 14Z"
                fill="var(--Text-Main-10)"
              />
              <path
                d="M8.17598 8.35241H13.152V6.81641H14.848V8.35241H19.84V12.8164H14.848V14.0964H20.448V19.0084H14.848V21.6644H13.152V19.0084H7.58398V14.0964H13.152V12.8164H8.17598V8.35241ZM18.16 11.4084V9.76041H14.848V11.4084H18.16ZM13.152 11.4084V9.76041H9.85598V11.4084H13.152ZM18.768 17.6004V15.5044H14.848V17.6004H18.768ZM13.152 17.6004V15.5044H9.26398V17.6004H13.152Z"
                fill="var(--Text-Main-10)"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <g clipPath="url(#clip0_40591_72430)">
                <path
                  d="M22.1663 25.6663H5.83301C4.90475 25.6663 4.01451 25.2976 3.35813 24.6412C2.70176 23.9848 2.33301 23.0946 2.33301 22.1663V3.49967C2.33301 3.19026 2.45592 2.89351 2.67472 2.67472C2.89351 2.45592 3.19026 2.33301 3.49967 2.33301H19.833C20.1424 2.33301 20.4392 2.45592 20.658 2.67472C20.8768 2.89351 20.9997 3.19026 20.9997 3.49967V17.4997H25.6663V22.1663C25.6663 23.0946 25.2976 23.9848 24.6412 24.6412C23.9848 25.2976 23.0946 25.6663 22.1663 25.6663ZM20.9997 19.833V22.1663C20.9997 22.4758 21.1226 22.7725 21.3414 22.9913C21.5602 23.2101 21.8569 23.333 22.1663 23.333C22.4758 23.333 22.7725 23.2101 22.9913 22.9913C23.2101 22.7725 23.333 22.4758 23.333 22.1663V19.833H20.9997ZM18.6663 23.333V4.66634H4.66634V22.1663C4.66634 22.4758 4.78926 22.7725 5.00805 22.9913C5.22684 23.2101 5.52359 23.333 5.83301 23.333H18.6663ZM6.99967 8.16634H16.333V10.4997H6.99967V8.16634ZM6.99967 12.833H16.333V15.1663H6.99967V12.833ZM6.99967 17.4997H12.833V19.833H6.99967V17.4997Z"
                  fill="var(--Text-Main-10)"
                />
              </g>
              <defs>
                <clipPath id="clip0_40591_72430">
                  <rect width="28" height="28" fill="white" />
                </clipPath>
              </defs>
            </svg>
          )}
          {floatingBetCount > 0 && (
            <span
              className={clsx(
                'absolute min-w-16px px-2px h-16px right-[-5px] top-[-6px] bg-[var(--Red-300)] rounded-full',
                'border-1px border-solid border-[var(--Background-100)]',
                'flex items-center justify-center text-10px leading-[1] font-500 din-pro pt-[1px] text-[var(--White-100)]',
              )}
            >
              {floatingBetCount}
            </span>
          )}
        </div>
      </motion.div>
    </>
  );

  return createPortal(content, document.body);
};

export default memo(FloatingButton);

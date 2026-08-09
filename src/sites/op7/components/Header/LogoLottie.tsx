import React, { useEffect, useRef } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

import darkTopLogoData from '@/sites/op7/images/common/lottie/dark_top_logo.json';
import topLogoData from '@/sites/op7/images/common/lottie/top_logo.json';

interface LogoLottieProps {
  className?: string;
  isDark: boolean;
  playKey?: string | number | boolean;
  onClick?: () => void;
}

const LogoLottie: React.FC<LogoLottieProps> = ({ className, isDark, playKey, onClick }) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    lottieRef.current?.goToAndPlay(0, true);
  }, [playKey, isDark]);

  return (
    <button type="button" className={className} onClick={onClick} aria-label="OP7">
      <Lottie
        lottieRef={lottieRef}
        animationData={isDark ? darkTopLogoData : topLogoData}
        autoplay
        loop={false}
        rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
        className="h-full w-full"
      />
    </button>
  );
};

export default LogoLottie;

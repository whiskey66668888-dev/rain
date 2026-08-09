import React, { useMemo } from 'react';
import clsx from 'clsx';
import Overlay from '@/common/components/Overlay';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import { useAppSelector } from '@/core/store/hooks';
import { zIndexMap } from '@/utils/constants/zIndex';
import { LEGAL_CONTENTS, type LegalLinkKey } from './legalContents';

type LegalContentPopupProps = {
  linkKey: LegalLinkKey | null;
  onClose: () => void;
};

/** 章节标题：如 `1. Preamble`；不含 `1.1 ...` */
const isMajorHeading = (line: string) => /^\d+\.\s+\D/.test(line);

/** 小节标题：如 `3.1 Play for fun` */
const isSubHeading = (line: string) => /^\d+\.\d+\s+[A-Za-z]/.test(line) && line.length < 80;

/** Privacy 等无编号小标题 */
const isPlainHeading = (line: string) =>
  /^(Customer Personal Information Protection|Domain-Authenticated SSL)$/.test(line);

const LegalContentPopup: React.FC<LegalContentPopupProps> = ({ linkKey, onClose }) => {
  const isMobile = useAppSelector((state) => state.config.isMobile);
  const content = linkKey ? LEGAL_CONTENTS[linkKey] : null;
  const visible = !!content;

  const lines = useMemo(() => (content?.body ?? '').split('\n'), [content?.body]);

  return (
    <Overlay
      show={visible}
      close={onClose}
      position={isMobile ? 'bottom' : 'center'}
      maskClickClose
      zIndex={zIndexMap.loginModal}
      bodyClassname={clsx(
        'flex min-h-0 flex-col overflow-hidden bg-[var(--Background-300)]',
        isMobile
          ? 'max-h-[85vh] w-full rounded-t-12px'
          : 'max-h-[85vh] w-450px max-w-[90vw] rounded-12px',
      )}
    >
      {content ? (
        <>
          <ModalHeader title={content.title} onClose={onClose} className="lg:px-24px" />
          <div className="min-h-0 flex-1 overflow-y-auto px-16px pb-24px lg:px-24px">
            <div className="_tf[14] leading-20px text-[var(--Text-Main-10)]">
              {lines.map((line, index) => {
                if (!line) {
                  return <div key={index} className="h-20px" />;
                }
                const heading = isMajorHeading(line) || isSubHeading(line) || isPlainHeading(line);
                return (
                  <p key={index} className={clsx('m-0', heading ? 'font-600' : 'font-400')}>
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </Overlay>
  );
};

export default LegalContentPopup;

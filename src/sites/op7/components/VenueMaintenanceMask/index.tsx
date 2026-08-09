import React, { useState } from 'react';

import { ClientOnly } from '@/common/components/ClientOnly';
import LazyImage from '@/common/components/LazyImage';
import Modal from '@/common/components/Modal';
import { HomeListSwitch } from '@/apis/origin/homeList';

interface VenueMaintenanceMaskProps {
  className?: string;
  switch?: HomeListSwitch;
  maintenanceDesc?: string;
}

const VenueMaintenanceMask: React.FC<VenueMaintenanceMaskProps> = ({
  className,
  switch: switchStatus,
  maintenanceDesc,
}) => {
  const trimmedMaintenanceDesc = maintenanceDesc?.trim();
  const hasMaintenanceDesc = Boolean(trimmedMaintenanceDesc);
  const normalizedSwitchStatus = String(switchStatus) as HomeListSwitch;

  const isMaintenance = normalizedSwitchStatus === HomeListSwitch.MAINTENANCE;
  const isExpect = normalizedSwitchStatus === HomeListSwitch.EXPECT;
  const isNormalWithNotice = normalizedSwitchStatus === HomeListSwitch.NORMAL && hasMaintenanceDesc;
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  if (!isMaintenance && !isExpect && !isNormalWithNotice) return null;

  return (
    <ClientOnly>
      <div
        className={className}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {isExpect ? (
          <div className="_tf[12] flex items-center gap-4px px-6px py-3px rounded-50px bg-[var(--Background-300)] text-[var(--Text-Main-10)] whitespace-nowrap">
            <LazyImage
              src="/images/common/maintenance/expect.svg"
              lazy={false}
              width={12}
              height={12}
              className="shrink-0"
            />
            <span>敬请期待</span>
          </div>
        ) : isMaintenance ? (
          <div className="flex flex-col items-start gap-4px">
            <div className="_tf[12] flex items-center gap-4px px-6px py-3px rounded-50px bg-[var(--Background-300)] text-[var(--Text-Main-10)] whitespace-nowrap">
              <LazyImage
                src="/images/common/maintenance/maintenance.svg"
                lazy={false}
                width={12}
                height={12}
                className="shrink-0"
              />
              <span>场馆升级中</span>
            </div>
            {hasMaintenanceDesc && (
              <div className="_tf[12] leading-none flex items-center gap-4px text-[var(--Text-Main-10)] whitespace-nowrap [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
                <LazyImage
                  src="/images/common/maintenance/time.svg"
                  lazy={false}
                  width={10}
                  height={10}
                  className="shrink-0"
                />
                <span className="text-[#fff]">{trimmedMaintenanceDesc}</span>
              </div>
            )}
          </div>
        ) : (
          <div
            data-maintenance-interactive="true"
            className="_tf[12] flex items-center gap-4px px-6px py-3px rounded-50px bg-[var(--Background-300)] text-[var(--Text-Main-10)] whitespace-nowrap"
            onClick={(event) => {
              event.stopPropagation();
              setShowNoticeModal(true);
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <LazyImage
              src="/images/common/maintenance/notice.svg"
              lazy={false}
              width={12}
              height={12}
              className="shrink-0"
            />
            <span>{`${trimmedMaintenanceDesc}`}</span>
          </div>
        )}
        <Modal
          show={showNoticeModal}
          onClose={() => setShowNoticeModal(false)}
          title="维护公告"
          showCloseButton={false}
          confirmText="我知道了"
          onConfirm={() => setShowNoticeModal(false)}
        >
          <div className="py-10px text-center _tf[14] text-[var(--Text-900)]">
            {trimmedMaintenanceDesc}
          </div>
        </Modal>
      </div>
    </ClientOnly>
  );
};

export default VenueMaintenanceMask;

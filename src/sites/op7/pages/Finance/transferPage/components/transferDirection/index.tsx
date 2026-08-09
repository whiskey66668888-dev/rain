import React from 'react';

import TransferDirectionMobile from './mobile';
import TransferDirectionWeb from './web';
import { TransferDirection } from '../../../constants';

interface TransferDirectionProps {
  transferOutAccountName: string;
  transferInAccountName: string;
  transferDirection: TransferDirection;
  showAccountPicker: (val: boolean) => void;
  changeTransferDirection: () => void;
  inModal?: boolean;
}

const TransferDirectionView: React.FC<TransferDirectionProps> = ({
  transferOutAccountName,
  transferInAccountName,
  transferDirection,
  showAccountPicker,
  changeTransferDirection,
  inModal = false,
}) => {
  return (
    <>
      <TransferDirectionMobile
        transferOutAccountName={transferOutAccountName}
        transferInAccountName={transferInAccountName}
        transferDirection={transferDirection}
        showAccountPicker={showAccountPicker}
        changeTransferDirection={changeTransferDirection}
        inModal={inModal}
      />
      <TransferDirectionWeb
        transferOutAccountName={transferOutAccountName}
        transferInAccountName={transferInAccountName}
        transferDirection={transferDirection}
        showAccountPicker={showAccountPicker}
        changeTransferDirection={changeTransferDirection}
        inModal={inModal}
      />
    </>
  );
};

export default TransferDirectionView;

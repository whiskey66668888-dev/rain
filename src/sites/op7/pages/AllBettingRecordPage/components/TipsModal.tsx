import Button from '@/common/components/Button';
import Overlay from '@/common/components/Overlay';
import clsx from 'clsx';

export enum TipsModalType {
  /** 取款有效流水 */
  WITHDRAW_VALID_FLOW = '1',
  /** 优惠有效流水 */
  BONUS_VALID_FLOW = '2',
}

export interface TipsModalProps {
  show: boolean;
  onClose: () => void;
  type?: TipsModalType;
}

const TipsModal = ({ show, onClose, type }: TipsModalProps) => {
  const isWithdraw = type === TipsModalType.WITHDRAW_VALID_FLOW;

  const content = isWithdraw ? (
    <div className="text-[14px] text-[var(--Text-Main-10)] leading-[1.6]">
      <div className="text-[16px] font-bold mb-[8px] text-center">取款有效流水说明</div>
      <div className="font-bold mb-[4px]">「体育/电竞」</div>
      <ul className="list-none">
        <li className="relative pl-[12px] mb-[8px]">
          <span className="absolute left-0">•</span>
          注单未结算时：注单的赔率大于等于欧洲盘1.7/香港盘0.7的情况下，按照注单投注的本金来计算；
        </li>
        <li className="relative pl-[12px] mb-[8px]">
          <span className="absolute left-0">•</span>
          注单结算后：按照优惠流水计算。
        </li>
      </ul>
      <div className="font-bold mb-[4px]">「真人/电子/棋牌/彩票」</div>
      <ul className="list-none">
        <li className="relative pl-[12px] mb-0">
          <span className="absolute left-0">•</span>
          不同的场馆计算规则不同，依据场馆方的计算规则。
        </li>
      </ul>
    </div>
  ) : (
    <div className="text-[14px] text-[var(--Text-Main-10)] leading-[1.6]">
      <div className="font-bold mb-[8px] text-center">优惠流水说明</div>
      <div className="font-bold mb-[8px]">「体育/电竞」</div>
      <div className="relative pl-[12px] mb-[8px]">
        <span className="absolute left-[-5px]">•</span>
      </div>
      <ul className="list-none">
        <li className="relative pl-[12px] mb-[8px]">
          <span className="absolute left-[-5px]">1.</span>
          全赢：按照盈利金额，但不可大于本金；
        </li>
        <li className="relative pl-[12px] mb-[8px]">
          <span className="absolute left-[-5px]">2.</span>
          赢半：按照盈利金额，但不可大于本金的一半；
        </li>
        <li className="relative pl-[12px] mb-[8px]">
          <span className="absolute left-[-5px]">3.</span>
          输或输半：按照净输金额；
        </li>
        <li className="relative pl-[12px] mb-[8px]">
          <span className="absolute left-[-5px]">4.</span>
          和局等其他不产生输赢的注单，不计算有效流水；
        </li>
      </ul>
      {/* <div className="relative pl-[12px] mb-[8px]">
        <span className="absolute left-0">•</span>
        预约投注：预约注单不计算优惠有效流水，任何走盘、取消的赛事、对押等（包括串关和单双）投注，赔率低于欧洲盘1.70、香港盘0.70的投注将不计算在有效流水内（只计输赢）。
      </div> */}
      <div className="font-bold mt-[12px] mb-[8px]">「真人/电子/棋牌/彩票」</div>
      <ul className="list-none">
        <li className="relative pl-[12px] mb-[8px]">
          <span className="absolute left-[-5px]">•</span>
          不同的场馆计算规则不同，依据场馆方的计算规则。
        </li>
        {/* <li className="relative pl-[12px] mb-[8px]">
          <span className="absolute left-[-5px]">•</span>
          彩票投注不计入优惠有效流水；
        </li>
        <li className="relative pl-[12px] mb-0">
          <span className="absolute left-[-5px]">•</span>
          其他未列情形以客服解释为准。
        </li> */}
      </ul>
    </div>
  );

  return (
    <Overlay
      show={show}
      close={onClose}
      position="center"
      bodyClassname={clsx(
        'bg-[var(--Background-300)] rounded-12px py-12px',
        'flex flex-col gap-24px overflow-hidden',
        'w-[80%] lg:w-450px',
      )}
      bodyStyle={{
        maxHeight: '90%',
      }}
    >
      <div className="flex-1 overflow-y-auto pl-18px pr-12px">{content}</div>
      <div className="px-12px">
        <Button type="primary" onClick={onClose} className="w-full">
          确认
        </Button>
      </div>
    </Overlay>
  );
};

export default TipsModal;

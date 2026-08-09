import clsx from 'clsx';
import {
  TWithdrawProgressNode,
  TProgressNodeState,
} from '@/apis/origin/transactionRecord/withdrawDetail';
import LazyImage from '@/common/components/LazyImage';
import style from './WithdrawDetailModal.module.scss';

/* ─── 节点图标 ─── */
const NodeIcon = ({ state }: { state: TProgressNodeState }) => {
  if (state === 'done') {
    return (
      <div className="w-14px h-14px flex items-center justify-center">
        <div className="w-9px h-9px rounded-full bg-[var(--ThemeColor-Main)]" />
      </div>
    );
  }
  if (state === 'active') {
    return (
      <div className="w-14px h-14px flex items-center justify-center">
        <LazyImage src="/images/common/transactionRecord/done_icon.svg" alt="Done" />
      </div>
    );
  }
  return (
    <div className="w-14px h-14px flex items-center justify-center">
      <div className="w-9px h-9px rounded-full bg-[var(--ThemeColor-80)]" />
    </div>
  );
};

/* ─── 高亮时间词 ─── */
function formatHint(text: string): string {
  return text.replace(
    /(预计|通常)(\d+[–—-]\d+\s*分钟|\d+\s*分钟)(内)/g,
    '<span class="highlight">$1$2$3</span>',
  );
}

interface WithdrawProgressTimelineProps {
  memberTransfer?: boolean;
  nodes: TWithdrawProgressNode[];
  /** 是否显示「取消提现」入口 */
  showCancel?: boolean;
  onCancelClick?: () => void;
}

export const WithdrawProgressTimeline = ({
  memberTransfer = false,
  nodes,
  showCancel = false,
  onCancelClick,
}: WithdrawProgressTimelineProps) => (
  <div className={style.timeline}>
    <div className={style.timelineList}>
      {nodes.map((node, idx) => (
        <div
          key={node.code ?? idx}
          className={clsx(
            style.timelineItem,
            node.state === 'done' && style.stateDone,
            node.state === 'active' && style.stateActive,
            node.state === 'wait' && style.stateWait,
          )}
        >
          <NodeIcon state={node.state} />
          <div className={style.timelineContent}>
            <div className={clsx(style.timelineTitle, 'flex justify-between items-center')}>
              <div>{node.title}</div>
              {showCancel && node.state === 'active' && (
                <div
                  className="color-[var(--ThemeColor-Main)] cursor-pointer _tf[14]"
                  onClick={onCancelClick}
                >
                  {memberTransfer ? '取消互转' : '取消提现'}
                </div>
              )}
            </div>
            {node.completedTime && <span className={style.timelineTime}>{node.completedTime}</span>}
            {node.hint && (
              <span
                className={style.timelineHint}
                dangerouslySetInnerHTML={{ __html: formatHint(node.hint) }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
    <div className={style.lineImg} />
  </div>
);

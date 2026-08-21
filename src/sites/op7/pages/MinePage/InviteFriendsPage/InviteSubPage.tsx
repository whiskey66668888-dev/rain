import clsx from 'clsx';
import { Collapse, DotLoading, Popover } from 'antd-mobile';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';

import Overlay from '@/common/components/Overlay';
import ModalHeader from '@/sites/op7/components/ModalHeader';
import H5Header from '@/sites/op7/components/H5Header';
import { toast } from '@/common/components/Toast';
import { useNavigateWithLanguage } from '@/common/hooks/useNavigateWithLanguage';
import { useInviteFriendsNavigate } from './useInviteFriendsNavigate';
import { handleContent } from '@/utils/format/handleContent';

import {
  getInvitationDataDSummary,
  getInviterInfo,
  getTotalRevenueDetails,
  getCycle,
  upVip,
} from '@/apis/origin/inviteFriends';
import useFlutterBridge from '@/sites/op7/hooks/useFlutterBridge';
import { NEW_FRIEND_ROUTE_KEY } from './paths';
import MyTitle from './components/MyTitle';
import MyTable from './components/MyTable';
import DownloadInviteModal from './components/DownloadInviteModal';
import ActivationInviteModal from './components/ActivationInviteModal';
import {
  ArrowdownIcon,
  ArrowRightIcon,
  CopyIcon,
  FsbbIcon,
  InviteCodeHelpIcon,
  JjbbIcon,
  LinkIcon,
  QuwstionIcon,
  ScanIcon,
  ZsllIcon,
} from './components/icons';
import { safeSetLocalString } from '@/utils/storage/webStorage';
import styles from './invite.module.scss';
import { toDisplayString } from './stringUtils';
import registerDark from '@/sites/op7/images/dark/inviteFriends/register.png';
import registerLight from '@/sites/op7/images/light/inviteFriends/register.png';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { requestOpenCustomerService } from '@/core/store/slices/customerServiceUISlice';
import { getSystemTheme } from '@/utils';
import { PATHS } from '@/sites/op7/routes/paths';
import { CloseSvg } from '@/sites/op7/components/SvgIcons';
import InvitationReportPanel from './components/InvitationReportPanel';
import BonusReportPanel from './components/BonusReportPanel';
import RebateReportPanel from './components/RebateReportPanel';
import HistoryReportPanel from './components/HistoryReportPanel';
import reportStyles from './report.module.scss';
import { useInviteModal } from '@common/hooks/useInviteModal';

function asRecord(d: unknown): Record<string, unknown> {
  return d && typeof d === 'object' ? (d as Record<string, unknown>) : {};
}

function displayScalar(v: unknown): string {
  const s = toDisplayString(v, '0');
  return s === '' ? '0' : s;
}

export type InviteSubPageProps = {
  /** 首页 PC「分享邀请码」弹窗内嵌时隐藏 H5Header，由外层 ModalHeader 关闭 */
  embedded?: boolean;
};

const faqList = [
  {
    title: '邀请系统如何运作？',
    content: (
      <>
        好友使用邀请人的专属邀请链接或二维码注册，在注册页面填写邀请人的专属邀请码，好友完成注册后，邀请人可以在呼朋唤友优惠活动页面查询受邀好友注册情况。如好友下载APP进行注册，请注意在注册页
        填写邀请人的专属邀请码。
      </>
    ),
  },
  {
    title: '自己的邀请码在哪？',
    content: (
      <>
        个人中心：进入个人中心——个人资料——获取邀请码与专属邀请链接。
        <br />
        优惠页面：进入平台首页——优惠列表——呼朋唤友活动页面，点击【分享邀请码】获取。
      </>
    ),
  },
  {
    title: '自己的奖励在哪里查看？',
    content: <>进入优惠列表——呼朋唤友——点击【分享邀请码】——在【我的邀请】处查看【奖金报表】。</>,
  },
  {
    title: '奖励多久结算？',
    content: (
      <>
        【邀请礼金】
        <br />
        受邀人注册后完成首笔存款，邀请人于活动页面手动领取奖励，领取有效期3个月。
        <br />
        【累计奖励/返水奖励】
        <br />
        活动按周期计算，每月发放3次，10天为一个周期：
        <br />
        第一次：仅计算注册时间在每月上旬（1-10号），且达标有效条件的好友，奖励将在13号前结算并开放领取；
        <br />
        第二次：仅计算注册时间在每月中旬（11-20号），且达标有效条件的好友，奖励将在23号前结算并开放领取；
        <br />
        第三次：仅计算注册时间在每月下旬（21-月尾）且达标有效条件的好友，奖励将在次月3号前结算并开放领取。
        <br />
        <br />
        【好友升级】
        <br />
        邀请人手动填写有效受邀人的账号，平台发起直升特权申请，审核通过后立即生效。
      </>
    ),
  },
  {
    title: '好友直升是什么？',
    content: (
      <>
        邀请人可以为有效受邀人好友申请直升VIP等级特权奖励，直升等级与您的等级相同，最高可直升至VIP5，每个有效受邀人可享一次直升特权。
      </>
    ),
  },
];

function InviteSubPage({ embedded = false }: InviteSubPageProps) {
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const isDark = useMemo(() => {
    return theme === 'dark';
  }, [theme]);
  const { openInviteModal } = useInviteModal();
  const dispatch = useAppDispatch();
  const screenBreakpoint = useAppSelector((state) => state.config.screenBreakpoint);
  const isMobile = screenBreakpoint === 'md';
  const navigate = useNavigateWithLanguage();
  const navigateInviteFriends = useInviteFriendsNavigate();
  const { sendToFlutter, isInFlutter } = useFlutterBridge();
  const [helpVisible, setHelpVisible] = useState(false);
  const [friendAccount, setFriendAccount] = useState('');
  const [popShow, setPopShow] = useState(false);
  const [activeShow, setActiveShow] = useState(false);
  const [invitationReportPop, setInvitationReportPop] = useState(false);
  const [bonusReportPop, setBonusReportPop] = useState(false);
  const [rebateReportPop, setRebateReportPop] = useState(false);
  const [historyReportPop, setHistoryReportPop] = useState(false);

  const { data: invitationDataDSummary } = useRequest(async () => {
    const res = await getInvitationDataDSummary();
    return asRecord(res?.data);
  });

  const { data: inviterInfo } = useRequest(async () => {
    const res = await getInviterInfo();
    return asRecord(res?.data);
  });

  const { data: totalRevenueDetails } = useRequest(async () => {
    const res = await getTotalRevenueDetails();
    return asRecord(res?.data);
  });

  const { data: cycle } = useRequest(async () => {
    const res = await getCycle();
    return asRecord(res?.data);
  });

  const { loading, run } = useRequest(upVip, {
    manual: true,
    onSuccess: () => {
      toast({ type: 'success', description: '申请成功' });
    },
  });

  useEffect(() => {
    safeSetLocalString(NEW_FRIEND_ROUTE_KEY, 'invite');
  }, []);

  const summary = invitationDataDSummary ?? {};
  const safeInviterInfo = inviterInfo ?? {};

  const tableRows = [
    {
      label: '邀请有礼',
      value: displayScalar(summary.numberInvitedGuests),
      popOverDesc:
        '每位通过邀请人专属链接或二维码注册的受邀人，注册后当期内完成首笔存款达到对应档位。',
    },
    {
      label: '累计奖励',
      value: displayScalar(summary.cumulativeNumberRewards),
      popOverDesc: '受邀人周期内累计存款≥500元。',
    },
    {
      label: '好友升级',
      value: displayScalar(summary.numberFriendsUpgraded),
      popOverDesc: '受邀人体育/棋牌/电竞/真人/电子任意类型有效流水≥3888（不包含不计算返水的游戏）',
    },
    {
      label: '返水奖励',
      value: displayScalar(summary.rebateRewardNumber),
      popOverDesc: '受邀人体育/棋牌/电竞/真人/电子任意类型有效流水≥3888（不包含不计算返水的游戏）',
    },
  ];

  const formatCyclePeriod = (beginDate: unknown, endDate: unknown) => {
    if (!beginDate || !endDate) return '1-10号';
    const beginDay = dayjs(toDisplayString(beginDate, '0')).format('D');
    const endDay = dayjs(toDisplayString(endDate, '0')).format('D');
    return `${beginDay}-${endDay}号`;
  };

  const handleApplyUpgrade = () => {
    if (!friendAccount.trim()) {
      toast({ type: 'warning', description: '请输入好友账号' });
      return;
    }
    run({ loginName: friendAccount.trim() });
  };

  const copyStr = (text: string, emptyMsg: string) => {
    if (!text) {
      toast({ type: 'info', description: emptyMsg });
      return;
    }
    void navigator.clipboard.writeText(text);
    toast({ type: 'success', description: '复制成功' });
  };

  const goBonusReport = () => {
    if (isInFlutter()) {
      sendToFlutter('bonusReport');
    }
    if (isMobile) {
      navigateInviteFriends(PATHS.mineInviteFriendsBonusReport);
      return;
    }
    setBonusReportPop(true);
  };

  const goRebateReport = () => {
    if (isInFlutter()) {
      sendToFlutter('rebateReport');
    }
    if (isMobile) {
      navigateInviteFriends(PATHS.mineInviteFriendsRebateReport);
      return;
    }
    setRebateReportPop(true);
  };

  const goInvitationReport = () => {
    if (isInFlutter()) {
      sendToFlutter('InvitationReport');
    }
    if (isMobile) {
      navigateInviteFriends(PATHS.mineInviteFriendsInvitationReport);
      return;
    }
    setInvitationReportPop(true);
  };

  const goHistoryReport = () => {
    if (isInFlutter()) {
      sendToFlutter('historyReport');
    }
    if (isMobile) {
      navigateInviteFriends(PATHS.mineInviteFriendsHistoryReport);
      return;
    }
    setHistoryReportPop(true);
  };

  const onBack = () => {
    if (isInFlutter()) {
      sendToFlutter('newFriend');
    }
    navigate(-1);
  };

  return (
    <div className={styles.invitePage}>
      {!embedded && <H5Header title="邀请好友" onBack={onBack} />}

      <div className={styles.main}>
        <MyTitle leftContent="邀请信息" />
        <div className={clsx(styles.commonBlock, styles.inviteInfo)}>
          <div className={styles.inviteInfoItem}>
            <span className={styles.label}>
              邀请码
              <InviteCodeHelpIcon
                style={{ cursor: 'pointer' }}
                onClick={() => setHelpVisible(true)}
              />
            </span>
            {safeInviterInfo.advCode === '######' ? (
              <button type="button" className={styles.activeBtn} onClick={() => openInviteModal()}>
                激活
              </button>
            ) : safeInviterInfo.advCode === '已失效' ? (
              <span className={styles.disValue}>已失效</span>
            ) : (
              <>
                <span className={styles.value}>{toDisplayString(safeInviterInfo.advCode)}</span>
                {safeInviterInfo.advCode ? (
                  <button
                    type="button"
                    className={styles.copy}
                    onClick={() => copyStr(String(safeInviterInfo.advCode), '暂无邀请码')}
                  >
                    <CopyIcon />
                  </button>
                ) : null}
              </>
            )}
          </div>
          <div className={styles.inviteInfoItem}>
            <span className={styles.label}>邀请链接</span>
            {safeInviterInfo.advCode === '######' ? (
              <button type="button" className={styles.activeBtn} onClick={() => openInviteModal()}>
                激活
              </button>
            ) : safeInviterInfo.advCode === '已失效' ? (
              <span className={styles.disValue}>已失效</span>
            ) : (
              <>
                <span className={styles.value}>{toDisplayString(safeInviterInfo.advUrl)}</span>
                {safeInviterInfo.advUrl ? (
                  <button
                    type="button"
                    className={styles.copy}
                    onClick={() => copyStr(String(safeInviterInfo.advUrl), '')}
                  >
                    <CopyIcon />
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>

        <MyTitle leftContent="邀请方式" />
        <div className={styles.commonBlock}>
          <button
            type="button"
            className={styles.inviteWay}
            onClick={() => {
              if (safeInviterInfo.advCode === '######') {
                // setActiveShow(true);
                openInviteModal();
              } else {
                setPopShow(true);
              }
            }}
          >
            <div className={styles.inviteWayItem}>
              <ScanIcon />
              <span>二维码</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.inviteWayItem}>
              <LinkIcon className={styles.linkIcon} />
              <span>邀请链接</span>
            </div>
          </button>
        </div>

        <MyTitle
          leftContent="我的邀请"
          rightContent={
            <div
              // className={clsx(styles.commendationRight, styles.dot)}
              className={clsx(styles.commendationRight)}
              onClick={goBonusReport}
            >
              <JjbbIcon className={styles.receiveIcon} />
              <span>奖金报表</span>
            </div>
          }
        />
        <div className={clsx(styles.myInvite, styles.commonBlock)}>
          <div className={styles.myInviteTop}>
            <button type="button" className={styles.topLeft} onClick={goInvitationReport}>
              <div className={styles.people}>{displayScalar(summary.totalNumberInvitations)}</div>
              <div className={styles.peopleText}>
                邀请总人数
                <ArrowRightIcon />
              </div>
            </button>
            <div className={styles.topRight}>
              <div className={styles.reward}>
                {displayScalar(summary.totalIncomePreviousPeriod)}
              </div>
              <div className={styles.rewardText}>
                上周期总收益
                <Popover
                  className={styles.popOverMain}
                  content={
                    <div className={styles.popOverContent}>
                      <div className={styles.popOverTitle}>条件</div>
                      <div className={styles.popOverTips}>
                        周期区间：
                        {cycle && asRecord(cycle).previousCycle
                          ? formatCyclePeriod(
                              asRecord(asRecord(cycle).previousCycle).begin,
                              asRecord(asRecord(cycle).previousCycle).end,
                            )
                          : ''}
                      </div>
                      <div className={styles.popOverList}>
                        <div className={styles.popOverItem}>
                          <span>邀请礼金：</span>
                          <span>
                            {displayScalar(asRecord(totalRevenueDetails).friendsRewards)}(元)
                          </span>
                        </div>
                        <div className={styles.popOverItem}>
                          <span>累计奖励：</span>
                          <span>
                            {displayScalar(asRecord(totalRevenueDetails).accumulatedRewards)}(元)
                          </span>
                        </div>
                        <div className={styles.popOverItem}>
                          <span>体育返水：</span>
                          <span>{displayScalar(asRecord(totalRevenueDetails).tyBonus)}(元)</span>
                        </div>
                        <div className={styles.popOverItem}>
                          <span>电竞返水：</span>
                          <span>{displayScalar(asRecord(totalRevenueDetails).djBonus)}(元)</span>
                        </div>
                        <div className={styles.popOverItem}>
                          <span>真人返水：</span>
                          <span>{displayScalar(asRecord(totalRevenueDetails).zrBonus)}(元)</span>
                        </div>
                        <div className={styles.popOverItem}>
                          <span>电子返水：</span>
                          <span>{displayScalar(asRecord(totalRevenueDetails).dzBonus)}(元)</span>
                        </div>
                        <div className={styles.popOverItem}>
                          <span>棋牌返水：</span>
                          <span>{displayScalar(asRecord(totalRevenueDetails).qpBonus)}(元)</span>
                        </div>
                      </div>
                    </div>
                  }
                  placement="bottom"
                  trigger="click"
                >
                  <span>
                    <QuwstionIcon />
                  </span>
                </Popover>
              </div>
            </div>
          </div>
          <div className={styles.tableBox}>
            <div className={styles.tableTitle}>
              <div className={styles.tableTitleItem}>活动名称</div>
              <div className={styles.tableTitleItem}>有效受邀人</div>
            </div>
            <div className={styles.tableContent}>
              {tableRows.map((item, idx) => (
                <div className={styles.tableContentItem} key={idx}>
                  <div className={styles.itemLabel}>
                    {item.label}
                    <Popover
                      className={styles.popOverMain}
                      content={
                        <div className={styles.popOverContent}>
                          <div className={styles.popOverTitle}>条件</div>
                          <div
                            className={styles.popOverDesc}
                            dangerouslySetInnerHTML={{
                              __html: handleContent(item.popOverDesc),
                            }}
                          />
                        </div>
                      }
                      placement="bottom"
                      trigger="click"
                    >
                      <span>
                        <QuwstionIcon />
                      </span>
                    </Popover>
                  </div>
                  <div className={styles.itemValue}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <MyTitle
          leftContent={
            <div className={styles.commendationLeft}>
              <span>{toDisplayString(safeInviterInfo.groupName)}</span>专属优惠
            </div>
          }
          rightContent={
            <div className={clsx(styles.commendationRight)} onClick={goRebateReport}>
              <FsbbIcon className={styles.coinIcon} />
              <span>返水报表</span>
            </div>
          }
        />
        <MyTable
          columns={[
            { title: '优惠名称', dataIndex: 'label', cellClassName: styles.cell1 },
            { title: '返水比例', dataIndex: 'value', cellClassName: styles.cell2 },
          ]}
          dataSource={[
            { label: '体育', value: '10%' },
            { label: '电竞', value: '10%' },
            { label: '棋牌', value: '8%' },
            { label: '真人', value: '8%' },
            { label: '电子', value: '8%' },
          ]}
          collapsedRows={10}
          expandText="查看更多"
          collapseText="收起"
        />

        <MyTitle
          leftContent={
            <div className={styles.commendationLeft}>
              <span>{toDisplayString(safeInviterInfo.groupName)}</span>好友直升
            </div>
          }
          rightContent={
            <div className={clsx(styles.commendationRight)} onClick={goHistoryReport}>
              <ZsllIcon className={styles.timeIcon} />
              <span>直升历史</span>
            </div>
          }
        />
        <div className={styles.friendUpgrade}>
          <div className={styles.upgradeLabel}>好友账号</div>
          <input
            type="text"
            placeholder="输入您邀请好友的会员账号"
            value={friendAccount}
            onChange={(e) => setFriendAccount(e.target.value)}
          />
          {!!friendAccount && (
            <button
              type="button"
              className="flex h-20px w-20px items-center justify-center border-none p-0 bg-[var(--Line-100)] rounded-full"
              aria-label="关闭"
              onClick={() => setFriendAccount('')}
            >
              <CloseSvg className="w-8px h-8px text-[var(--Text-Main-10)]" />
            </button>
          )}
          <button
            type="button"
            className={clsx(styles.upgradeBtn, loading && styles.loadingBtn)}
            disabled={loading}
            onClick={handleApplyUpgrade}
          >
            {loading ? <DotLoading color="var(--White-100)" /> : '立即申请'}
          </button>
        </div>

        <MyTitle leftContent="常见问题" />
        <Collapse
          accordion
          className={styles.myCollapse}
          arrow={(active) => (
            <ArrowdownIcon
              className={styles.arrowdown}
              style={{ transform: active ? 'rotate(180deg)' : 'none' }}
            />
          )}
        >
          {faqList.map((item, idx) => (
            <Collapse.Panel key={`faq-${idx}`} title={item.title}>
              <div className={styles.faqBody}>{item.content}</div>
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>

      <Overlay
        show={bonusReportPop}
        close={() => setBonusReportPop(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden bg-[var(--Background-400)] rounded-t-12px safe-b min-h-[32vh] max-h-[85vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <ModalHeader
          title="奖金报表"
          className="bg-[var(--Background-300)]"
          right={
            <div className="flex items-center justify-end gap-8px">
              <button
                type="button"
                className="flex items-center justify-center border-none bg-none p-0 w-20px h-20px"
                aria-label="关闭"
                onClick={() => setBonusReportPop(false)}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
            </div>
          }
        />
        <div
          className={clsx(
            'min-h-0 flex-1 overflow-y-auto',
            reportStyles.reportPage,
            isMobile && reportStyles.reportPageH5,
          )}
        >
          <BonusReportPanel isPc={!isMobile} />
        </div>
      </Overlay>

      <Overlay
        show={invitationReportPop}
        close={() => setInvitationReportPop(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden bg-[var(--Background-400)] rounded-t-12px safe-b max-h-[85vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <ModalHeader
          title="好友邀请记录"
          className="bg-[var(--Background-300)]"
          right={
            <div className="flex items-center justify-end gap-12px">
              {isMobile && (
                <button
                  type="button"
                  className="_tf[12] border-none bg-transparent p-0 text-[var(--ThemeColor-Main)]"
                  onClick={() => dispatch(requestOpenCustomerService())}
                >
                  客服
                </button>
              )}
              <button
                type="button"
                className="flex items-center justify-center border-none bg-none p-0 w-20px h-20px"
                aria-label="关闭"
                onClick={() => setInvitationReportPop(false)}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
            </div>
          }
        />
        <div
          className={clsx(
            'min-h-0 flex-1 overflow-y-auto',
            reportStyles.reportPage,
            isMobile && reportStyles.reportPageH5,
          )}
        >
          <InvitationReportPanel isPc={!isMobile} />
        </div>
      </Overlay>

      <Overlay
        show={rebateReportPop}
        close={() => setRebateReportPop(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden bg-[var(--Background-400)] rounded-t-12px safe-b min-h-[32vh] max-h-[85vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <ModalHeader
          title="返水报表"
          className="bg-[var(--Background-300)]"
          right={
            <div className="flex items-center justify-end gap-8px">
              <button
                type="button"
                className="flex items-center justify-center border-none bg-none p-0 w-20px h-20px"
                aria-label="关闭"
                onClick={() => setRebateReportPop(false)}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
            </div>
          }
        />
        <div
          className={clsx(
            'min-h-0 flex-1 overflow-y-auto',
            reportStyles.reportPage,
            isMobile && reportStyles.reportPageH5,
          )}
        >
          <RebateReportPanel isPc={!isMobile} />
        </div>
      </Overlay>

      <Overlay
        show={historyReportPop}
        close={() => setHistoryReportPop(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden bg-[var(--Background-400)] rounded-t-12px safe-b min-h-[32vh] max-h-[85vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <ModalHeader
          title="直升历史"
          className="bg-[var(--Background-300)]"
          right={
            <div className="flex items-center justify-end gap-12px">
              {isMobile && (
                <button
                  type="button"
                  className="_tf[12] border-none bg-transparent p-0 text-[var(--ThemeColor-Main)]"
                  onClick={() => dispatch(requestOpenCustomerService())}
                >
                  客服
                </button>
              )}
              <button
                type="button"
                className="flex items-center justify-center border-none bg-none p-0 w-20px h-20px"
                aria-label="关闭"
                onClick={() => setHistoryReportPop(false)}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
            </div>
          }
        />
        <div
          className={clsx(
            'min-h-0 flex-1 overflow-y-auto',
            reportStyles.reportPage,
            isMobile && reportStyles.reportPageH5,
          )}
        >
          <HistoryReportPanel isPc={!isMobile} />
        </div>
      </Overlay>

      <Overlay
        show={helpVisible}
        close={() => setHelpVisible(false)}
        position="center"
        bodyClassname="flex flex-col items-center bg-[var(--Background-400)] rounded-12px w-320px"
      >
        <ModalHeader
          className="w-full bg-[var(--Background-300)]"
          title="邀请码教程"
          onClose={() => setHelpVisible(false)}
          right={
            <div className="flex items-center justify-end gap-8px">
              <button
                type="button"
                className="flex items-center justify-center border-none bg-none p-0 w-20px h-20px"
                aria-label="关闭"
                onClick={() => setHelpVisible(false)}
              >
                <CloseSvg className="text-[var(--Text-Main-10)]" />
              </button>
            </div>
          }
        />
        <img src={isDark ? registerDark : registerLight} alt="" className={styles.registerImg} />
      </Overlay>

      <Overlay
        show={popShow}
        close={() => setPopShow(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden rounded-t-12px safe-b max-h-[90vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <DownloadInviteModal onClose={() => setPopShow(false)} />
      </Overlay>

      <Overlay
        show={activeShow}
        close={() => setActiveShow(false)}
        position={isMobile ? 'bottom' : 'center'}
        bodyClassname={clsx(
          'flex flex-col overflow-hidden bg-[var(--Background-400)] rounded-t-12px safe-b max-h-[90vh]',
          !isMobile && 'w-450px rounded-b-12px',
        )}
      >
        <ModalHeader
          title="首充开启邀请特权"
          className="bg-[var(--Background-300)]"
          onClose={() => setActiveShow(false)}
        />
        <ActivationInviteModal onClose={() => setActiveShow(false)} />
      </Overlay>
    </div>
  );
}

export default InviteSubPage;

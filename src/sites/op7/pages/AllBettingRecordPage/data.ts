import { TTotalListRes } from '@/apis/origin/allBettingRecord/totalList';
import { bigNB } from '@/utils/bet/bigMath';

export interface TGameCategoryItem {
  /** 投注金额 */
  betAmount: string;
  /** 取款流水 */
  validAmount: string;
  /** 有效优惠 */
  bonusAmount: string;
  /** 输赢金额 */
  netAmount: string;
  /** 输赢金额className */
  netAmountClassName: string;
  /** 总投注单数 */
  betCount: number;
  /** 游戏名称 */
  gameName: string;
  /** 游戏大类 */
  gameBigType: string;
  /** 游戏图标 */
  gameIcon: string;
  /** 图标阴影 */
  shadowColor: string;
  /** 无数据文案 */
  noDataText: string;
  /** 游戏列表 */
  childList: TTotalListRes['list'];
}

export const gameList: TGameCategoryItem[] = [
  {
    betAmount: '0.00',
    validAmount: '0.00',
    bonusAmount: '0.00',
    netAmount: '0.00',
    netAmountClassName: '',
    betCount: 0,
    gameName: '体育',
    gameBigType: '2',
    childList: [],
    gameIcon: '/images/common/allBettingRecord/sport_icon.png',
    shadowColor: 'rgba(51, 153, 255, 0.10)',
    noDataText: '去体育场看看热门赛事，开启你的第一单吧！',
  },
  {
    betAmount: '0.00',
    validAmount: '0.00',
    bonusAmount: '0.00',
    netAmount: '0.00',
    netAmountClassName: '',
    betCount: 0,
    gameName: '电竞',
    gameBigType: '6',
    childList: [],
    gameIcon: '/images/common/allBettingRecord/esports_icon.png',
    shadowColor: 'rgba(93, 111, 242, 0.10)',
    noDataText: '战火已燃！前往电竞战场，为你支持的战队呐喊助威！',
  },
  {
    betAmount: '0.00',
    validAmount: '0.00',
    bonusAmount: '0.00',
    netAmount: '0.00',
    netAmountClassName: '',
    betCount: 0,
    gameName: '真人',
    gameBigType: '1',
    childList: [],
    gameIcon: '/images/common/allBettingRecord/casino_icon.png',
    shadowColor: 'rgba(152, 18, 110, 0.10)',
    noDataText: '荷官已就位，开启你的真人首秀，赢取丰厚彩金！',
  },
  {
    betAmount: '0.00',
    validAmount: '0.00',
    bonusAmount: '0.00',
    netAmount: '0.00',
    netAmountClassName: '',
    betCount: 0,
    gameName: '电子',
    gameBigType: '3',
    childList: [],
    gameIcon: '/images/common/allBettingRecord/slot_icon.png',
    shadowColor: 'rgba(89, 242, 127, 0.10)',
    noDataText: '炫酷电子游戏等你来探索，海量大奖转出你的幸运！',
  },
  {
    betAmount: '0.00',
    validAmount: '0.00',
    bonusAmount: '0.00',
    netAmount: '0.00',
    netAmountClassName: '',
    betCount: 0,
    gameName: '棋牌',
    gameBigType: '5',
    childList: [],
    gameIcon: '/images/common/allBettingRecord/poker_icon.png',
    shadowColor: 'rgba(159, 127, 254, 0.10)',
    noDataText: '策略与智慧的碰撞，棋牌室高手云集，等你来挑战！',
  },
  {
    betAmount: '0.00',
    validAmount: '0.00',
    bonusAmount: '0.00',
    netAmount: '0.00',
    netAmountClassName: '',
    betCount: 0,
    gameName: '彩票',
    gameBigType: '4',
    childList: [],
    gameIcon: '/images/common/allBettingRecord/lottery_icon.png',
    shadowColor: 'rgba(255, 131, 89, 0.10)',
    noDataText: '梦想的号码已开出，速来彩票投注，把大奖抱回家！',
  },
];

export const formatGameList = (gameList: TGameCategoryItem[], dataList: TTotalListRes['list']) => {
  return gameList.map((game) => {
    let betAmount = bigNB(0);
    let validAmount = bigNB(0);
    let bonusAmount = bigNB(0);
    let netAmount = bigNB(0);
    let betCount = 0;

    dataList.forEach((item) => {
      if (item.gameBigType === game.gameBigType) {
        betAmount = betAmount.plus(item.bet);
        validAmount = validAmount.plus(item.validUnMoney || 0);
        bonusAmount = bonusAmount.plus(item.bonus);
        netAmount = netAmount.plus(item.net);
        betCount += item.num;
      }
    });
    const formatResult = netAmountFormat(netAmount.toString());
    const result: TGameCategoryItem = {
      ...game,
      betCount,
      betAmount: betAmount.toFixed(2),
      validAmount: validAmount.toFixed(2),
      bonusAmount: bonusAmount.toFixed(2),
      netAmount: formatResult.val,
      netAmountClassName: formatResult.className,
    };
    return result;
  });
};

export const getGameData = (
  gameList: TGameCategoryItem[],
  dataList: TTotalListRes['list'],
  gameBigType: string,
) => {
  let betAmount = bigNB(0);
  let validAmount = bigNB(0);
  let bonusAmount = bigNB(0);
  let netAmount = bigNB(0);
  let betCount = 0;

  let result: TGameCategoryItem = {
    gameName: '',
    gameBigType: '',
    gameIcon: '',
    shadowColor: '',
    noDataText: '',
    betAmount: '',
    validAmount: '',
    bonusAmount: '',
    netAmount: '',
    netAmountClassName: '',
    betCount: 0,
    childList: [],
  };

  gameList.forEach((game) => {
    if (game.gameBigType === gameBigType) {
      result = _.cloneDeep(game);
      dataList.forEach((item) => {
        if (item.gameBigType === game.gameBigType) {
          betAmount = betAmount.plus(item.bet);
          validAmount = validAmount.plus(item.validUnMoney);
          bonusAmount = bonusAmount.plus(item.bonus);
          netAmount = netAmount.plus(item.net);
          betCount += item.num;
          result.childList.push(item);
        }
      });
    }
  });

  result.betAmount = betAmount.toFixed(2);
  result.validAmount = validAmount.toFixed(2);
  result.bonusAmount = bonusAmount.toFixed(2);
  const formatResult = netAmountFormat(netAmount.toString());
  result.netAmount = formatResult.val;
  result.netAmountClassName = formatResult.className;
  result.betCount = betCount;

  return result;
};

export const netAmountFormat = (money: string | number) => {
  const moneyNum = bigNB(money ?? 0);
  const isGreaterThanZero = moneyNum.gt(0);
  const isLessThanZero = moneyNum.lt(0);
  return {
    val: isGreaterThanZero ? `+${moneyNum.toFixed(2)}` : `${moneyNum.toFixed(2)}`,
    className: isGreaterThanZero
      ? 'text-[var(--Red-400)]'
      : isLessThanZero
        ? 'text-[var(--Green-300)]'
        : 'text-[var(--Text-Main-10)]',
  };
};

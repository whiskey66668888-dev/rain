// 底部按钮列表
export const btnList = [
  {
    text: '活动规则',
    iocn: '/images/common/hotEvent/rule.svg',
    // activeIcon: './images/rule-active.png',
  },
  {
    text: '评论记录',
    iocn: '/images/common/hotEvent/record.svg',
    // activeIcon: './images/record-active.svg',
  },
  {
    text: '评论',
    iocn: '/images/common/hotEvent/edit.svg',
    // activeIcon: './images/edit-active.svg',
  },
];

// export const btnList =  (theme:string) => {
//     return
// }
// 活动规则列表
export const rulesList = [
  `活动对象：OP7全站会员<br/>活动场馆：全站场馆除彩票`,
  '1.本活动彩金不限游戏场馆除彩票，彩金1倍流水即可提款。',
  '2.参与方式：本活动不限VIP等级，参与本专页活动，点击评论发送内容，平台将精选优质会员评论内容进行展示，评选成功的会员将获得彩金奖励。',
  '3.评论不可包含个人隐私信息、广告营销、不良用语、恶意刷评论等内容。会员个人评论精选成功后本次活动不可再发送评论。',
  '4.每位玩家仅能注册一个账户，如注册多个账户，其他账户将被立即冻结，同时该行为视为滥用红利，所有盈利及红利将被取消。任何用户或团体以不正常的方式进行套取优惠，平台方保留在不通知的情况下冻结或关闭相关账户的权利。',
  `5.参与该活动会员必须接受及遵循上述规则与条款，并接受OP7使用的红利优惠一般相关规则与条款。`,
  `6.OP7保留对此活动做出更改、终止的权利，并享有最终解释权。`,
];

// 根据状态获取按钮文本
export const getBtnText = (status: number): string => {
  if (status === 0) {
    return '审核中';
  } else if (status === 2) {
    return '已发布';
  } else if (status === 3) {
    return '禁止评论';
  } else {
    return '禁止评论';
  }
};

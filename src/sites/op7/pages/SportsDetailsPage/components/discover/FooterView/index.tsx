import LazyImage from '@/common/components/LazyImage';
import styles from './index.module.scss';
import Icon from '@/common/components/Icon';

interface FooterItem {
  text: string;
  iconPath: string;
  isSvg?: boolean;
}

const footerItems: FooterItem[] = [
  { text: '进球', iconPath: '/images/common/discover/footer/goal.png' },
  { text: '射正', iconPath: '/images/common/discover/footer/shot_on_target.png' },
  { text: '射偏', iconPath: '/images/common/discover/footer/shot_off_target.png' },
  { text: '点球', iconPath: '/images/common/discover/footer/penalty_goal.png' },
  { text: '点球未进', iconPath: '/images/common/discover/footer/penalty_missed.png' },
  { text: '乌龙', iconPath: '/images/common/discover/footer/own_goal.png' },
  { text: '助攻', iconPath: '/images/common/discover/footer/assist.png' },
  { text: '黄牌', iconPath: '/images/common/discover/footer/ic_yellow_card.png' },
  { text: '红牌', iconPath: '/images/common/discover/footer/ic_red_card.png' },
  { text: '两黄一红', iconPath: '/images/common/discover/footer/ic_second_yellow_red.png' },
  { text: '换人', iconPath: '/images/common/discover/footer/substitution.png' },
  { text: '角球', iconPath: '/images/common/discover/footer/corner_kick.png' },
  { text: '越位', iconPath: '/images/common/discover/footer/offside.png' },
  { text: 'VAR', iconPath: '/images/common/discover/footer/var.svg', isSvg: true },
  { text: '击中门框', iconPath: '/images/common/discover/footer/hit_woodwork.svg', isSvg: true },
];

const FooterView = () => (
  <div className={styles.footer}>
    {footerItems.map((item) => (
      <div className={styles.item} key={item.text} title={item.text}>
        {item.isSvg ? (
          <Icon src={item.iconPath} size={16} color="var(--Text-Main-10)" />
        ) : (
          <LazyImage className={styles.icon} src={item.iconPath} alt="" />
        )}

        <span className={styles.text}>{item.text}</span>
      </div>
    ))}
  </div>
);

export default FooterView;

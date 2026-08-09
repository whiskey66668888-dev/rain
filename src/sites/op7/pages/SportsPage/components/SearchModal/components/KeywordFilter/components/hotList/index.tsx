import { LeagueItem } from '@/apis/fbSports/common/types';

// styles
import styles from './index.module.scss';
const HotList: React.FC<{
  list: LeagueItem[];
  onClick: (item: LeagueItem) => void;
}> = ({ list, onClick }) => {
  if (list.length === 0) {
    return null;
  }

  // 显示前10条
  const hotList = list.slice(0, 10);

  return (
    <div className={styles.hotWrapper}>
      <div className={styles.title}>热门搜索</div>
      <div className={styles.list}>
        {hotList.map((item, index) => (
          <div key={item.id} className={styles.item} onClick={() => onClick(item)}>
            <span>{index + 1}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotList;

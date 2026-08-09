import Icon from '@/common/components/Icon';
import { NewLoginModalClose } from '@/sites/op7/components/themeIcon';

// styles
import styles from './index.module.scss';
const HotList: React.FC<{
  list: string[];
  setList: (val: string[]) => void;
  onClick: (text: string) => void;
}> = ({ list, setList, onClick }) => {
  const onClear = () => {
    setList([]);
  };

  const onDelete = (text: string) => {
    const newList = list.filter((item) => item !== text);
    setList(newList);
  };

  if (list.length === 0) {
    return null;
  }

  return (
    <div className={styles.historyWapper}>
      <div className={styles.title}>
        <span>搜索历史</span>
        <span className={styles.clear} onClick={onClear}>
          清空
        </span>
      </div>
      <div className={styles.list}>
        {list.map((item, index) => (
          <div className={styles.item} key={index}>
            <div className={styles.left} onClick={() => onClick(item)}>
              <Icon src="/images/common/time.svg" size="14px" color="var(--Text-800)" />
              <span>{item}</span>
            </div>
            <NewLoginModalClose
              className={styles.clearButton}
              onClick={() => onDelete(item)}
              ariaLabel="清除"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotList;

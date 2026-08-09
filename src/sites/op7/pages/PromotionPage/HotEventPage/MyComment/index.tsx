import styles from './index.module.scss';
import { useRef, useState } from 'react';
import { useClickAway } from 'ahooks';
import { motion, AnimatePresence } from 'framer-motion'; // ✅ 引入 framer-motion
import dayjs from 'dayjs';
import clsx from 'clsx';
import { MyCommentItem } from '@/apis/origin/promotion/getHot';
import Empty from '@/common/components/Empty';
import info from '/images/light/hotEvent/info.png';
import info_dark from '/images/dark/hotEvent/info.png';
import LazyImage from '@/common/components/LazyImage';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';
interface Props {
  list: MyCommentItem[];
}

const Tips = ({ tips }: { tips: string }) => {
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const theme = themeMode === 'system' ? getSystemTheme() : themeMode;
  const [showTips, setShowTips] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ 监听 containerRef
  useClickAway(() => {
    setShowTips(false);
    console.log('点击了组件外部，关闭提示');
  }, containerRef); // ✅ 改为 containerRef

  return (
    <div ref={containerRef} className={styles.tipsWrap}>
      <span>拒绝</span>
      <LazyImage
        src={theme === 'dark' ? info_dark : info}
        alt=""
        className={styles.refuseIcon}
        onClick={(e) => {
          e.stopPropagation();
          setShowTips((boo) => !boo);
        }}
      />

      <AnimatePresence>
        {showTips && (
          <motion.div
            className={styles.tips}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()} // ✅ 防止点击提示时关闭
          >
            <div className={styles.container}>{tips}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ComContent = (prop: Props) => {
  const { list = [] } = prop;

  const renderNoCommit = () => {
    return (
      <div className={styles.noDataWrap}>
        <Empty variant="card"></Empty>
      </div>
    );
  };

  const renderStatus = (item: MyCommentItem) => {
    if (item.status === 0) {
      return <div className={styles.pending}>审核中</div>;
    } else if (item.status === 1) {
      return <div className={styles.status}>彩金{item.cash}</div>;
    } else if (item.status === 2) {
      return (
        <div className={clsx(styles.status, styles.refuse)}>
          <Tips tips={item.failInfo ?? ''} />
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className={styles.commentContent}>
      {list.length <= 0 ? (
        renderNoCommit()
      ) : (
        <div className={styles.list}>
          {/* ✅ 为列表项添加进场动画（可选） */}
          <AnimatePresence>
            {list.map((item) => (
              <div className={styles.item} key={item.addTime}>
                <div className={styles.text}>{item.comments}</div>
                <div className={styles.bottom}>
                  <div className={styles.timeWrap}>
                    <div className={styles.time}>{dayjs(item.addTime).format('MM-DD HH:mm')}</div>
                    <div
                      className={clsx(
                        styles.tag,
                        !item.displayStatus ? styles.notshow : '',
                        item.status === 0 ? styles.hide : '',
                      )}
                    >
                      {item.displayStatus ? '展示' : '不予展示'}
                    </div>
                  </div>
                  {renderStatus(item)}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ComContent;

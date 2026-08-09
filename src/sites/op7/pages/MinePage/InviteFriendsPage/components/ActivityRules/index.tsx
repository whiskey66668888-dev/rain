import clsx from 'clsx';
import { handleContent } from '@/utils/format/handleContent';
import styles from './index.module.scss';

export interface ActivityRuleItem {
  id: number;
  content: string;
}

interface ActivityRulesProps {
  timeRange?: string;
  description?: string;
  rules?: ActivityRuleItem[];
  className?: string;
}

const ActivityRules: React.FC<ActivityRulesProps> = ({
  timeRange = '',
  description = '',
  rules = [],
  className = '',
}) => {
  return (
    <div className={clsx(styles.activityRules, className)}>
      <div className={styles.section}>
        <div className={styles.sectionItem}>
          <div className={styles.itemTitle}>
            <div className={styles.bullet} />
            <span>活动时间</span>
          </div>
          <div className={styles.itemContent}>{timeRange}</div>
        </div>

        <div className={styles.sectionItem}>
          <div className={styles.itemTitle}>
            <div className={styles.bullet} />
            <span>活动内容</span>
          </div>
          <div
            className={styles.itemContent}
            dangerouslySetInnerHTML={{ __html: handleContent(description) }}
          />
        </div>

        <div className={styles.sectionItem}>
          <div className={styles.itemTitle}>
            <div className={styles.bullet} />
            <span>活动详情</span>
          </div>
          <div className={styles.itemContent}>
            <ol className={styles.rulesList}>
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={styles.ruleItem}
                  dangerouslySetInnerHTML={{ __html: handleContent(rule.content) }}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityRules;

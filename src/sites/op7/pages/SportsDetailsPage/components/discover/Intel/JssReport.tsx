import React from 'react';

import type {
  JssIntel,
  JssKeyPlayerItem,
  JssLineupSide,
  JssMetricItem,
  JssTacticalSide,
  JssTrainingSide,
} from '@/apis/origin/discover';

interface JssReportProps {
  jss: JssIntel | null;
  homeTeamName?: string;
  awayTeamName?: string;
}

const PARAGRAPH_CLS = 'mt-4px _tf[12] leading-[1.5] text-[var(--Text-800)] break-words';
const SIDE_NAME_CLS = '_tf[14] font-600 leading-[1.43] text-[var(--Text-Main-10)]';
const CELL_CLS =
  'py-6px px-4px border-[0.5px] border-solid border-[var(--Background-500)] _tf[12] leading-[1.35] align-top break-words';

const SectionBlock: React.FC<{
  title: string;
  hasBorder?: boolean;
  children: React.ReactNode;
}> = ({ title, hasBorder = true, children }) => (
  <div>
    <div className="flex items-start mb-12px">
      <span className="w-[2px] h-16px mt-[2px] mr-8px flex-none bg-[var(--ThemeColor-Main)]" />
      <span className="_tf[16] font-600 leading-[1.2] text-[var(--Text-Main-10)]">{title}</span>
    </div>
    <div className="flex flex-col gap-12px">{children}</div>
    {hasBorder && <div className="mt-16px border-t border-dashed border-[var(--Line-100)]" />}
  </div>
);

const TacticalSideBlock: React.FC<{ team: string; content: JssTacticalSide }> = ({
  team,
  content,
}) => (
  <div>
    <div className={SIDE_NAME_CLS}>{`${team}:`}</div>
    {content.coachPlan && <p className={PARAGRAPH_CLS}>{content.coachPlan}</p>}
    {content.formationStrategy && <p className={PARAGRAPH_CLS}>{content.formationStrategy}</p>}
    {content.clubGoal && <p className={PARAGRAPH_CLS}>{content.clubGoal}</p>}
  </div>
);

const KeyPlayersBlock: React.FC<{ teamName: string; items: JssKeyPlayerItem[] }> = ({
  teamName,
  items,
}) => (
  <div>
    <div className={SIDE_NAME_CLS}>{`${teamName}:`}</div>
    {items.map((item, index) => (
      <p key={index} className="mt-6px _tf[12] leading-[1.5] break-words">
        <span className="text-[var(--Text-800)]">{`${item.type}： `}</span>
        <span className="font-600 text-[var(--Text-Main-10)]">{`${item.playerName} `}</span>
        <span className="text-[var(--Text-800)]">{item.description}</span>
      </p>
    ))}
  </div>
);

const TrainingSideBlock: React.FC<{ teamName: string; content: JssTrainingSide }> = ({
  teamName,
  content,
}) => (
  <div>
    <div className={SIDE_NAME_CLS}>{`${teamName}:`}</div>
    {content.summary && <p className={PARAGRAPH_CLS}>{content.summary}</p>}
    {content.detail && <p className={PARAGRAPH_CLS}>{content.detail}</p>}
  </div>
);

const LINEUP_ROWS: { label: string; key: keyof Omit<JssLineupSide, 'formation'> }[] = [
  { label: '门将', key: 'goalkeeper' },
  { label: '后卫', key: 'defenders' },
  { label: '中场', key: 'midfielders' },
  { label: '前锋', key: 'forwards' },
];

const LineupBlock: React.FC<{ teamName: string; side: JssLineupSide }> = ({ teamName, side }) => (
  <div>
    <div className={SIDE_NAME_CLS}>
      {teamName}
      {side.formation && (
        <span className="font-600 text-[var(--ThemeColor-Main)]">{` (${side.formation})`}</span>
      )}
    </div>
    <div className="mt-8px">
      {LINEUP_ROWS.map(({ label, key }) => {
        const list = side[key];
        if (!list.length) return null;
        return (
          <div key={key} className="flex mb-6px _tf[12] leading-[1.5]">
            <span className="flex-none font-600 text-[var(--Text-Main-10)]">{`${label}：`}</span>
            <span className="text-[var(--Text-800)] break-words">{list.join('、')}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const EventsSideBlock: React.FC<{ teamName: string; formation?: string; text: string }> = ({
  teamName,
  formation,
  text,
}) => (
  <div>
    <div className={SIDE_NAME_CLS}>
      {teamName}
      {formation && (
        <span className="font-600 text-[var(--ThemeColor-Main)]">{` (${formation})`}</span>
      )}
    </div>
    <p className={PARAGRAPH_CLS}>{text}</p>
  </div>
);

const DataComparisonTable: React.FC<{
  metrics: JssMetricItem[];
  homeName: string;
  awayName: string;
}> = ({ metrics, homeName, awayName }) => {
  if (!metrics.length) return null;
  return (
    <div className="overflow-x-auto scrollbar-none">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            {['维度', homeName, awayName, '结构性解读'].map((label, index) => (
              <th
                key={index}
                className={`${CELL_CLS} bg-[var(--Background-500)] font-600 text-center text-[var(--Text-Main-10)]`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, index) => (
            <tr key={index}>
              <td className={`${CELL_CLS} text-[var(--Text-Main-10)]`}>{m.dimension}</td>
              <td className={`${CELL_CLS} text-[var(--Text-800)]`}>{m.home}</td>
              <td className={`${CELL_CLS} text-[var(--Text-800)]`}>{m.away}</td>
              <td className={`${CELL_CLS} text-[var(--Text-800)]`}>{m.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const JssReport: React.FC<JssReportProps> = ({ jss, homeTeamName = '', awayTeamName = '' }) => {
  if (!jss) {
    return <div className="py-24px text-center _tf[14] text-[var(--Text-800)]">暂无精算师报告</div>;
  }

  const homeName = jss.teams?.home?.teamName || homeTeamName || '主队';
  const awayName = jss.teams?.away?.teamName || awayTeamName || '客队';

  const sections: React.ReactNode[] = [];

  // 1. 主教练计划、俱乐部目标与意图
  const plan = jss.analysis?.tacticalPlan;
  if (plan && (plan.title || plan.home || plan.away)) {
    sections.push(
      <SectionBlock key="plan" title={plan.title || '主教练计划、俱乐部目标与意图'}>
        {plan.home && <TacticalSideBlock team={plan.home.team || homeName} content={plan.home} />}
        {plan.away && <TacticalSideBlock team={plan.away.team || awayName} content={plan.away} />}
      </SectionBlock>,
    );
  }

  // 2. 核心/主力球员伤停复出情报
  const keyPlayers = jss.analysis?.keyPlayers;
  if (keyPlayers && (keyPlayers.title || keyPlayers.home.length || keyPlayers.away.length)) {
    sections.push(
      <SectionBlock key="keyPlayers" title={keyPlayers.title || '核心/主力球员伤停复出情报'}>
        {keyPlayers.home.length > 0 && (
          <KeyPlayersBlock teamName={homeName} items={keyPlayers.home} />
        )}
        {keyPlayers.away.length > 0 && (
          <KeyPlayersBlock teamName={awayName} items={keyPlayers.away} />
        )}
      </SectionBlock>,
    );
  }

  // 3. 球员训练与身体状态分析
  const training = jss.analysis?.trainingStatus;
  if (training && (training.title || training.home || training.away)) {
    sections.push(
      <SectionBlock key="training" title={training.title || '球员训练与身体状态分析'}>
        {training.home && <TrainingSideBlock teamName={homeName} content={training.home} />}
        {training.away && <TrainingSideBlock teamName={awayName} content={training.away} />}
      </SectionBlock>,
    );
  }

  // 4. 大名单与首发阵容
  const lineups = jss.lineups;
  if (lineups && (lineups.title || lineups.home || lineups.away)) {
    sections.push(
      <SectionBlock key="lineups" title={lineups.title || '大名单与首发阵容（基于实时确认）'}>
        {lineups.home && <LineupBlock teamName={homeName} side={lineups.home} />}
        {lineups.away && <LineupBlock teamName={awayName} side={lineups.away} />}
      </SectionBlock>,
    );
  }

  // 5. 场外事件与更衣室言论
  const events = jss.events;
  if (events && (events.title || events.home || events.away)) {
    sections.push(
      <SectionBlock key="events" title={events.title || '场外事件与更衣室言论'}>
        {events.home && (
          <EventsSideBlock
            teamName={homeName}
            formation={lineups?.home?.formation}
            text={events.home}
          />
        )}
        {events.away && (
          <EventsSideBlock
            teamName={awayName}
            formation={lineups?.away?.formation}
            text={events.away}
          />
        )}
      </SectionBlock>,
    );
  }

  // 6. Opta/StatsBomb 数据对比
  const comparison = jss.dataComparison;
  if (comparison && (comparison.title || comparison.metrics.length)) {
    sections.push(
      <SectionBlock key="comparison" title={comparison.title || 'Opta/StatsBomb 数据对比'}>
        <DataComparisonTable metrics={comparison.metrics} homeName={homeName} awayName={awayName} />
      </SectionBlock>,
    );
  }

  // 7. 精算师核心结论
  const prediction = jss.prediction;
  const analyst = jss.analyst;
  if (prediction && (prediction.title || prediction.content)) {
    sections.push(
      <SectionBlock key="prediction" title={prediction.title || '精算师核心结论'} hasBorder={false}>
        {prediction.content && <p className={PARAGRAPH_CLS}>{prediction.content}</p>}
        {analyst && (analyst.name || analyst.role) && (
          <div className="flex flex-col items-end mt-16px">
            <span className="_tf[14] text-[var(--Text-Main-10)]">
              {analyst.role || '足球精算师'}
            </span>
            <span className="_tf[14] font-600 text-[var(--Text-Main-10)]">{analyst.name}</span>
          </div>
        )}
      </SectionBlock>,
    );
  }

  if (sections.length === 0) {
    return <div className="py-24px text-center _tf[14] text-[var(--Text-800)]">暂无精算师报告</div>;
  }

  return (
    <div className="flex flex-col gap-16px py-16px px-12px rounded-8px bg-[var(--Background-300)]">
      {sections}
    </div>
  );
};

export default JssReport;

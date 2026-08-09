import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppSelector } from '@/core/store/hooks';
import { getSystemTheme } from '@/utils';

import { match_evn_img_map } from '../../constants';
import type { Trend, Incident } from '@/apis/origin/discover';

const BASE_MATCH_MINUTE = 90;
const OVERTIME_DISPLAY_MINUTE = 120;
const OVERTIME_DISPLAY_THRESHOLD = 105;
// 90+ 补时事件画在 90' 右侧附近，避免把整张走势图拉得过长。
const STOPPAGE_MINUTE_SCALE = 0.6;
const normalizeDisplayMinute = (minute: number) => {
  if (minute > BASE_MATCH_MINUTE && minute < OVERTIME_DISPLAY_THRESHOLD) {
    return BASE_MATCH_MINUTE + (minute - BASE_MATCH_MINUTE) * STOPPAGE_MINUTE_SCALE;
  }
  return minute;
};

/**
 * 替换数组中的正数或负数为 0
 * @param arr - 数字字符串数组或数字数组
 * @param replaceType - 'positive' 替换正数，'negative' 替换负数
 */
const replaceNumbersWithZero = (
  arr: (string | number)[],
  replaceType: 'positive' | 'negative' = 'negative',
): number[] => {
  return arr.map((item) => {
    const num = typeof item === 'string' ? parseFloat(item) : item;
    if (replaceType === 'negative' && num < 0) return 0;
    if (replaceType === 'positive' && num > 0) return 0;
    return num;
  });
};

const MatchTimelineChart: React.FC<{ trend?: Trend; incidents?: Incident[] }> = ({
  trend,
  incidents: incidentsProp,
}) => {
  const themeMode = useAppSelector((state) => state.config.system.themeMode);
  const isDark = themeMode === 'dark' || (themeMode === 'system' && getSystemTheme() === 'dark');

  // 根据主题色获取图形颜色
  const colors = useMemo(() => {
    if (isDark) {
      return {
        text: 'rgba(204, 204, 204, 1)',
        markLine: 'rgba(75, 75, 77, 1)',
        yAxisSplitArea: [
          'transparent',
          'rgba(46, 46, 49, 0.2)',
          'rgba(46, 46, 49, 0.5)',
          'rgba(82, 158, 250, 0.2)',
          'rgba(82, 158, 250, 0.1)',
          'transparent',
        ],
      };
    }

    return {
      text: 'rgba(89, 105, 128, 1)',
      markLine: 'rgba(218, 228, 242, 1)',
      yAxisSplitArea: [
        'transparent',
        'rgba(237, 242, 255, 0.2)',
        'rgba(237, 242, 255, 0.5)',
        'rgba(82, 158, 250, 0.2)',
        'rgba(82, 158, 250, 0.1)',
        'transparent',
      ],
    };
  }, [isDark]);

  // 对齐 emc Flutter：走势图散点层直接使用 trend.incidents，有图标的事件都绘制。
  const chartIncidents: Incident[] = trend?.incidents ?? incidentsProp ?? [];
  const before_half_trend: string[] = trend?.before_half_trend ?? [];
  const after_half_trend: string[] = trend?.after_half_trend ?? [];
  const trendPointCount = normalizeDisplayMinute(
    before_half_trend.length + after_half_trend.length,
  );

  let homeValues =
    replaceNumbersWithZero([...before_half_trend, ...after_half_trend], 'positive') || [];
  let awayValues =
    replaceNumbersWithZero([...before_half_trend, ...after_half_trend], 'negative') || [];
  const len = homeValues.length;
  if (len < BASE_MATCH_MINUTE) {
    homeValues = [...homeValues, ...Array.from({ length: BASE_MATCH_MINUTE - len }).map(() => 0)];
    awayValues = [...awayValues, ...Array.from({ length: BASE_MATCH_MINUTE - len }).map(() => 0)];
  }

  const incidentMaxMinute = chartIncidents.reduce((max, item) => {
    const minute = Number(item.time);
    return Number.isFinite(minute) ? Math.max(max, normalizeDisplayMinute(minute)) : max;
  }, 0);

  const rawMaxMinute = Math.max(BASE_MATCH_MINUTE, trendPointCount, incidentMaxMinute);
  const maxMinute =
    rawMaxMinute >= OVERTIME_DISPLAY_THRESHOLD
      ? OVERTIME_DISPLAY_MINUTE
      : Math.max(BASE_MATCH_MINUTE, rawMaxMinute);
  const chartWidth = `${(maxMinute / BASE_MATCH_MINUTE) * 100}%`;
  const toLineData = (values: number[]) => {
    if (values.length <= 1) return values.map((v) => [0, v]);
    const span = Math.min(maxMinute, Math.max(BASE_MATCH_MINUTE, values.length));
    return values.map((v, i) => [(i / (values.length - 1)) * span, v]);
  };
  const incidentData = chartIncidents
    .map((item) => {
      const type = Number(item.type);
      const img = match_evn_img_map[type];
      const itemMinute = Number(item.time);
      if (!img || !Number.isFinite(itemMinute)) return null;
      const displayMinute = normalizeDisplayMinute(itemMinute);
      return {
        value: [Math.min(displayMinute, maxMinute), String(item.position) === '1' ? 140 : -140],
        symbol: `image://${img}`,
        symbolSize: 12,
        z: 12,
        label: { show: false },
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const option = {
    title: { text: '' },
    tooltip: false,
    animation: false,
    // 收紧顶部留白，让时间刻度更贴近上方区域
    grid: { top: 46, bottom: 4, left: 0, right: 0 },
    xAxis: {
      type: 'value',
      min: 0,
      max: maxMinute,
      position: 'top',
      axisLine: { show: false },
      axisTick: { show: false, alignWithLabel: true },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors.markLine,
          width: 1,
          type: 'solid',
        },
      },
      interval: 15,
      axisLabel: {
        showMinLabel: true,
        showMaxLabel: maxMinute === BASE_MATCH_MINUTE || maxMinute === OVERTIME_DISPLAY_MINUTE,
        formatter: (val: number) => {
          if (val === 45) return '{highlight|HT}';
          return `{normal|${val}′}`;
        },
        rich: {
          normal: {
            color: colors.text,
            fontFamily: "'DIN Pro', 'DINPro', Avenir, sans-serif",
            fontSize: 10,
            fontStyle: 'normal',
            padding: [0, 0, 4, 0],
          },
          highlight: {
            color: '#178AFF',
            fontFamily: "'DIN Pro', 'DINPro', Avenir, sans-serif",
            fontSize: 10,
            fontStyle: 'normal',
            padding: [0, 0, 4, 0],
          },
        },
      },
    },
    yAxis: [
      {
        type: 'value',
        min: -150,
        max: 150,
        splitNumber: 6,
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitArea: {
          show: true,
          areaStyle: {
            color: colors.yAxisSplitArea,
          },
        },
      },
    ],
    series: [
      {
        name: '主队',
        type: 'line',
        smooth: false,
        symbol: 'none',
        areaStyle: { color: 'rgba(51, 143, 255, 0.25)' },
        lineStyle: { color: '#178AFF', width: 0 },
        data: toLineData(homeValues),
      },
      {
        name: '客队',
        type: 'line',
        smooth: false,
        symbol: 'none',
        areaStyle: { color: 'rgba(51, 143, 255, 0.8)' },
        lineStyle: { color: '#FD3D40', width: 0 },
        data: toLineData(awayValues),
      },
      {
        name: '事件',
        type: 'scatter',
        data: incidentData,
        z: 10,
        tooltip: false,
      },
    ],
  };

  return (
    <div
      style={{
        width: '100%',
        height: '120px',
        borderRadius: '12px',
        overflow: 'auto hidden',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: chartWidth,
          minWidth: '100%',
          height: '100%',
          flexShrink: 0,
        }}
      >
        <ReactECharts
          option={option}
          notMerge={true}
          lazyUpdate={true}
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        />
      </div>
    </div>
  );
};

export default MatchTimelineChart;

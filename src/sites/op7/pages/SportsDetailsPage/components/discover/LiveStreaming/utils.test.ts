import assert from 'node:assert/strict';

import {
  buildScoreTable,
  getInitialBasketPeriod,
  getLiveEventBuckets,
  getVisibleLiveFilters,
} from './utils';

const overtimeDetail = {
  match_state: '8',
  match_state_name: '完场',
  home_score: '102',
  guest_score: '101',
  home_scores: '20,25,24,23',
  guest_scores: '18,28,20,26',
  home_over_time_score: '10',
  guest_over_time_score: '9',
  home_team_name: '主队',
  guest_team_name: '客队',
  home_logo: 'home.png',
  guest_logo: 'away.png',
};

assert.equal(getInitialBasketPeriod(overtimeDetail), 4);

const regulationDetail = {
  ...overtimeDetail,
  match_state_name: '第三节',
  home_over_time_score: '0',
  guest_over_time_score: '',
};

assert.equal(getInitialBasketPeriod(regulationDetail), 2);

const scoreTable = buildScoreTable(overtimeDetail, {
  homeName: '备用主队',
  awayName: '备用客队',
  homeLogo: 'fallback-home.png',
  awayLogo: 'fallback-away.png',
});

assert.deepEqual(scoreTable.headers, ['Q1', 'Q2', 'Q3', 'Q4', 'OT', '总分']);
assert.deepEqual(scoreTable.rows[0]?.values, ['20', '25', '24', '23', '10', '102']);
assert.deepEqual(scoreTable.rows[1]?.values, ['18', '28', '20', '26', '9', '101']);
assert.deepEqual(scoreTable.rows[0]?.highlights, [true, false, true, false, true, true]);
assert.deepEqual(scoreTable.rows[1]?.highlights, [false, true, false, true, false, false]);
assert.equal(scoreTable.rows[0]?.name, '主队');
assert.equal(scoreTable.rows[1]?.logo, 'away.png');

const buckets = getLiveEventBuckets([
  { type: '1', content: 'first score' },
  { type: '2', content: 'foul' },
  { type: '3', content: 'substitution' },
  { type: '9', content: 'neutral' },
]);

assert.deepEqual(
  buckets.all.map((item) => item.content),
  ['neutral', 'substitution', 'foul', 'first score'],
);
assert.deepEqual(
  buckets.score.map((item) => item.content),
  ['first score'],
);
assert.deepEqual(
  buckets.foul.map((item) => item.content),
  ['foul'],
);
assert.deepEqual(
  buckets.substitution.map((item) => item.content),
  ['substitution'],
);

assert.deepEqual(getVisibleLiveFilters(buckets), ['all', 'score', 'foul', 'substitution']);
assert.deepEqual(getVisibleLiveFilters({ ...buckets, foul: [] }), ['all', 'score', 'substitution']);

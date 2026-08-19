type RouteLoader = () => Promise<unknown>;

/** 高概率 Tab：空闲后优先预取 */
const HIGH_PRIORITY_LOADERS: RouteLoader[] = [
  () => import('../pages/HomePage'),
  () => import('../pages/SportsPage'),
  () => import('../pages/MinePage'),
];

/** 其余底部 Tab：分批延后，避免与首屏抢带宽 */
const LOW_PRIORITY_LOADERS: RouteLoader[] = [
  () => import('../pages/PromotionPage'),
  () => import('../pages/PromotionPage/SponsorPage'),
  () => import('../pages/BetHistoryPage/BetHistoryH5'),
  () => import('../pages/MinePage/MinePageH5'),
];

const BATCH_SIZE = 2;
const BATCH_GAP_MS = 400;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const runBatched = async (loaders: RouteLoader[]): Promise<void> => {
  for (let i = 0; i < loaders.length; i += BATCH_SIZE) {
    const batch = loaders.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((load) => load()));
    if (i + BATCH_SIZE < loaders.length) {
      await wait(BATCH_GAP_MS);
    }
  }
};

let prefetchPromise: Promise<void> | null = null;

export const prefetchBottomTabRoutes = (): Promise<void> => {
  if (!prefetchPromise) {
    prefetchPromise = (async () => {
      await runBatched(HIGH_PRIORITY_LOADERS);
      await wait(BATCH_GAP_MS);
      await runBatched(LOW_PRIORITY_LOADERS);
    })().catch((error) => {
      prefetchPromise = null;
      throw error;
    });
  }

  return prefetchPromise;
};

/**
 * 进行中请求去重（in-flight coalescing）
 *
 * 仅在「同一请求尚未结束」时复用 Promise，完成后立即从 Map 移除。
 * 不是响应缓存：后续再调会重新发请求，不改变轮询、登录态刷新等业务触发。
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function normalizeValue(value: unknown): unknown {
  if (value == null) return null;

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        const next = value[key];
        if (next !== undefined) {
          result[key] = normalizeValue(next);
        }
        return result;
      }, {});
  }

  return value;
}

/**
 * 将请求体规整为可比较形态。
 * undefined / null / {} 视为同一组空参数，避免调用方写法差异拆成两次请求。
 */
export function normalizeRequestBody(body: unknown): unknown {
  if (body == null) return null;

  const normalized = normalizeValue(body);
  if (isPlainObject(normalized) && Object.keys(normalized).length === 0) {
    return null;
  }
  return normalized;
}

/**
 * FormData / Blob / URLSearchParams 等无法稳定序列化，跳过去重，避免误合并。
 */
export function isInflightDedupableBody(body: unknown): boolean {
  if (body == null) return true;

  const valueType = typeof body;
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return true;
  }
  if (Array.isArray(body) || isPlainObject(body)) {
    return true;
  }
  return false;
}

export function buildInflightRequestKey(params: {
  method: string;
  url: string;
  body: unknown;
  identity: string;
}): string {
  return JSON.stringify([
    params.method.toUpperCase(),
    params.url,
    normalizeRequestBody(params.body),
    params.identity,
  ]);
}

export type InflightStore = {
  run: <T>(key: string | null, factory: () => Promise<T>) => Promise<T>;
};

/**
 * 每个 request 实例各自持有一份进行中 Map，避免不同渠道（主站 / FB / OB）互相复用。
 */
export function createInflightStore(): InflightStore {
  const inflight = new Map<string, Promise<unknown>>();

  function run<T>(key: string | null, factory: () => Promise<T>): Promise<T> {
    if (!key) return factory();

    const existing = inflight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = factory().finally(() => {
      if (inflight.get(key) === promise) {
        inflight.delete(key);
      }
    });
    inflight.set(key, promise);
    return promise;
  }

  return { run };
}

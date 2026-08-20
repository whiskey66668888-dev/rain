import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const UNSET = Symbol('unset');

export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!Object.is((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }
  return true;
}

type TStore<T> = {
  get: () => T;
  subscribe: (onStoreChange: () => void) => () => void;
};

export type TContextStore<T> = {
  Provider: (props: { value: T; children: ReactNode }) => ReactNode;
  useSelector: <S>(selector: (state: T) => S, isEqual?: (left: S, right: S) => boolean) => S;
  useFields: <K extends keyof T>(...keys: K[]) => Pick<T, K>;
  useGet: () => () => T;
};

/**
 * 可选订阅的 Context：Provider 更新时，仅 selector 结果变化的消费者会重渲染。
 * 父组件重渲染但 children 被 memo 且 props 不变时，未订阅的子树也不会跟着刷。
 */
export function createContextStore<T>(name: string): TContextStore<T> {
  const StoreContext = createContext<TStore<T> | null>(null);

  function Provider({ value, children }: { value: T; children: ReactNode }) {
    const valueRef = useRef(value);
    const listenersRef = useRef(new Set<() => void>());
    valueRef.current = value;

    const store = useMemo<TStore<T>>(
      () => ({
        get: () => valueRef.current,
        subscribe: (listener) => {
          listenersRef.current.add(listener);
          return () => {
            listenersRef.current.delete(listener);
          };
        },
      }),
      [],
    );

    useLayoutEffect(() => {
      listenersRef.current.forEach((listener) => listener());
    });

    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
  }

  function useStore(): TStore<T> {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`${name} must be used within ${name}Provider`);
    }
    return store;
  }

  function useGet(): () => T {
    const store = useStore();
    return store.get;
  }

  function useSelector<S>(
    selector: (state: T) => S,
    isEqual: (left: S, right: S) => boolean = Object.is,
  ): S {
    const store = useStore();
    const selectorRef = useRef(selector);
    const isEqualRef = useRef(isEqual);
    const selectedRef = useRef<S | typeof UNSET>(UNSET);
    selectorRef.current = selector;
    isEqualRef.current = isEqual;

    const getSnapshot = () => {
      const next = selectorRef.current(store.get());
      const prev = selectedRef.current;
      if (prev !== UNSET && isEqualRef.current(prev, next)) {
        return prev;
      }
      selectedRef.current = next;
      return next;
    };

    return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
  }

  function useFields<K extends keyof T>(...keys: K[]): Pick<T, K> {
    return useSelector((state) => {
      const picked = {} as Pick<T, K>;
      for (const key of keys) {
        picked[key] = state[key];
      }
      return picked;
    }, shallowEqual);
  }

  return { Provider, useSelector, useFields, useGet };
}

import React, { useEffect, useState } from 'react';

/**
 * ClientOnly 组件
 * 用于包裹不需要在服务端渲染的组件，只在客户端渲染
 *
 * @example
 * ```tsx
 * <ClientOnly>
 *   <ClientOnlyComponent />
 * </ClientOnly>
 * ```
 */
export const ClientOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SSR 时返回 fallback，客户端挂载后返回 children
  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

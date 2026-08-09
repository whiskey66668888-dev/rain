import React, { useState } from 'react';

import { useLogin } from '@/common/hooks/useLogin';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    void login({ loginName: username, password, keepLogin: '1' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-soft)] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="_tf[18] text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] text-center mb-6 md:mb-8">
            登录
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm md:text-base font-medium text-[var(--color-text-primary)] mb-2"
              >
                账号
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]"
                placeholder="请输入账号"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm md:text-base font-medium text-[var(--color-text-primary)] mb-2"
              >
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]"
                placeholder="请输入密码"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 md:py-3 px-4 md:px-6 text-sm md:text-base font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

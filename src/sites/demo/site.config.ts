const apiConfig = {
  // 测试环境
  dev: {
    baseUrl: 'https://www.hb74xg.com',
    wsBaseUrl: 'wss://ws-emc-sit-h5.test200.xyz',
  },
  sit: {
    baseUrl: 'https://emc-sit-h5.test200.xyz',
    wsBaseUrl: 'wss://ws-emc-sit-h5.test200.xyz',
  },
  // 预发环境
  release: {
    baseUrl: 'https://cgweb.op7uat.com/',
    wsBaseUrl: 'wss://ws-emcbbb.com',
  },

  // 生产环境
  main: {
    baseUrl: 'https://www.hb74xg.com',
    wsBaseUrl: 'wss://ws-emc-sit-h5.test200.xyz',
  },
};

const config: SiteConfig = {
  siteId: 'demo',
  name: 'OP7 Sports',
  theme: {
    primary: '#10b981',
    mode: 'light',
    template: 'sports',
  },
  api: apiConfig[process.env.NODE_ENV as 'dev' | 'sit' | 'release' | 'main'],
};

export default config;

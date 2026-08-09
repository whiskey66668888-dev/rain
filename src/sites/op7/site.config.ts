const apiConfig = {
  // 测试环境
  dev: {
    baseUrl: 'https://op7-spa-testing.test800.xyz',
    wsBaseUrl: 'wss://ws-op7-spa-testing.test800.xyz',
    openImProxyTarget: 'https://thl-dev-h5zg.test200.co',
    oddsDomain: 'https://api.test100.cc',
  },
  sit: {
    baseUrl: 'https://op7-spa-testing.test800.xyz',
    wsBaseUrl: 'wss://ws-op7-spa-testing.test800.xyz',
    openImProxyTarget: 'https://thl-dev-h5zg.test200.co',
    oddsDomain: 'https://api.test100.cc',
  },
  // 预发环境
  release: {
    baseUrl: 'https://cgweb.op7uat.com/',
    wsBaseUrl: 'wss://ws-emcbbb.com',
    oddsDomain: 'https://api.live336.com',
  },

  // 生产 / 本地 UAT（BUILD_ENV=main）
  main: {
    baseUrl: 'https://cgweb.op7uat.com/',
    wsBaseUrl: 'wss://ws-emc-sit-h5.test200.xyz',
    openImProxyTarget: 'https://thl-dev-h5zg.test200.co',
    // 与 App uat 一致：marketOdds 走 test100
    oddsDomain: 'https://api.test100.cc',
  },
};

const config: SiteConfig = {
  siteId: 'op7',
  name: 'OP Sports',
  theme: {
    primary: '#10b981',
    mode: 'light',
    template: 'sports',
  },
  api: apiConfig[
    (typeof __BUILD_ENV__ !== 'undefined'
      ? __BUILD_ENV__
      : typeof process !== 'undefined' && process.env
        ? process.env.BUILD_ENV
        : 'main') as 'dev' | 'sit' | 'release' | 'main'
  ],
  captcha: {
    type: '1', // 1=极验验证码, 2=自有验证码 // todo 走接口配置
    geetest: {
      captchaId: '28e6e3d5493ab7b717eb71827fda4ea4',
      language: 'zh',
      product: 'bind',
      protocol: 'https://',
    },
  },
  umengApm: {
    pid: '6a1126309a7f376488e54b82',
    tag: 'op7',
    traceKey: 'traceId',
  },
};

export default config;

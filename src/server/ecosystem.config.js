const SITE_ID = 'build-will-replace-here';
module.exports = {
  apps: [
    {
      name: `ssr-${SITE_ID}`,
      script: './server-prod.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        SITE_ID: SITE_ID,
        PORT: 3000,
      },
      error_file: `./logs/ssr-${SITE_ID}-error.log`,
      out_file: `./logs/ssr-${SITE_ID}-out.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};

// SITE_ID=op7 pm2 start ecosystem.config.js

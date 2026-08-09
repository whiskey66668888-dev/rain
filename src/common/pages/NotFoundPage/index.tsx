import React from 'react';

import styles from './NotFoundPage.module.scss';
// 404 页面
const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.notFoundPage}>
      <h1>404 Page</h1>
      <p>Page not found</p>
    </div>
  );
};

export default NotFoundPage;

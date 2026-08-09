import MomentsView from './MomentsView';

/** 公开动态（嵌入 /h5/moments/dynamic?public=1） */
const MomentsPublicPage: React.FC = () => {
  return <MomentsView public />;
};

export default MomentsPublicPage;

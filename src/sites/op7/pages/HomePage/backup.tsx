// import React, { useEffect, useRef, useState } from 'react';
// import { Modal, Skeleton, Swiper, SwiperRef } from 'antd-mobile';
// // styles
// import Link from 'next/link';
// import styles from './index.module.scss';
// // components
// import { SoundOutline, RightOutline } from 'antd-mobile-icons';
// import Image from '@/components/image'
// import SwiperVertica from '@/components/swiperVertica';
// import { useRouter } from 'next/navigation';
// import { isLogin } from '@/lib/helpers';
// import useLogin from '@/hooks/useLogin';
// import request from '@/lib/request';
// import Toast from '@/components/Toast';
// import routerId from '@/constants/routerId';
// import commonStore from '@/stores/common';
// import { tabs, filterData } from '../constants';
// import { useTheme } from 'next-themes';
// import Modals from '@/components/Modals';
// import Lottie from 'lottie-react';
// import { useReactive } from 'ahooks';
// interface Props {
//   gameList: any;
//   activeIndex: any;
//   setActiveIndex: (e: any) => void;
//   refs: any;
//   slideData: any;
//   isLogins: any;
// }
// const GameList = ({ gameList, setActiveIndex, activeIndex, refs, slideData, isLogins }: Props) => {
//   const shakeRefs = useRef<Array<HTMLDivElement | null>>([]);
//   const { goLogin } = useLogin();
//   const { theme, setTheme } = useTheme();
//   const router = useRouter();

//   // 使用 useReactive 管理 gameData
//   const reactiveState = useReactive({
//     gameData: {} as any
//   });

//   // 保留其他 useState
//   const [showGameModePopup, setShowGameModePopup] = useState(false);
//   const [agSelcet, setAgSelcet] = useState([]);
//   const [gameArr, setGameArr] = useState({}) as any;
//   const [gameIntroduce, setGameIntroduce] = useState(false);
//   const [showSelect2, setShowSelect2] = useState(false);
//   const [gameCheck, setGameCheck] = useState(null);
//   const [indexColor, setIndexColor] = useState(() => {
//     const color = localStorage.getItem('indexColor');
//     return color ? color : null;
//   });

//   useEffect(() => {
//     const el = shakeRefs.current[activeIndex];
//     if (!el) return;

//     const timer = setTimeout(() => {
//       el.classList.add(styles.animate);
//     }, 500)
//     const handleEnd = () => el.classList.remove(styles.animate);
//     el.addEventListener('animationend', handleEnd, { once: true });

//     // 可选：如果想在 activeIndex 变更太快时移除旧的监听，可以返回 cleanup
//     return () => {
//       clearTimeout(timer);
//       el.classList.remove(styles.animate);
//       el.removeEventListener('animationend', handleEnd);
//     };
//   }, [activeIndex, gameList]);

//   // 当数据变（例如 gameList 改变）时清空 refs，避免旧索引混乱
//   useEffect(() => {
//     shakeRefs.current = [];
//   }, [gameList]);
//   const renderModalGoLogin = (data: any) => {
//     const canTest = data?.menu[0]?.testUrl;
//     return (
//       <div className={`${styles.goPlays} ${styles.loginwrap}`}>
//         <p className={styles.contentText}>精彩内容等你来体验，快去登录吧</p>
//         {canTest ? (
//           <div className={styles.content}>
//             <Link href={routerId.login}>
//               <div className={styles.login}>登录</div>
//             </Link>
//             {canTest ? (
//               <div
//                 className={styles.tryPaly}
//                 onClick={() => {
//                   setGameCheck(null);
//                   Toast.loading();
//                   request.post(canTest).then((res: any) => {
//                     Toast.hide();
//                     if (res) {
//                       router.push(
//                         `/home/gamePage?gameId=${data.gameId}&gameType=${data.gameType}&name=${data.name}&isCheck=${2}&data=${encodeURIComponent(JSON.stringify(data?.menu[0]))}&url=${encodeURIComponent(res)}`,
//                       );
//                     }
//                   });
//                 }}
//               >
//                 立即试玩
//               </div>
//             ) : null}
//             <div
//               onClick={() => {
//                 setGameCheck(null);
//               }}
//               className={styles.close}
//             >
//               关闭
//             </div>
//           </div>
//         ) : (
//           <div className={styles.bottomeBox}>
//             <div
//               className={styles.close}
//               onClick={() => {
//                 setGameCheck(null);
//               }}
//             >
//               取消
//             </div>
//             <div>
//               <Link className={styles.login} href={routerId.login}>
//                 登录
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };
//   const goGame = (res: any, index: any) => {
//     if (
//       reactiveState.gameData.gameId === 56 ||
//       reactiveState.gameData.gameId === 78 ||
//       reactiveState.gameData.gameId === 16 ||
//       reactiveState.gameData.gameId === 71 ||
//       (reactiveState.gameData.gameId === 18 && reactiveState.gameData.gameId === 'freeTrial')
//     ) {
//       window.open(res, '_blank');
//     } else {
//       router.push(
//         `/home/gamePage?gameId=${reactiveState.gameData.gameId}&gameType=${reactiveState.gameData.gameType}&name=${reactiveState.gameData.name}&isCheck=${index}&data=${encodeURIComponent(JSON.stringify(reactiveState.gameData?.menu[0]))}&url=${encodeURIComponent(res)}`,
//       );
//     }
//   };
//   // 修改为接收两个参数
//   const chooseGameMode = (index: any, menuItemParam?: any) => {

//     setShowGameModePopup(false);
//     Toast.loading();

//     // 优先使用传入的参数，如果没有则使用状态
//     const menuItem = menuItemParam || gameArr;
//     if (index === 1) {
//       request.post(menuItem.url).then((res: any) => {
//         if (res) {
//           Toast.hide();
//           goGame(res, 1);
//         }
//       })
//     }
//     if (index === 2) {
//       request.post(menuItem.testUrl).then((res: any) => {
//         Toast.hide();
//         if (res) {
//           goGame(res, 2);
//         }
//       });
//     }
//   };
//   const toAgGame = (item: any) => {
//     setShowSelect2(false);
//     if (item.testUrl) {
//       checkIsAgGame(item);
//       setGameArr(item);
//     } else {
//       request.post(item?.url).then((res: any) => {
//         if (res) {
//           router.push(
//             `/home/gamePage?gameId=${reactiveState.gameData.gameId}&gameType=${reactiveState.gameData.gameType}&name=${item.name}&isCheck=${1}&data=${encodeURIComponent(JSON.stringify(item))}&url=${encodeURIComponent(res)}&isAg=true&`,
//           );
//         }
//       });
//     }
//   };
//   const items = gameList?.map((item: any, index: any) => (
//     <Swiper.Item key={index}>
//       <div className={styles.gameBox}>
//         <div className={styles.gameBox_head}>
//           <div className={styles.head_left}>
//             <div className={styles.game_title_img}>
//               <Image width={72} height={18} src={theme === 'dark' ? item.data.titleImgDark : item.data.titleImg} alt={'img'} />
//             </div>
//             <div className={styles.notice}>
//               <SwiperVertica
//                 className={styles.gameTips}
//                 type={'game'}
//                 data={slideData[item.data.infoType]}
//               />
//             </div>
//           </div>
//           <div
//            className={styles.shake}
//            ref={(el: HTMLDivElement | null) => {
//               shakeRefs.current[index] = el;
//             }}
//            >
//           {slideData[item.data.infoType]?.length && item.data.infoType !== 4 && item.discountIcon && (
//             <div
//               className={styles.advantage}
//               onClick={(e) => {
//                   if (!isLogins) {
//                     e.preventDefault();
//                     goLogin();
//                   } else {
//                     const discountType = commonStore.typeData.find((i: any) => i.name === item.title);
//                     router.push(`${routerId.discountActive}?type=${discountType?.typeId || 0}`);
//                   }
//               }}
//             >
//               <Lottie
//                 loop={false}
//                 animationData={item.discountIcon}
//                 src={item.discountIcon}
//                 autoplay={true} // 自动开始播放
//                 style={{
//                   width: '100%',
//                   height: '100%',
//                   objectFit: 'contain', // 包含整个动画，不裁剪
//                 }}
//               />
//             </div>
//             )}
//           </div>
//         </div>
//         <ul className={styles.gameBox_content}>
//           {item.data.list.map((i: any, j: any) => {
//             return (
//               <li
//                 key={j}
//                 className={clsx(
//                   styles[`itemWidth${i.column}`],
//                   styles[`${item.sportType}${i.column}`],
//                   i.switch === '1' || !isLogin() ? null : styles.close, //维护中
//                 )}
//                 onClick={() => {
//                   console.log(i);
//                   if (!isLogin()) {
//                     setGameCheck(i);
//                     return;
//                   }
//                   if (i.switch === '0') {
//                     return;
//                   }
//                   console.log(i, '点击的游戏');
//                   reactiveState.gameData = i;

//                   if (item.homeId === 4) {
//                     router.push(routerId.slotGame + '?gameId=' + i.gameId);
//                     return;
//                   }
//                   // ag
//                   if (i.gameId === 5) {
//                     if (i.menu.length) {
//                       setShowSelect2(true);
//                     }
//                     setGameIntroduce(i.gameIntroduce);
//                     setAgSelcet(i.menu);
//                     return;
//                   } else {
//                     if (
//                       i.gameId === 56 ||
//                       i.gameId === 78 ||
//                       i.gameId === 16 ||
//                       i.gameId === 71 ||
//                       (i.gameId === 18 && i.gameId === 'freeTrial')
//                     ) {
//                       if (i.menu[0]?.testUrl) {
//                         checkIsAgGame(i.menu[0]);

//                         setGameArr(i.menu[0]);
//                       } else {
//                         Toast.loading();
//                         request.post(i.menu[0]?.url).then((res: any) => {
//                           Toast.hide();
//                           if (res) {
//                             window.open(res, '_blank');
//                           }
//                         });
//                       }
//                     } else {
//                       if (i.menu[0]?.testUrl) {
//                         checkIsAgGame(i.menu[0]);
//                         setGameArr(i.menu[0]);
//                       } else {
//                         Toast.loading();
//                         request.post(i.menu[0]?.url).then((res: any) => {
//                           Toast.hide();
//                           if (res) {
//                             router.push(
//                               `/home/gamePage?gameId=${i.gameId}&gameType=${i.gameType}&name=${i.name}&data=${encodeURIComponent(JSON.stringify(i?.menu[0]))}&url=${encodeURIComponent(res)}`,
//                             );
//                           }
//                         });
//                       }
//                     }
//                   }
//                 }}
//               >
//                 {i.switch === '0' && isLogin() ? (
//                   <div className={styles.maintain}>
//                     <div className={styles.fonts1}>
//                       <Image className={styles.ico} src={require('@images/home/vector_1.png')} alt={'ico'} />
//                       场馆升级中
//                     </div>
//                     <div className={styles.fonts2}>{i.maintenanceDesc}</div>
//                   </div>
//                 ) : null}
//                 {i.switch === '1' && i.maintenanceDesc ? (
//                   <div className={styles.previewBox}>
//                     <div className={styles.previewContent}>
//                       <Image
//                         className={styles.ico}
//                         src={require('./img/preview_ioc.svg')}
//                         alt={'ico'}
//                       />
//                       {i.maintenanceDesc}
//                     </div>
//                   </div>
//                 ) : null}
//                 {i.switch === '2' ? (
//                   <div className={styles.maintain}>
//                     <div className={styles.fonts1}>
//                       <Image height={12} width={12} className={styles.ico} src={require('@images/home/expect.png')} alt={'ico'} />
//                       敬请期待
//                     </div>
//                   </div>
//                 ) : null}
//                 {item.data.sportType}
//                 <Image
//                   parentClassName={clsx(
//                     styles[item.sportType],
//                     indexColor !== null && indexColor !== 'fullColor' ? styles.solidBox : null
//                   )}
//                   priority={true}
//                   src={
//                     indexColor !== null && indexColor !== 'fullColor'
//                       ? (theme === 'dark' ? i.solidDark : i.solid)
//                       : (theme === 'dark' ? i.imgDark : i.img)
//                   }
//                   alt={i?.name}
//                 />
//               </li>
//             );
//           })}
//         </ul>
//       </div>
//     </Swiper.Item>
//   ));
//   // 检查是否开启试玩弹窗
//   const checkIsAgGame = (menuItem: any) => {
//     const playTestStatus = localStorage.getItem('playTest')
//     if (playTestStatus && JSON.parse(playTestStatus)) {
//       setGameArr(menuItem); // 设置状态以备后用
//       setShowGameModePopup(true);
//     } else {
//       // 直接传递 menuItem，而不依赖于 gameArr 状态
//      chooseGameMode(1, menuItem);
//     }
//   }
//   return (
//     <div className={styles.homePage1}>
//       <div className={clsx(styles.gameList)}>
//         {gameList.length > 0 ? (
//           <Swiper
//             loop
//             slideSize={100}
//             autoplayInterval={0}
//             defaultIndex={activeIndex}
//             indicator={() => null}
//             ref={refs}
//             onIndexChange={(i) => {
//               setActiveIndex(i);
//             }}
//           >
//             {items}
//           </Swiper>
//         ) : (
//           <div className={styles.boxSke}>
//             <Skeleton animated className={styles.customSkeleton1} />
//             {tabs[0].data.list.map((item, index) => {
//               return <Skeleton key={index} animated className={styles.customSkeleton} />;
//             })}
//           </div>
//         )}
//       </div>
//       {/* ag弹窗 */}
//       {showSelect2 ? (
//         <Modals.Modal
//         contentclassName={styles.agModle}
//           title={'温馨提示'}
//           content={
//             <div className={styles.agbox_select}>
//               <div className={styles.content}>
//                 <div className={styles.ag_intro}>{gameIntroduce}</div>

//                 {agSelcet.map((item: any, index) => {
//                   return (
//                     <div key={index} className={styles.ag_select} onClick={() => toAgGame(item)}>
//                       {item.name}
//                     </div>
//                   );
//                 })}
//               </div>
//               <div className={styles.selectBottom}>
//                 <div className={styles.close} onClick={() => setShowSelect2(false)}>
//                   关闭
//                 </div>
//               </div>
//             </div>
//           }
//         ></Modals.Modal>
//       ) : null}

//       {/* 试玩弹窗 */}
//       {/* <Modals.Modal
//         {...{
//           mode: 'y',
//           title: '请选择模式',
//           content: renderModalGoLogin(1),
//         }}
//       ></Modals.Modal> */}
//       {showGameModePopup ? (
//         <Modals.Modal
//           title={'请选择模式'}
//           contentclassName={styles.qpModle}
//           content={
//             <div className={styles.agbox}>
//               <div className={styles.selectTitle}> </div>
//               <div className={styles.content}>
//                 {/* <div className={styles.ag_intro}>{gameIntroduce}</div> */}
//                 <div className={styles.ag_select} onClick={() => chooseGameMode(1)}>
//                   真钱
//                 </div>
//                 <div className={`${styles.ag_select} ${styles.qp_select}`} onClick={() => chooseGameMode(2)}>
//                   立即试玩
//                 </div>
//                 <div
//                   className={clsx(styles.ag_select, styles.close)}
//                   onClick={() => setShowGameModePopup(false)}
//                 >
//                   关闭
//                 </div>
//               </div>
//             </div>
//           }
//         ></Modals.Modal>
//       ) : null}
//       {/* 游戏登录提示 */}
//       {gameCheck ? (
//         <div
//           onClick={() => {
//             setGameCheck(null);
//           }}
//         >
//           <Modals.Modal
//             {...{
//               mode: '',
//               title: '前往登录',
//               wrapclassName: styles.loginwrap,
//       contentclassName: styles.content,
//       contentTextclassName: styles.contentText,
//       footerclassName: styles.footerWrap,
//               content: renderModalGoLogin(gameCheck),
//             }}
//           ></Modals.Modal>
//         </div>
//       ) : null}
//     </div>
//   );
// };

// export default GameList;

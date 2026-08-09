// football
import mubapei from '@/sites/op7/images/common/mine/avatar/football/mubapei.webp';
import meixi from '@/sites/op7/images/common/mine/avatar/football/meixi.webp';
import cluo1 from '@/sites/op7/images/common/mine/avatar/football/cluo1.webp';
import beilinemu from '@/sites/op7/images/common/mine/avatar/football/beilinemu.webp';
import halande from '@/sites/op7/images/common/mine/avatar/football/halande.webp';
import yamaer from '@/sites/op7/images/common/mine/avatar/football/yamaer.webp';
import weinixiusi from '@/sites/op7/images/common/mine/avatar/football/weinixiusi.webp';
import dengbeilai from '@/sites/op7/images/common/mine/avatar/football/dengbeilai.webp';
import aitana from '@/sites/op7/images/common/mine/avatar/football/aitana.webp';
import muxiyala from '@/sites/op7/images/common/mine/avatar/football/muxiyala.webp';

// basketball
import kebi from '@/sites/op7/images/common/mine/avatar/basketball/kebi.webp';
import kuli from '@/sites/op7/images/common/mine/avatar/basketball/kuli.webp';
import yaoming from '@/sites/op7/images/common/mine/avatar/basketball/yaoming.webp';
import liyueru from '@/sites/op7/images/common/mine/avatar/basketball/liyueru.webp';
import yanghansen from '@/sites/op7/images/common/mine/avatar/basketball/yanghansen.webp';
import duante from '@/sites/op7/images/common/mine/avatar/basketball/duante.webp';
import zhanmusi from '@/sites/op7/images/common/mine/avatar/basketball/zhanmusi.webp';
import dongqiqi from '@/sites/op7/images/common/mine/avatar/basketball/dongqiqi.webp';
import aidehuazi from '@/sites/op7/images/common/mine/avatar/basketball/aidehuazi.webp';
import kelake from '@/sites/op7/images/common/mine/avatar/basketball/kelake.webp';
import adetuo from '@/sites/op7/images/common/mine/avatar/basketball/adetuo.webp';
import yalishanda from '@/sites/op7/images/common/mine/avatar/basketball/yalishanda.webp';

// others
import liudehua from '@/sites/op7/images/common/mine/avatar/others/liudehua.webp';
import wuyanni from '@/sites/op7/images/common/mine/avatar/others/wuyanni.webp';
import zhouxingchi from '@/sites/op7/images/common/mine/avatar/others/zhouxingchi.webp';
import zhourunfa from '@/sites/op7/images/common/mine/avatar/others/zhourunfa.webp';
import masike from '@/sites/op7/images/common/mine/avatar/others/masike.webp';
import daguxiangping from '@/sites/op7/images/common/mine/avatar/others/daguxiangping.webp';
import sunyuchen from '@/sites/op7/images/common/mine/avatar/others/sunyuchen.webp';
import sunyang from '@/sites/op7/images/common/mine/avatar/others/sunyang.webp';
import sunyingsha from '@/sites/op7/images/common/mine/avatar/others/sunyingsha.webp';
import chuanpu from '@/sites/op7/images/common/mine/avatar/others/chuanpu.webp';
import zhangjiahui from '@/sites/op7/images/common/mine/avatar/others/zhangjiahui.webp';
import zhangchangning from '@/sites/op7/images/common/mine/avatar/others/zhangchangning.webp';
import zhangyufei from '@/sites/op7/images/common/mine/avatar/others/zhangyufei.webp';
import xinna from '@/sites/op7/images/common/mine/avatar/others/xinna.webp';
import lindan from '@/sites/op7/images/common/mine/avatar/others/lindan.webp';
import biergaizi from '@/sites/op7/images/common/mine/avatar/others/biergaizi.webp';
import wangchuqin from '@/sites/op7/images/common/mine/avatar/others/wangchuqin.webp';
import muliniao from '@/sites/op7/images/common/mine/avatar/others/muliniao.webp';
import andelieyewa from '@/sites/op7/images/common/mine/avatar/others/andelieyewa.webp';
import luoyonghao from '@/sites/op7/images/common/mine/avatar/others/luoyonghao.webp';
import guailing from '@/sites/op7/images/common/mine/avatar/others/guailing.webp';
import zhaochangpeng from '@/sites/op7/images/common/mine/avatar/others/zhaochangpeng.webp';
import zhengqinwen from '@/sites/op7/images/common/mine/avatar/others/zhengqinwen.webp';
import alina from '@/sites/op7/images/common/mine/avatar/others/alina.webp';
import alongsuo from '@/sites/op7/images/common/mine/avatar/others/alongsuo.webp';
import mayun from '@/sites/op7/images/common/mine/avatar/others/mayun.webp';
import mahuateng from '@/sites/op7/images/common/mine/avatar/others/mahuateng.webp';
import liming from '@/sites/op7/images/common/mine/avatar/others/liming.webp';
import aerkalasi from '@/sites/op7/images/common/mine/avatar/others/aerkalasi.webp';

export interface AvatarItem {
  id: string;
  name: string;
  src: string;
}

export const AVATAR_LIST: AvatarItem[] = [
  // football
  { id: 'mubapei', name: '姆巴佩', src: mubapei },
  { id: 'meixi', name: '梅西', src: meixi },
  { id: 'cluo1', name: 'C罗', src: cluo1 },
  { id: 'beilinemu', name: '贝林厄姆', src: beilinemu },
  { id: 'halande', name: '哈兰德', src: halande },
  { id: 'yamaer', name: '亚马尔', src: yamaer },
  { id: 'weinixiusi', name: '维尼修斯', src: weinixiusi },
  { id: 'dengbeilai', name: '登贝莱', src: dengbeilai },
  { id: 'aitana', name: '艾塔娜', src: aitana },
  { id: 'muxiyala', name: '穆西亚拉', src: muxiyala },

  // basketball
  { id: 'kebi', name: '科比', src: kebi },
  { id: 'kuli', name: '库里', src: kuli },
  { id: 'yaoming', name: '姚明', src: yaoming },
  { id: 'liyueru', name: '李月汝', src: liyueru },
  { id: 'yanghansen', name: '杨翰森', src: yanghansen },
  { id: 'duante', name: '杜兰特', src: duante },
  { id: 'zhanmusi', name: '詹姆斯', src: zhanmusi },
  { id: 'dongqiqi', name: '东契奇', src: dongqiqi },
  { id: 'aidehuazi', name: '爱德华兹', src: aidehuazi },
  { id: 'kelake', name: '克拉克', src: kelake },
  { id: 'adetuo', name: '阿德托昆博', src: adetuo },
  { id: 'yalishanda', name: '亚历山大', src: yalishanda },

  // others
  { id: 'liudehua', name: '刘德华', src: liudehua },
  { id: 'wuyanni', name: '吴艳妮', src: wuyanni },
  { id: 'zhouxingchi', name: '周星驰', src: zhouxingchi },
  { id: 'zhourunfa', name: '周润发', src: zhourunfa },
  { id: 'masike', name: '马斯克', src: masike },
  { id: 'daguxiangping', name: '大谷翔平', src: daguxiangping },
  { id: 'sunyuchen', name: '孙宇晨', src: sunyuchen },
  { id: 'sunyang', name: '孙杨', src: sunyang },
  { id: 'sunyingsha', name: '孙颖莎', src: sunyingsha },
  { id: 'chuanpu', name: '川普', src: chuanpu },
  { id: 'zhangjiahui', name: '张家辉', src: zhangjiahui },
  { id: 'zhangchangning', name: '张常宁', src: zhangchangning },
  { id: 'zhangyufei', name: '张雨霏', src: zhangyufei },
  { id: 'xinna', name: '辛纳', src: xinna },
  { id: 'lindan', name: '林丹', src: lindan },
  { id: 'biergaizi', name: '比尔盖茨', src: biergaizi },
  { id: 'wangchuqin', name: '王楚钦', src: wangchuqin },
  { id: 'muliniao', name: '穆里尼奥', src: muliniao },
  { id: 'andelieyewa', name: '安德烈耶娃', src: andelieyewa },
  { id: 'luoyonghao', name: '罗永浩', src: luoyonghao },
  { id: 'guailing', name: '谷爱凌', src: guailing },
  { id: 'zhaochangpeng', name: '赵长鹏', src: zhaochangpeng },
  { id: 'zhengqinwen', name: '郑钦文', src: zhengqinwen },
  { id: 'alina', name: '阿丽娜', src: alina },
  { id: 'alongsuo', name: '阿隆索', src: alongsuo },
  { id: 'mayun', name: '马云', src: mayun },
  { id: 'mahuateng', name: '马化腾', src: mahuateng },
  { id: 'liming', name: '黎明', src: liming },
  { id: 'aerkalasi', name: '阿尔卡拉斯', src: aerkalasi },
];

// 通过 id 快速查找图片 src
export const AVATAR_MAP_BY_ID: Record<string, string> = Object.fromEntries(
  AVATAR_LIST.map((item) => [item.id, item.src]),
);

import { useQueryHook } from '@/core/query';
import { ResponseData } from '@/core/sdk/request/model';
import requestOB from '@/core/sdk/requestOB';

export interface OBMenuListResponse {
  count: number; // 菜单数量
  field1: string; // 备用字段1，在二级菜单中，是球种ID
  field2: string; // 是否主菜单显示
  grade: number; // 菜单等级
  menuId: number; // 菜单id
  menuName: string; // 菜单名称
  menuType: number; // 菜单类型：早盘/串关/滚球/今日等
  parentId: number; // 父节点id
  subList: OBMenuListResponse[]; // 子菜单集合
  topMenuList: OBMenuListResponse[]; // 当为串关或早盘时该对象有值，里面对象属性与subList一致
}

/**
 *  获取OB 获取体育的菜单列表
 *  接口文档地址： https://api-doc-2.dbsporxxxw1box.com/#/main/detail?type=doc&id=63ff36cff01607bc0128f980
 *
 **/
export const getMenuListReq = (): Promise<ResponseData<OBMenuListResponse[]>> => {
  return requestOB.get('/yewu11/pub/v1/m/menu/initPB');
};

/**
 * 获取 OB 体育菜单列表的 React Query Hook
 * @returns 返回 OB 体育菜单列表
 */
export function useMenuListQuery() {
  return useQueryHook<OBMenuListResponse[], Error>({
    queryKey: ['ob', 'menu', 'list', 'initPB'],
    queryFn: () =>
      getMenuListReq()
        .then((res) => res.data)
        .catch(() => {
          return [];
        }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: 'always',
  });
}

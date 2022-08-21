import {
  V8SnapshotEdgeTypes,
  V8SnapshotInfo,
  V8SnapshotInfoEdge,
  V8SnapshotInfoNode,
  V8SnapshotNodeTypes,
} from '../../../../src';

export { V8SnapshotInfo, V8SnapshotEdgeTypes, V8SnapshotNodeTypes } from '../../../../src';

// 获取表格展示信息
interface GetNodeShowInfoParams {
  edge: V8SnapshotInfoEdge,
  node: V8SnapshotInfoNode,
  totalSize: number
}
export function getNodeShowInfo(params: GetNodeShowInfoParams) {
  const { edge, node, totalSize } = params;
  return {
    ...node,
    ...edge,
    nodeType: node.type,
    distanceShow: node.distance >= V8SnapshotInfo.BASE_SYSTEM_DISTANCE ? '-' : node.distance,
    nameShow: node.type === V8SnapshotNodeTypes.concatenated_string
    || node.type === V8SnapshotNodeTypes.string
      ? `"${node.name}"`
      : node.type === V8SnapshotNodeTypes.regexp
        ? `/${node.name}/`
        : node.type === V8SnapshotNodeTypes.closure
          ? `${node.name}()`
          : node.type === V8SnapshotNodeTypes.array
            ? `${node.name || '(internal array)'}[]`
            : node.name,
    nameShowStyle: {
      color: node.type === V8SnapshotNodeTypes.concatenated_string
      || node.type === V8SnapshotNodeTypes.string || node.type === V8SnapshotNodeTypes.regexp
        ? 'rgb(200,0,0)'
        : node.type === V8SnapshotNodeTypes.closure
          ? undefined
          : node.type === V8SnapshotNodeTypes.bigint
            ? 'rgb(35,110,37)'
            : node.type === V8SnapshotNodeTypes.number
              ? 'rgb(26,26,166)'
              : node.type === V8SnapshotNodeTypes.hidden
              || node.type === V8SnapshotNodeTypes.object_shape
                ? '#909399'
                : undefined,
      fontStyle: node.type === V8SnapshotNodeTypes.closure ? 'italic' : undefined,
    },
    nameShowPrefix: edge.type === V8SnapshotEdgeTypes.element
      ? `[${edge.name_or_index}]`
      : edge.name_or_index,
    nameShowPrefixStyle: {
      color: [
        V8SnapshotEdgeTypes.internal,
        V8SnapshotEdgeTypes.hidden,
        V8SnapshotEdgeTypes.weak,
      ].indexOf(edge.type) > -1
        ? '#909399'
        : edge.type === V8SnapshotEdgeTypes.context
          ? 'rgb(26,26,166)'
          : 'rgb(136,18,128)',
    },
    reachableFromWindow: node.type === V8SnapshotNodeTypes.string
            || (node.type === V8SnapshotNodeTypes.object && node.name.indexOf('Window') === 0)
            || Boolean(node.flag & V8SnapshotInfo.NODE_FLAGS.canBeQueried),
    detachedDOMTreeNode: Boolean(node.flag & V8SnapshotInfo.NODE_FLAGS.detachedDOMTreeNode),
    selfSizePercent: Math.round((node.self_size * 100) / totalSize),
    retainedSizePercent: Math.round((node.retained_size * 100) / totalSize),
  };
}

export enum nodeFilterType {
  userObject = 1,
  showObject,
  all,
  // customize,
}

// 节点过滤类型
export const nodeFilterOptions = [
  {
    value: nodeFilterType.userObject,
    label: '用户节点',
  },
  {
    value: nodeFilterType.showObject,
    label: '可访问节点',
  },
  {
    value: nodeFilterType.all,
    label: '全部节点',
  },
  // {
  //   value: nodeFilterType.customize,
  //   label: '自定义',
  // },
];

// export const nodeFilterTypeOptions = [
//   V8SnapshotNodeTypes.string,
//   V8SnapshotNodeTypes.hidden,
//   V8SnapshotNodeTypes.array,
//   V8SnapshotNodeTypes.concatenated_string,
//   V8SnapshotNodeTypes.number,
//   V8SnapshotNodeTypes.sliced_string,
//   V8SnapshotNodeTypes.object,
//   V8SnapshotNodeTypes.bigint,
//   V8SnapshotNodeTypes.closure,
//   V8SnapshotNodeTypes.regexp,
//   V8SnapshotNodeTypes.native,
//   V8SnapshotNodeTypes.code,
//   V8SnapshotNodeTypes.symbol,
//   V8SnapshotNodeTypes.synthetic,
//   V8SnapshotNodeTypes.object_shape,
// ];

// 过滤出用户的节点
export function filterUserObject(item: { node: V8SnapshotInfoNode, edge: V8SnapshotInfoEdge }) {
  const { node } = item;
  if (node.distance >= V8SnapshotInfo.BASE_SYSTEM_DISTANCE) {
    return false;
  }
  // todo
  if (!(node.flag & V8SnapshotInfo.NODE_FLAGS.canBeQueried)) {
    return false;
  }
  if ([
    V8SnapshotNodeTypes.hidden,
    V8SnapshotNodeTypes.object_shape,
    V8SnapshotNodeTypes.native,
    V8SnapshotNodeTypes.code,
  ].includes(node.type)) {
    return false;
  }
  // if([
  //   V8SnapshotEdgeTypes.internal,
  //   V8SnapshotEdgeTypes.hidden,
  //   V8SnapshotEdgeTypes.weak,
  //   V8SnapshotEdgeTypes.context
  // ].indexOf(edge.type)){
  //   return false;
  // }
  //
  // if(edge.type === V8SnapshotEdgeTypes.property && [
  //   'isNaN',
  //   'BigInt64Array',
  //   'Array',
  //   'setTimeout',
  //   'Boolean'
  // ].includes(node.name)){
  //   return false;
  // }
  return true;
}

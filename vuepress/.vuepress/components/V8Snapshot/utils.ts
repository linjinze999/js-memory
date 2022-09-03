import {
  V8SnapshotEdgeTypes,
  V8SnapshotInfo, V8SnapshotInfoAggregatedInfo,
  V8SnapshotInfoEdge,
  V8SnapshotInfoNode,
  V8SnapshotNodeTypes,
} from '../../../../src';

export { V8SnapshotInfo, V8SnapshotEdgeTypes, V8SnapshotNodeTypes } from '../../../../src';

// 获取表格展示信息
interface GetNodeShowInfoParams {
  edge?: V8SnapshotInfoEdge,
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
    nameShowPrefix: edge?.type === V8SnapshotEdgeTypes.element
      ? `[${edge.name_or_index}]`
      : (edge?.name_or_index || ''),
    nameShowPrefixStyle: {
      color: [
        V8SnapshotEdgeTypes.internal,
        V8SnapshotEdgeTypes.hidden,
        V8SnapshotEdgeTypes.weak,
      ].indexOf(edge?.type) > -1
        ? '#909399'
        : edge?.type === V8SnapshotEdgeTypes.context
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
interface GetNodeShowInfoByClassParams {
  _class: V8SnapshotInfoAggregatedInfo,
  totalSize: number
}
export function getNodeShowInfoByClass(params: GetNodeShowInfoByClassParams) {
  const { _class, totalSize } = params;
  return {
    ..._class,
    // nodeType: node.type,
    distanceShow: _class.distance,
    nameShow: _class.name,
    nameShowStyle: {},
    nameShowPrefix: '',
    nameShowPrefixStyle: {},
    reachableFromWindow: false,
    detachedDOMTreeNode: false,
    self_size: _class.self,
    selfSizePercent: Math.round((_class.self * 100) / totalSize),
    retained_size: _class.maxRet,
    retainedSizePercent: Math.round((_class.maxRet * 100) / totalSize),
    hasChildren: !!_class.idxs.length,
    rowKey: _class.idx,
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
export function filterUserObject(item: { node: V8SnapshotInfoNode, edge?: V8SnapshotInfoEdge }) {
  const { node, edge } = item;
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
  if ([
    V8SnapshotEdgeTypes.internal,
    V8SnapshotEdgeTypes.hidden,
    V8SnapshotEdgeTypes.weak,
    V8SnapshotEdgeTypes.context,
  ].includes(edge?.type)) {
    return false;
  }

  if ([
    '__proto__',
  ].includes(edge?.name_or_index as string)) {
    return false;
  }

  if (edge?.type === V8SnapshotEdgeTypes.property && [
    'BigInt64Array',
    'Int8Array',
    'Int16Array',
    'Int32Array',
    'Uint8Array',
    'Uint16Array',
    'Uint32Array',
    'BigUint64Array',
    'Float32Array',
    'Float64Array',
    'Uint8ClampedArray',
    'Boolean',
    'Map',
    'Symbol',
    'WeakMap',
    'Math',
    'Date',
    'Array',
    'ArrayBuffer',
    'String',
    'RegExp',
    'Set',
    'WeakSet',
    'Object',
    'Number',
    'JSON',
    'Function',
    'BigInt',
    'Promise',
    'Proxy',
    'WebAssembly',
    'FinalizationRegistry',
    'WeakRef',
    'Error',
    'RangeError',
    'URIError',
    'SyntaxError',
    'EvalError',
    'TypeError',
    'ReferenceError',
    'AggregateError',
    'XMLHttpRequest',
    'DataView',
    'isNaN',
    'isFinite',
    'Reflect',
    'Intl',
    'Atomics',
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'encodeURI',
    'decodeURI',
    'encodeURIComponent',
    'decodeURIComponent',
    'eval',
    'parseInt',
    'parseFloat',
    'console',
    'escape',
    'unescape',
    'global',
    'structuredClone',
    'resizeBy',
    'requestIdleCallback',
    'webkitRequestAnimationFrame',
    'requestAnimationFrame',
    'cancelIdleCallback',
    'cancelAnimationFrame',
    'webkitCancelAnimationFrame',
    'webkitResolveLocalFileSystemURL',
    'fetch',
    'alert',
    'confirm',
    'prompt',
    'document',
    'print',
    'open',
    'close',
    'scroll',
    'scrollTo',
    'scrollBy',
    'moveTo',
    'focus',
    'blur',
    'resizeTo',
    'moveBy',
    'find',
    'stop',
    'releaseEvents',
    'postMessage',
    'createImageBitmap',
    'webkitRequestFileSystem',
    'JSCompiler_renameProperty',
    'ShadyCSS',
    'atob',
    'btoa',
    'caches',
    'localStorage',
    'captureEvents',
    'MutationObserver',
    'showOpenFilePicker',
    'showSaveFilePicker',
    'showDirectoryPicker',
    'queueMicrotask',
    'queryLocalFonts',
    'getScreenDetails',
    'getComputedStyle',
    'openDatabase',
    'get launchQueue',
    'get onbeforematch',
    'set onbeforematch',
    'get ondevicemotion',
    'set ondevicemotion',
    'get ondeviceorientation',
    'set ondeviceorientation',
    'get crossOriginIsolated',
    'set crossOriginIsolated',
    'get originAgentCluster',
    'get ondeviceorientationabsolute',
    'set ondeviceorientationabsolute',
    'get onpointerrawupdate',
    'set onpointerrawupdate',
    'get trustedTypes',
    'get caches',
    'get speechSynthesis',
    'get navigation',
    'set navigation',
    'get scheduler',
    'set scheduler',
    'getSelection',
    'get cookieStore',
    '__proto__',
  ].includes(node.name)) {
    return false;
  }
  return true;
}

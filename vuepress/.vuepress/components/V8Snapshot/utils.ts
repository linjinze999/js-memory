import {
    V8SnapshotEdgeTypes,
    V8SnapshotNodeTypes,
    V8SnapshotInfo,
    V8SnapshotInfoEdge,
    V8SnapshotInfoNode
} from "../../../../src";
export {V8SnapshotInfo} from "../../../../src";

export function getNodeShowInfo(params: { edge: V8SnapshotInfoEdge, node: V8SnapshotInfoNode, totalSize: number }){
    const {edge, node, totalSize} = params;
    return {
        ...node,
        ...edge,
        distanceShow: node.distance >= V8SnapshotInfo.BASE_SYSTEM_DISTANCE ? "-" : node.distance,
        nameShow: node.type === V8SnapshotNodeTypes.concatenated_string || node.type === V8SnapshotNodeTypes.string
            ? `"${node.name}"`
            :  node.type === V8SnapshotNodeTypes.regexp
                ? `/${node.name}/`
                : node.type === V8SnapshotNodeTypes.closure
                    ? `${node.name}()`
                    : node.type === V8SnapshotNodeTypes.array
                        ? `${node.name || '(internal array)'}[]`
                        : node.name,
        nameShowStyle: {
            color: node.type === V8SnapshotNodeTypes.concatenated_string || node.type === V8SnapshotNodeTypes.string || node.type === V8SnapshotNodeTypes.regexp
                ? 'rgb(200,0,0)'
                :  node.type === V8SnapshotNodeTypes.closure
                    ? undefined
                    : node.type === V8SnapshotNodeTypes.bigint
                        ? 'rgb(35,110,37)'
                        : node.type === V8SnapshotNodeTypes.number
                            ? 'rgb(26,26,166)'
                            : node.type === V8SnapshotNodeTypes.hidden || node.type === V8SnapshotNodeTypes.object_shape
                                ? '#909399'
                                : undefined,
            fontStyle: node.type === V8SnapshotNodeTypes.closure ? 'italic': undefined
        },
        nameShowPrefix: edge.type === V8SnapshotEdgeTypes.element ? `[${edge.name_or_index}]` : edge.name_or_index,
        nameShowPrefixStyle: {
            color: [V8SnapshotEdgeTypes.internal, V8SnapshotEdgeTypes.hidden, V8SnapshotEdgeTypes.weak].indexOf(edge.type) > -1
                ? '#909399'
                : edge.type ===V8SnapshotEdgeTypes.context
                    ? 'rgb(26,26,166)'
                    : 'rgb(136,18,128)'
        },
        reachableFromWindow: node.type === V8SnapshotNodeTypes.string ||
            (node.type === V8SnapshotNodeTypes.object && node.name.indexOf('Window') === 0) ||
            Boolean(node.flag & V8SnapshotInfo.NODE_FLAGS.canBeQueried),
        detachedDOMTreeNode: Boolean(node.flag & V8SnapshotInfo.NODE_FLAGS.detachedDOMTreeNode),
        selfSizePercent: Math.round(node.self_size * 100 / totalSize),
        retainedSizePercent: Math.round(node.retained_size * 100 / totalSize),
    }
}

export enum nodeFilterType {
    userObject = 1,
    all,
    customize
}

export const nodeFilterOptions = [
    {
        value: nodeFilterType.userObject,
        label: "可访问节点"
    },
    {
        value: nodeFilterType.all,
        label: "全部节点"
    },
    {
        value: nodeFilterType.customize,
        label: "自定义"
    },
]

export const nodeFilterTypeOptions = [
    V8SnapshotNodeTypes.string,
    V8SnapshotNodeTypes.hidden,
    V8SnapshotNodeTypes.array,
    V8SnapshotNodeTypes.concatenated_string,
    V8SnapshotNodeTypes.number,
    V8SnapshotNodeTypes.sliced_string,
    V8SnapshotNodeTypes.object,
    V8SnapshotNodeTypes.bigint,
    V8SnapshotNodeTypes.closure,
    V8SnapshotNodeTypes.regexp,
    V8SnapshotNodeTypes.native,
    V8SnapshotNodeTypes.code,
    V8SnapshotNodeTypes.symbol,
    V8SnapshotNodeTypes.synthetic,
    V8SnapshotNodeTypes.object_shape
]

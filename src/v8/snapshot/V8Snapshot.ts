import {
  V8SnapshotInfo, V8SnapshotInfoAggregatedInfo, V8SnapshotInfoEdge,
  V8SnapshotInfoNode,
  V8SnapshotProgressParams,
} from './V8SnapshotInfo';
import { V8SnapshotEdgeTypes, V8SnapshotJson, V8SnapshotNodeTypes } from './V8SnapshotTypes';

export interface SnapshotOptions {
  text: string | V8SnapshotJson;
  progressCallback?: (params: V8SnapshotProgressParams) => void;
}

export interface V8SnapshotCalculateSize {
  total: number, // 总计
  native: number, // 类型化数组
  code: number, // 代码
  string: number, // 字符串
  array: number, // js数组
  system: number, // 系统对象
  others: number // 其他
}

interface NodeEdge {
  node: V8SnapshotInfoNode,
  edge?: V8SnapshotInfoEdge,
}

export interface V8SnapshotDiff {
  className: string,
  addedIds: number[],
  deletedIds: number[],
  removedCount: number,
  removedSize: number,
  addedCount: number,
  addedSize: number,
  countDelta: number,
  sizeDelta: number,
}

export interface V8SnapshotScriptCode {
  edgeList: V8SnapshotInfoEdge[];
  scriptNameNode?: V8SnapshotInfoNode
}

let snapshotId = 1;

export class V8Snapshot {
  constructor(options: SnapshotOptions) {
    this.options = { ...this.options, ...V8Snapshot.DEFAULT_OPTIONS, ...options };
    this.snapshot_info = new V8SnapshotInfo({
      text: this.options.text,
      progressCallback: this.options.progressCallback,
    });
  }

  static DEFAULT_OPTIONS: SnapshotOptions = { text: '' };

  private readonly options: SnapshotOptions = {} as any;

  public snapshot_info: V8SnapshotInfo;

  private calculateSize?: V8SnapshotCalculateSize;

  private snapshotId = snapshotId++;

  private diffSnapshot: Record<number, Record<string, V8SnapshotDiff>> = {};

  // 统计数据
  public calculateStatistics = (reset?: boolean): V8SnapshotCalculateSize => {
    if (!this.calculateSize || reset) {
      this.calculateSize = {
        total: 0, // 总计
        native: 0, // 类型化数组
        code: 0, // 代码
        string: 0, // 字符串
        array: 0, // js数组
        system: 0, // 系统对象
        others: 0, // 其他
      };
      let nodeSize: number;
      this.snapshot_info.node_list.forEach((node) => {
        nodeSize = node.self_size as number;
        this.calculateSize.total += nodeSize;
        if (node.distance >= V8SnapshotInfo.BASE_SYSTEM_DISTANCE) {
          this.calculateSize.system += nodeSize;
        } else if (node.type === V8SnapshotNodeTypes.native) {
          this.calculateSize.native += nodeSize;
        } else if (node.type === V8SnapshotNodeTypes.code) {
          this.calculateSize.code += nodeSize;
        } else if (([
          V8SnapshotNodeTypes.string,
          V8SnapshotNodeTypes.concatenated_string,
          V8SnapshotNodeTypes.sliced_string,
        ]).indexOf(node.type as V8SnapshotNodeTypes) > -1) {
          this.calculateSize.string += nodeSize;
        } else if (node.name === 'Array') {
          this.calculateSize.array += this.calculateArraySize(node);
        } else {
          this.calculateSize.others += nodeSize;
        }
      });
    }
    return this.calculateSize;
  };

  // 计算数组大小
  public calculateArraySize = (node: V8SnapshotInfoNode) => {
    let size = node.self_size as number;
    this.snapshot_info.edges[node.id]?.some((edge) => {
      if (edge.type !== V8SnapshotEdgeTypes.internal) {
        return false;
      }
      if (edge.name_or_index !== 'elements') {
        return false;
      }
      const node_to = this.snapshot_info.nodes[edge.to_node];
      if (this.snapshot_info.edges_to[edge.to_node]?.length === 1) {
        size += (node_to.self_size as number);
      }
      return true;
    });
    return size;
  };

  // 获取子节点
  public getNodeChildren = (nodeId?: number): NodeEdge[] => {
    const node_id = nodeId === undefined || nodeId < 0 ? this.snapshot_info.root_id : nodeId;
    return this.snapshot_info.edges[node_id]?.map((edge) => ({
      edge,
      node: this.snapshot_info.nodes[edge.to_node],
    })) || [];
  };

  // 获取父节点
  public getNodeParents = (nodeId: number): NodeEdge[] => {
    const edges = this.snapshot_info.edges_to[nodeId];
    return edges?.map((edge) => ({
      edge,
      node: this.snapshot_info.nodes[edge.from_node],
    })) || [];
  };

  // 获取类列表
  public getClassList = (): V8SnapshotInfoAggregatedInfo[] => {
    const classIndexList = Object.keys(this.snapshot_info.aggregatesByClassIndex);
    return classIndexList
      .map((classIndex) => this.snapshot_info.aggregatesByClassIndex[classIndex as any]);
  };

  public calculateSnapshotDiff = (diffSnapshot: V8Snapshot) => {
    if (this.diffSnapshot[diffSnapshot.snapshotId]) {
      return this.diffSnapshot[diffSnapshot.snapshotId];
    }
    const baseSnapshotClass = this.snapshot_info.aggregatesByClassName;
    const diffSnapshotClass = diffSnapshot.snapshot_info.aggregatesByClassName;
    const baseSnapshotNodes = this.snapshot_info.nodes;
    const diffSnapshotNodes = diffSnapshot.snapshot_info.nodes;
    const result: Record<string, V8SnapshotDiff> = {};
    Object.keys(baseSnapshotClass).forEach((className) => {
      const diff = V8Snapshot.calculateDiffForClass({
        baseSnapshotNodes,
        diffSnapshotNodes,
        baseSnapshotIds: baseSnapshotClass[className].ids,
        diffSnapshotIds: diffSnapshotClass[className]?.ids || [],
        className,
      });
      if (diff.removedCount || diff.addedCount) {
        result[className] = diff;
      }
    });
    Object.keys(diffSnapshotClass).forEach((className) => {
      if (baseSnapshotClass[className]) {
        return;
      }
      const diff = V8Snapshot.calculateDiffForClass({
        baseSnapshotNodes,
        diffSnapshotNodes,
        baseSnapshotIds: [],
        diffSnapshotIds: diffSnapshotClass[className].ids || [],
        className,
      });
      if (diff.removedCount || diff.addedCount) {
        result[className] = diff;
      }
    });
    this.diffSnapshot[diffSnapshot.snapshotId] = result;
    return result;
  };

  static calculateDiffForClass = (params: {
    baseSnapshotNodes: Record<number | string, V8SnapshotInfoNode>,
    diffSnapshotNodes: Record<number | string, V8SnapshotInfoNode>,
    baseSnapshotIds: number[],
    diffSnapshotIds: number[],
    className: string
  }) => {
    const {
      baseSnapshotNodes, diffSnapshotNodes, baseSnapshotIds, diffSnapshotIds, className,
    } = params;
    const left = baseSnapshotIds;
    const right = diffSnapshotIds;
    let l = 0;
    let r = 0;
    const diff: V8SnapshotDiff = {
      className,
      addedIds: [],
      deletedIds: [],
      removedCount: 0,
      removedSize: 0,
      addedCount: 0,
      addedSize: 0,
      sizeDelta: 0,
      countDelta: 0,
    };
    while (l < left.length && r < right.length) {
      if (left[l] < right[r]) {
        diff.addedIds.push(left[l]);
        diff.addedCount++;
        diff.addedSize += baseSnapshotNodes[left[l]].self_size;
        l++;
      } else if (left[l] > right[r]) {
        diff.deletedIds.push(right[r]);
        diff.removedCount++;
        diff.removedSize += diffSnapshotNodes[right[r]].self_size;
        r++;
      } else {
        l++;
        r++;
      }
    }
    while (l < left.length) {
      diff.addedIds.push(left[l]);
      diff.addedCount++;
      diff.addedSize += baseSnapshotNodes[left[l]].self_size;
      l++;
    }
    while (r < right.length) {
      diff.deletedIds.push(right[r]);
      diff.removedCount++;
      diff.removedSize += diffSnapshotNodes[right[r]].self_size;
      r++;
    }
    diff.countDelta = diff.addedCount - diff.removedCount;
    diff.sizeDelta = diff.addedSize - diff.removedSize;
    return diff;
  };

  // 统计代码
  public calculateScriptCode = () => {
    const scriptEdges: Record<number | string, V8SnapshotScriptCode> = {};
    this.snapshot_info.edge_list.forEach((edge) => {
      if (edge.type === V8SnapshotEdgeTypes.internal && edge.name_or_index === 'shared') {
        if (!scriptEdges[edge.to_node]) {
          scriptEdges[edge.to_node] = { edgeList: [], scriptNameNode: undefined };
          const script_or_debug_edge = this.snapshot_info.edges[edge.to_node]
            .find((to_edge) => to_edge.type === V8SnapshotEdgeTypes.internal
              && to_edge.name_or_index === 'script_or_debug_info');
          if (script_or_debug_edge) {
            const name_edge = this.snapshot_info.edges[script_or_debug_edge.to_node]
              .find((to_edge) => to_edge.type === V8SnapshotEdgeTypes.internal
                && to_edge.name_or_index === 'name');
            if (name_edge) {
              scriptEdges[edge.to_node].scriptNameNode = this.snapshot_info.nodes[name_edge.to_node];
            }
          }
        }
        scriptEdges[edge.to_node].scriptNameNode && scriptEdges[edge.to_node].edgeList.push(edge);
      }
    });
    const scriptList = Object.keys(scriptEdges).filter((nodeId) => scriptEdges[nodeId].scriptNameNode).map((nodeId) => scriptEdges[nodeId]);
    return scriptList;
  };
}

export default V8Snapshot;

import {
  V8SnapshotInfo, V8SnapshotInfoEdge,
  V8SnapshotInfoNode,
  V8SnapshotProgressParams
} from './V8SnapshotInfo';
import { V8SnapshotEdgeTypes, V8SnapshotNodeTypes } from './V8SnapshotTypes';

export interface SnapshotOptions{
  text: string;
  progressCallback?: (params: V8SnapshotProgressParams) => void;
}
interface V8SnapshotCalculateSize {
  total: number, // 总计
  native: number, // 类型化数组
  code: number, // 代码
  string: number, // 字符串
  array: number, // js数组
  system: number, // 系统对象
  others: number // 其他
}

export class V8Snapshot {
  constructor(options: SnapshotOptions) {
    this.options = { ...this.options, ...V8Snapshot.DEFAULT_OPTIONS, ...options };
    this.snapshot_info = new V8SnapshotInfo({
      text: this.options.text,
      progressCallback: this.options.progressCallback
    });
  }

  static DEFAULT_OPTIONS: SnapshotOptions = { text: '' };

  private readonly options: SnapshotOptions = {} as any;


  public snapshot_info: V8SnapshotInfo;
  private calculateSize?: V8SnapshotCalculateSize;

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
        others: 0 // 其他
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
          V8SnapshotNodeTypes.sliced_string
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
  public getChildren = (nodeId?: number): { edge: V8SnapshotInfoEdge, node: V8SnapshotInfoNode }[] => {
    let node_id = nodeId === undefined ? this.snapshot_info.root_id : nodeId;
    return this.snapshot_info.edges[node_id].map(edge=>{
      return {
        edge,
        node: this.snapshot_info.nodes[edge.to_node]
      }
    }) || [];
  }
}

export default V8Snapshot;

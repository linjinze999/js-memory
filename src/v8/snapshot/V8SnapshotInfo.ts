import {
  V8Snapshot,
  V8SnapshotEdgeFields,
  V8SnapshotEdgeTypes,
  V8SnapshotNodeFields,
  V8SnapshotNodeTypes,
} from './V8SnapshotTypes';

export interface V8SnapshotInfoOptions {
  text: string;
  progressCallback?: (params: V8SnapshotProgressParams) => void;
}

export enum V8SnapshotInfoNodeFields {
  // eslint-disable-next-line no-unused-vars
  retained_size = 'retained_size',
  // eslint-disable-next-line no-unused-vars
  distance = 'distance',
  // eslint-disable-next-line no-unused-vars
  flag = 'flag',
  // eslint-disable-next-line no-unused-vars
  idx = 'idx'
}

export enum V8SnapshotInfoEdgeFields {
  // eslint-disable-next-line no-unused-vars
  from_node = 'from_node'
}

export type V8SnapshotInfoNode = Record<V8SnapshotNodeFields | V8SnapshotInfoNodeFields, number | string> & {
    [V8SnapshotNodeFields.id]: number,
    [V8SnapshotNodeFields.name]: string,
    [V8SnapshotNodeFields.type]: V8SnapshotNodeTypes,
    [V8SnapshotNodeFields.self_size]: number,
    [V8SnapshotNodeFields.edge_count]: number,
    [V8SnapshotInfoNodeFields.retained_size]: number,
    [V8SnapshotInfoNodeFields.distance]: number,
    [V8SnapshotInfoNodeFields.flag]: number,
    [V8SnapshotInfoNodeFields.idx]: number,
};
export type V8SnapshotInfoEdge = Record<V8SnapshotEdgeFields | V8SnapshotInfoEdgeFields, number | string> & {
    [V8SnapshotEdgeFields.type]: V8SnapshotEdgeTypes,
    [V8SnapshotEdgeFields.name_or_index]: string | number,
    [V8SnapshotEdgeFields.to_node]: number,
    [V8SnapshotInfoEdgeFields.from_node]: number
};

interface V8SnapshotInfoAggregatedInfo{
    count: number,
    distance: number,
    self: number,
    maxRet: number,
    type: V8SnapshotNodeTypes,
    name: string | null,
    idxs: number[],
}

export interface V8SnapshotProgressParams {
  progress: number;
  text: string;
}

// V8Snapshot基础信息
export class V8SnapshotInfo {
  constructor(options: V8SnapshotInfoOptions) {
    this.options = options;
    this.init(options.text);
  }

  public snapshot: V8Snapshot = null as any;

  public node_list: V8SnapshotInfoNode[] = []; // [node_1, node_2, ...]

  public edge_list: V8SnapshotInfoEdge[] = []; // [edge_1, edge_2, ...]

  public nodes: Record<number | string, V8SnapshotInfoNode> = {}; // {[node_id]: node_info}

  public edges: Record<number | string, V8SnapshotInfoEdge[] | undefined> = {}; // {[from_node_id]: [to_node1,to_node2]}

  public edges_to: Record<number | string, V8SnapshotInfoEdge[] | undefined> = {}; // {[to_node_id]: [from_node1,from_node2]}

  public node_fields_idx: Record<V8SnapshotNodeFields, number> = {} as any;

  public edge_fields_idx: Record<V8SnapshotEdgeFields, number> = {} as any;

  public node_field_count: number = 0;

  public edge_fields_count: number = 0;

  public root_id = 1;

  public nodeId2PostOrderIndex: Record<number | string, number> = {};

  public postOrderIndex2NodeId: Uint32Array = new Uint32Array(0);

  public firstDominatedNodeIndex: Uint32Array = new Uint32Array(0);

  public dominatedNodes: Uint32Array = new Uint32Array(0);

  public dominatorsTree: Record<number, number> = {};

  public aggregatesByClassName: Record<string, V8SnapshotInfoAggregatedInfo> = {};

  public aggregatesByClassIndex: Record<number, V8SnapshotInfoAggregatedInfo> = {};

  static ROOT_NODE_ID = 1;

  static NO_RETAINED_SIZE = -1;

  static NO_DISTANCE = 0;

  static BASE_SYSTEM_DISTANCE = 100000000;

  static NODE_FLAGS = { // bit flags
    canBeQueried: 1,
    detachedDOMTreeNode: 2,
    pageObject: 4,
  };

  private options: V8SnapshotInfoOptions;

  // 初始化：分析V8Snapshot
  private init = (text: string) => {
    try {
      this.snapshot = JSON.parse(text);
    } catch (e) {
      console.error('[V8SnapshotInfo] format snapshot error: ', e);
      throw new Error('could not format snapshot string');
    }
    if (!this.snapshot) {
      return;
    }
    this.root_id = V8SnapshotInfo.ROOT_NODE_ID;
    // 初始化任务列表
    const initTasks: {progress: number, text: string, fn: () => void}[] = [
      {
        progress: 0,
        text: "开始解析...",
        fn: this.initFieldsIndex,
      },
      {
        progress: 0.09,
        text: "初始化节点数据...",
        fn: this.initNodes
      },
      {
        progress: 0.18,
        text: "初始化结构数据...",
        fn: this.initEdges,
      },
      {
        progress: 0.27,
        text: "初始化节点标记...",
        fn: this.calculateFlags,
      },
      {
        progress: 0.36,
        text: "初始化倒序树...",
        fn: this.buildPostOrderIndex,
      },
      {
        progress: 0.45,
        text: "初始化支配树...",
        fn: this.buildDominatorTree,
      },
      {
        progress: 0.54,
        text: "初始化节点保留大小...",
        fn: this.calculateRetainedSizes,
      },
      {
        progress: 0.63,
        text: "初始化支配节点...",
        fn: this.buildDominatedNodes,
      },
      {
        progress: 0.72,
        text: "初始化节点根距离...",
        fn: this.initDistance,
      },
      {
        progress: 0.81,
        text: "初始化类合集...",
        fn: this.buildAggregates,
      },
      {
        progress: 0.9,
        text: "初始化类保留大小...",
        fn: this.calculateClassesRetainedSize
      },
    ];
    // 执行初始化任务
    initTasks.forEach(task => {
      this.options.progressCallback?.({
        progress: task.progress,
        text: task.text
      });
      task.fn();
    })
    this.options.progressCallback?.({
      progress: 1,
      text: "初始化完成"
    });
  };

  // 初始化：记录fields序号
  private initFieldsIndex = () => {
    this.node_field_count = this.snapshot.snapshot.meta.node_fields.length;
    this.edge_fields_count = this.snapshot.snapshot.meta.edge_fields.length;
    this.snapshot.snapshot.meta.node_fields.forEach((node_field, idx) => {
      this.node_fields_idx[node_field] = idx;
    });
    this.snapshot.snapshot.meta.edge_fields.forEach((edge_field, idx) => {
      this.edge_fields_idx[edge_field] = idx;
    });
  };

  // 初始化：Node信息
  private initNodes = () => {
    const { node_count } = this.snapshot.snapshot;
    let node: V8SnapshotInfoNode;
    for (let i = 0; i < node_count; ++i) {
      node = this.getNode(i);
      this.node_list.push(node);
      this.nodes[node.id] = node;
    }
  };

  // 获取node
  private getNode = (node_idx: number): V8SnapshotInfoNode => {
    const node_start = node_idx * this.node_field_count;
    const node_field = this.snapshot.snapshot.meta.node_fields;
    const node: Partial<V8SnapshotInfoNode> = {
      retained_size: V8SnapshotInfo.NO_RETAINED_SIZE,
      distance: V8SnapshotInfo.NO_DISTANCE,
      flag: 0,
      idx: node_idx,
    };
    for (let i = 0; i < this.node_field_count; ++i) {
      // todo name: concatenated string
      (node[node_field[i]] as string | number) = (this.getNodeField(node_start, i));
    }
    node.retained_size = node.self_size;
    if (node.type === V8SnapshotNodeTypes.native && (node.name!).indexOf('Detached ') === 0) {
      (node.flag!) |= V8SnapshotInfo.NODE_FLAGS.detachedDOMTreeNode;
    }
    return node as V8SnapshotInfoNode;
  };

  // 获取node某个field值
  private getNodeField = (node_start: number, node_field_idx: number): number | string => {
    const value = this.snapshot.nodes[node_start + node_field_idx];
    const type = this.snapshot.snapshot.meta.node_types[node_field_idx];
    if (type === V8SnapshotNodeTypes.string) return this.snapshot.strings[value];
    if (type === V8SnapshotNodeTypes.number) return value;
    if (Array.isArray(type)) return type[value];
    throw new Error(`unsupported node field type: ${type}`);
  };

  // 初始化：edges信息
  private initEdges = () => {
    let edge_start = 0;
    let edge: V8SnapshotInfoEdge;
    let from_node_id: number;
    this.node_list.forEach((node) => {
      from_node_id = node.id;
      for (let j = 0; j < node.edge_count; ++j) {
        edge = this.getEdge(edge_start, from_node_id);
        // edge list
        this.edge_list.push(edge);
        // edge from map
        this.edges[from_node_id] = this.edges[from_node_id] || [];
        this.edges[from_node_id]!.push(edge);
        // edge to map
        this.edges_to[edge.to_node] = this.edges_to[edge.to_node] || [];
        this.edges_to[edge.to_node]!.push(edge);
        edge_start += this.edge_fields_count;
      }
    });
  };

  // 获取edge
  private getEdge = (edge_start: number, from_node: number): V8SnapshotInfoEdge => {
    const edge_field = this.snapshot.snapshot.meta.edge_fields;
    const edge: Partial<V8SnapshotInfoEdge> = {
      from_node,
    };
    for (let i = 0; i < this.edge_fields_count; ++i) {
      (edge[edge_field[i]] as string | number) = this.getEdgeField(edge_start, i, edge.type);
    }
    return edge as V8SnapshotInfoEdge;
  };

  // 获取edge的field
  private getEdgeField = (edge_start: number, field_index: number, field_type: V8SnapshotEdgeTypes): string | number => {
    const value = this.snapshot.edges[edge_start + field_index];
    const type = this.snapshot.snapshot.meta.edge_types[field_index];
    if (type === V8SnapshotEdgeTypes.string_or_number) {
      return (field_type === V8SnapshotEdgeTypes.element || field_type === V8SnapshotEdgeTypes.hidden)
          ? value
          : this.snapshot.strings[value];
    } if (type === V8SnapshotEdgeTypes.node) {
      return this.getNodeField(value, this.node_fields_idx[V8SnapshotNodeFields.id]);
    } if (Array.isArray(type)) {
      return type[value] || V8SnapshotEdgeTypes.invisible;
    }
    throw new Error(`unsupported edge field type: ${type}`);
  };

  // 初始化：对象自身大小加上它依赖链路上的所有对象的自身大小（Shallow size）之和
  // calculateRetainedSizes
  private calculateRetainedSizes = () => {
    const nodeCount = this.node_list.length;
    const { dominatorsTree } = this;
    for (let postOrderIndex = 0; postOrderIndex < nodeCount - 1; ++postOrderIndex) {
      const nodeId = this.postOrderIndex2NodeId[postOrderIndex];
      const dominatorNodeId = dominatorsTree[nodeId];
      (this.nodes[dominatorNodeId].retained_size) += (this.nodes[nodeId].retained_size);
    }
  };

  // 初始化：距离
  private initDistance = () => {
    const root_node = this.nodes[this.root_id];
    const nodesToVisit = new Array(this.node_list.length);
    let nodesToVisitLength = 0;
    let node_to: V8SnapshotInfoNode;
    // BFS for user root objects.
    this.edges[root_node.id]?.forEach((edge) => {
      node_to = this.nodes[edge.to_node];
      if (node_to.type !== V8SnapshotNodeTypes.synthetic) {
        (node_to.distance = 1);
        nodesToVisit[nodesToVisitLength++] = node_to;
      }
    });
    this.setNodeChildDistance(nodesToVisit, nodesToVisitLength);
    // BFS for objects not reached from user roots.
    root_node.distance = nodesToVisitLength > 0 ? V8SnapshotInfo.BASE_SYSTEM_DISTANCE : 0;
    nodesToVisit[0] = root_node;
    nodesToVisitLength = 1;
    this.setNodeChildDistance(nodesToVisit, nodesToVisitLength);
  };

  // 设置node距离
  private setNodeChildDistance = (nodesToVisit: V8SnapshotInfoNode[], nodesToVisitLength: number) => {
    let index = 0;
    let node: V8SnapshotInfoNode;
    let node_to: V8SnapshotInfoNode;
    while (index < nodesToVisitLength) {
      node = nodesToVisit[index++];
      // eslint-disable-next-line no-loop-func
      this.edges[node.id]?.forEach((edge) => {
        node_to = this.nodes[edge.to_node];
        if (edge.type === V8SnapshotEdgeTypes.weak
                    || node_to.distance !== V8SnapshotInfo.NO_DISTANCE
                    || !this.nodesDistanceFilter(node_to, edge)) {
          return;
        }
        node_to.distance = (node.distance) + 1;
        // eslint-disable-next-line no-param-reassign
        nodesToVisit[nodesToVisitLength++] = node_to;
      });
    }
  };

  // node距离过滤
  private nodesDistanceFilter = (node: V8SnapshotInfoNode, edge: V8SnapshotInfoEdge) => {
    if (node.type === V8SnapshotNodeTypes.hidden) {
      return edge.name_or_index !== 'sloppy_function_map' || node.name !== 'system / NativeContext';
    }
    if (node.type === V8SnapshotNodeTypes.array) {
      if (node.name !== '(map descriptors)') {
        return true;
      }
      const index = typeof edge.name_or_index === "number" ? edge.name_or_index : parseInt(edge.name_or_index, 10);
      return index < 2 || (index % 3) !== 1;
    }
    return true;
  };

  // 节点标记
  private calculateFlags = () => {
    this.markQueriableHeapObjects();
    this.markPageOwnedNodes();
  };

  // 标记节点可查询
  private markQueriableHeapObjects = () => {
    const flag = V8SnapshotInfo.NODE_FLAGS.canBeQueried;

    const list: V8SnapshotInfoNode[] = [];
    let node_to: V8SnapshotInfoNode;
    this.edges[this.root_id]?.forEach((edge) => {
      node_to = this.nodes[edge.to_node];
      if (node_to.type !== V8SnapshotNodeTypes.synthetic) {
        list.push(node_to);
      }
    });

    while (list.length) {
      const node = (list.pop() as V8SnapshotInfoNode);
      if (node.flag & flag) {
        continue;
      }
      node.flag |= flag;
      this.edges[node.id]?.forEach(edge => {
        const childNode = this.nodes[edge.to_node];
        if(childNode.flag & flag){
          return;
        } else if(edge.type === V8SnapshotEdgeTypes.hidden || edge.type === V8SnapshotEdgeTypes.invisible || edge.type === V8SnapshotEdgeTypes.internal ||edge.type === V8SnapshotEdgeTypes.weak){
          return;
        }
        list.push(childNode);
      });
    }
  }

  // 标记node节点是有页面内对象
  private markPageOwnedNodes() {
    const flag = V8SnapshotInfo.NODE_FLAGS.pageObject;
    this.edges[this.root_id]?.forEach((edge) => {
      if (edge.type === V8SnapshotEdgeTypes.element) {
        // isDocumentDOMTreesRoot
        if (this.nodes[edge.to_node]?.type === V8SnapshotNodeTypes.synthetic && this.nodes[edge.to_node].name === '(Document DOM trees)') {
          (this.nodes[edge.to_node].flag) |= flag;
          this.markPageOwnedNodesByNodeId(edge.to_node, flag);
        }
      } else if (edge.type === V8SnapshotEdgeTypes.shortcut) {
        (this.nodes[edge.to_node].flag) |= flag;
        this.markPageOwnedNodesByNodeId(edge.to_node, flag);
      }
    });
  }

  // 标记node节点是有页面内对象
  private markPageOwnedNodesByNodeId(nodeId: number, flag: number) {
    this.edges[nodeId]?.forEach((edge) => {
      const node_to = this.nodes[edge.to_node];
      if ((node_to.flag) & flag) {
        return;
      }
      if (edge.type === V8SnapshotEdgeTypes.weak) {
        return;
      }
      (node_to.flag) |= flag;
      this.markPageOwnedNodesByNodeId(edge.to_node, flag);
    });
  }

  // 构建倒序序号
  private buildPostOrderIndex = () => {
    const nodeCount = this.node_list.length;
    this.postOrderIndex2NodeId = new Uint32Array(nodeCount);

    const stackNodes = new Uint32Array(nodeCount);
    const visited: Record<number, boolean> = {};
    let postOrderIndex = 0;
    let stackTop = 0;
    stackNodes[0] = this.root_id;
    visited[this.root_id] = true;

    let iteration = 0;
    let hasNew = false;
    while (true) {
      ++iteration;
      while (stackTop >= 0) {
        const node = this.nodes[stackNodes[stackTop]];
        hasNew = false;
        this.edges[node.id]?.forEach((edge) => {
          if (!this.isEssentialEdge(node.id, edge.type)) {
            return;
          }
          const childNode = this.nodes[edge.to_node];
          if (visited[childNode.id]) {
            return;
          }
          if (node.id !== this.root_id
                      && ((childNode.flag) & V8SnapshotInfo.NODE_FLAGS.pageObject)
                      && !((node.flag) & V8SnapshotInfo.NODE_FLAGS.pageObject)) {
            return;
          }
          hasNew = true;
          ++stackTop;
          stackNodes[stackTop] = edge.to_node;
          visited[edge.to_node] = true;
        });
        if (!hasNew) {
          // Done with all the node children
          this.nodeId2PostOrderIndex[node.id] = postOrderIndex;
          this.postOrderIndex2NodeId[postOrderIndex++] = node.id;
          --stackTop;
        }
      }

      if (postOrderIndex === nodeCount || iteration > 1) {
        break;
      }
      const errors = [
        `Heap snapshot: ${nodeCount - postOrderIndex} nodes are unreachable from the root. Following nodes have only weak retainers:`,
      ];
      // eslint-disable-next-line max-len
      // Remove root from the result (last node in the array) and put it at the bottom of the stack so that it is
      // visited after all orphan nodes and their subgraphs.
      --postOrderIndex;
      stackTop = 0;
      stackNodes[0] = this.root_id;
      for (let i = 0; i < nodeCount; ++i) {
        const node = this.node_list[i];
        if (visited[node.id] || !this.hasOnlyWeakRetainers(node.id)) {
          continue;
        }
        // Add all nodes that have only weak retainers to traverse their subgraphs.
        stackNodes[++stackTop] = node.id;
        visited[node.id] = true;
        const retainers: string[] = [];
        this.edges_to[node.id]?.forEach((edge) => {
          const node_from = this.nodes[edge.from_node];
          retainers.push(`${node_from.name}@${node_from.id}.${edge.name_or_index}`);
        });
        errors.push(`${node.name} @${node.id}  weak retainers: ${retainers.join(', ')}`);
      }
      console.warn(errors);
    }

    // If we already progressed all orphan nodes that have only weak retainers and still have some orphans...
    if (postOrderIndex !== nodeCount) {
      const errors = [`Still found ${nodeCount - postOrderIndex} unreachable nodes in heap snapshot:`];
      // Remove root from the result (last node in the array) and put it at the bottom of the stack so that it is
      // visited after all orphan nodes and their subgraphs.
      --postOrderIndex;
      for (let i = 0; i < nodeCount; ++i) {
        const node = this.node_list[i];
        if (visited[node.id]) {
          // eslint-disable-next-line no-continue
          continue;
        }
        errors.push(`${node.name} @${node.id}`);
        // Fix it by giving the node a postorder index anyway.
        this.nodeId2PostOrderIndex[node.id] = postOrderIndex;
        this.postOrderIndex2NodeId[postOrderIndex++] = node.id;
      }
      this.nodeId2PostOrderIndex[this.root_id] = postOrderIndex;
      this.postOrderIndex2NodeId[postOrderIndex++] = this.root_id;
      console.warn(errors);
    }
  };

  // 基本必要edge
  private isEssentialEdge = (nodeId: number, edgeType: V8SnapshotEdgeTypes) => edgeType !== V8SnapshotEdgeTypes.weak
          && (edgeType !== V8SnapshotEdgeTypes.shortcut || nodeId === this.root_id);

  // 上级只有weak
  private hasOnlyWeakRetainers = (nodeId: number) => !this.edges_to[nodeId]?.some((edge) => edge.type !== V8SnapshotEdgeTypes.weak && edge.type !== V8SnapshotEdgeTypes.shortcut);

  // 支配树（向上寻找包含node所有引用的父node）
  private buildDominatorTree = () => {
    const flag = V8SnapshotInfo.NODE_FLAGS.pageObject;
    const nodesCount = this.postOrderIndex2NodeId.length;
    const rootPostOrderedIndex = nodesCount - 1;
    const noEntry = nodesCount;
    const dominators = new Uint32Array(nodesCount);
    for (let i = 0; i < rootPostOrderedIndex; ++i) {
      dominators[i] = noEntry;
    }
    dominators[rootPostOrderedIndex] = rootPostOrderedIndex;

    // The affected array is used to mark entries which dominators
    // have to be racalculated because of changes in their retainers.
    const affected = new Uint8Array(nodesCount);
    let node: V8SnapshotInfoNode;

    // Mark the root direct children as affected.
    this.edges[this.root_id]?.forEach((edge) => {
      if (!this.isEssentialEdge(this.root_id, edge.type)) {
        return;
      }
      affected[this.nodeId2PostOrderIndex[edge.to_node]] = 1;
    });

    let changed = true;
    while (changed) {
      changed = false;
      for (let postOrderIndex = rootPostOrderedIndex - 1; postOrderIndex >= 0; --postOrderIndex) {
        if (affected[postOrderIndex] === 0) {
          continue;
        }
        affected[postOrderIndex] = 0;
        // If dominator of the entry has already been set to root,
        // then it can't propagate any further.
        if (dominators[postOrderIndex] === rootPostOrderedIndex) {
          continue;
        }
        node = this.nodes[this.postOrderIndex2NodeId[postOrderIndex]];
        const nodeFlag = ((node.flag) & flag);
        let newDominatorIndex: number = noEntry;
        let orphanNode = true;
        let node_from: V8SnapshotInfoNode;
        this.edges_to[node.id]?.some((edge) => {
          node_from = this.nodes[edge.from_node];
          if (!this.isEssentialEdge(edge.from_node, edge.type)) {
            return false;
          }
          orphanNode = false;
          const retainerNodeFlag = ((node_from.flag) & flag);
          // We are skipping the edges from non-page-owned nodes to page-owned nodes.
          // Otherwise the dominators for the objects that also were retained by debugger would be affected.
          if (node_from.id !== this.root_id && nodeFlag && !retainerNodeFlag) {
            return false;
          }
          let retanerPostOrderIndex: number = this.nodeId2PostOrderIndex[node_from.id];
          if (dominators[retanerPostOrderIndex] !== noEntry) {
            if (newDominatorIndex === noEntry) {
              newDominatorIndex = retanerPostOrderIndex;
            } else {
              while (retanerPostOrderIndex !== newDominatorIndex) {
                while (retanerPostOrderIndex < newDominatorIndex) {
                  retanerPostOrderIndex = dominators[retanerPostOrderIndex];
                }
                while (newDominatorIndex < retanerPostOrderIndex) {
                  newDominatorIndex = dominators[newDominatorIndex];
                }
              }
            }
            // If idom has already reached the root, it doesn't make sense
            // to check other retainers.
            if (newDominatorIndex === rootPostOrderedIndex) {
              return true;
            }
          }
          return false;
        });
        // Make root dominator of orphans.
        if (orphanNode) {
          newDominatorIndex = rootPostOrderedIndex;
        }
        if (newDominatorIndex !== noEntry && dominators[postOrderIndex] !== newDominatorIndex) {
          dominators[postOrderIndex] = newDominatorIndex;
          changed = true;
          const nodeId = this.postOrderIndex2NodeId[postOrderIndex];
          this.edges[nodeId]?.forEach((edge) => {
            affected[this.nodeId2PostOrderIndex[edge.to_node]] = 1;
          });
        }
      }
    }

    for (let postOrderIndex = 0, l = dominators.length; postOrderIndex < l; ++postOrderIndex) {
      const nodeId = this.postOrderIndex2NodeId[postOrderIndex];
      this.dominatorsTree[nodeId] = this.postOrderIndex2NodeId[dominators[postOrderIndex]];
    }
  };

  private buildDominatedNodes = () => {
    // Builds up two arrays:
    //  - "dominatedNodes" is a continuous array, where each node owns an
    //    interval (can be empty) with corresponding dominated nodes.
    //  - "indexArray" is an array of indexes in the "dominatedNodes"
    //    with the same positions as in the _nodeIndex.
    // const indexArray = this.firstDominatedNodeIndex; // new Uint32Array(this.nodeCount + 1)
    const indexArray = new Uint32Array(this.node_list.length + 1);
    // All nodes except the root have dominators.
    // const dominatedNodes = this.dominatedNodes; // new Uint32Array(this.nodeCount - 1);
    const dominatedNodes = new Uint32Array(this.node_list.length - 1);

    // Count the number of dominated nodes for each node. Skip the root (node at
    // index 0) as it is the only node that dominates itself.
    const { dominatorsTree } = this;

    let fromNodeOrdinal = 0;
    let toNodeOrdinal: number = this.node_list.length;
    const rootNodeOrdinal = this.nodes[this.root_id].idx;
    if (rootNodeOrdinal === fromNodeOrdinal) {
      fromNodeOrdinal = 1;
    } else if (rootNodeOrdinal === toNodeOrdinal - 1) {
      toNodeOrdinal -= 1;
    } else {
      throw new Error('Root node is expected to be either first or last');
    }
    for (let nodeOrdinal = fromNodeOrdinal; nodeOrdinal < toNodeOrdinal; ++nodeOrdinal) {
      ++indexArray[this.nodes[dominatorsTree[this.node_list[nodeOrdinal].id]].idx];
    }
    // Put in the first slot of each dominatedNodes slice the count of entries
    // that will be filled.
    let firstDominatedNodeIndex = 0;
    for (let i = 0, l = this.node_list.length; i < l; ++i) {
      const dominatedCount = dominatedNodes[firstDominatedNodeIndex] = indexArray[i];
      indexArray[i] = firstDominatedNodeIndex;
      firstDominatedNodeIndex += dominatedCount;
    }
    indexArray[this.node_list.length] = dominatedNodes.length;
    // Fill up the dominatedNodes array with indexes of dominated nodes. Skip the root (node at
    // index 0) as it is the only node that dominates itself.
    for (let nodeOrdinal = fromNodeOrdinal; nodeOrdinal < toNodeOrdinal; ++nodeOrdinal) {
      const dominatorOrdinal = this.nodes[dominatorsTree[this.node_list[nodeOrdinal].id]].idx;
      let dominatedRefIndex = indexArray[dominatorOrdinal];
      dominatedRefIndex += (--dominatedNodes[dominatedRefIndex]);
      dominatedNodes[dominatedRefIndex] = nodeOrdinal;
    }
    this.firstDominatedNodeIndex = indexArray;
    this.dominatedNodes = dominatedNodes;
  };

  // 统计类数量
  private buildAggregates = (filter?: (node: V8SnapshotInfoNode) => (boolean)) => {
    const classIndexes = [];

    this.node_list.forEach((node, index) => {
      if (filter && !filter(node)) {
        return;
      }
      if (!node.self_size && node.type !== V8SnapshotNodeTypes.native) {
        return;
      }
      const classIndex = this.getNodeClassIndex(index);
      if (!(classIndex in this.aggregatesByClassIndex)) {
        // 新增
        const value: V8SnapshotInfoAggregatedInfo = {
          count: 1,
          distance: node[V8SnapshotInfoNodeFields.distance],
          self: node[V8SnapshotNodeFields.self_size],
          maxRet: 0,
          type: node.type,
          name: node.type === V8SnapshotNodeTypes.object || node.type === V8SnapshotNodeTypes.native ? node.name : null,
          idxs: [index],
        };
        this.aggregatesByClassIndex[classIndex] = value;
        classIndexes.push(classIndex);
        this.aggregatesByClassName[node.name] = value;
      } else {
        // 已有
        const clss = this.aggregatesByClassIndex[classIndex];
        if (!clss) {
          return;
        }
        clss.distance = Math.min(clss.distance, node.distance);
        ++clss.count;
        clss.self += node.self_size;
        clss.idxs.push(index);
      }
    });
  };

  private calculateClassesRetainedSize = (filter?: ((node: V8SnapshotInfoNode) => boolean)) => {
    const list: number[] = [this.nodes[this.root_id].idx];
    const sizes = [-1];
    const classes = [];

    const seenClassNameIndexes: Record<number, boolean> = {};

    while (list.length) {
      const nodeIndex = (list.pop()) as number;
      let classIndex = this.getNodeClassIndex(nodeIndex);
      const seen = (seenClassNameIndexes[classIndex]);
      const node = this.node_list[nodeIndex]!;
      const dominatedIndexFrom = this.firstDominatedNodeIndex[node.idx];
      const dominatedIndexTo = this.firstDominatedNodeIndex[node.idx + 1];

      if (!seen && (!filter || filter(node))
            && (node.self_size || node.type === V8SnapshotNodeTypes.native)) {
        this.aggregatesByClassIndex[classIndex].maxRet += node.retained_size;
        if (dominatedIndexFrom !== dominatedIndexTo) {
          seenClassNameIndexes[classIndex] = true;
          sizes.push(list.length);
          classes.push(classIndex);
        }
      }
      for (let i = dominatedIndexFrom; i < dominatedIndexTo; i++) {
        list.push(this.dominatedNodes[i]);
      }

      const l = list.length;
      while (sizes[sizes.length - 1] === l) {
        sizes.pop();
        classIndex = (classes.pop() as number);
        seenClassNameIndexes[classIndex] = false;
      }
    }
  };

  // 获取class名称序号
  private getNodeClassIndex = (nodeIndex: number) => {
    const node = this.node_list[nodeIndex];
    const type = node[V8SnapshotNodeFields.type];
    if (type === V8SnapshotNodeTypes.object || type === V8SnapshotNodeTypes.native) {
      return this.snapshot.nodes[nodeIndex * this.node_field_count + this.node_fields_idx[V8SnapshotNodeFields.name]];
    }
    return -1 - this.snapshot.nodes[nodeIndex * this.node_field_count + this.node_fields_idx[V8SnapshotNodeFields.type]];
  };
}

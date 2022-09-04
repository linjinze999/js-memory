<template>
  <div>
    <!-- 1. 文件选择 -->
    <el-card>
      <V8Snapshot-V8SnapshotFiles/>
    </el-card>
    <br/>
    <!-- 3. 控制/包含 视图 -->
    <el-card>
      <!-- 3.1 标题 -->
      <div slot="header" style="display: flex; flex-direction: row; align-items: center;">
        <div v-if="activeSnapshot">{{ activeSnapshot.name }}</div>
        <div v-else>未选择</div>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <el-select
            v-model="compareSnapshotId"
            placeholder="选择对比视图"
            clearable
            size="mini"
        >
          <el-option
              v-for="item in compareSnapshotList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div>
        <!-- 3.2 表格树 -->
        <div v-if="!activeSnapshot">未选择</div>
        <div v-else-if="!activeSnapshot.snapshot" v-loading="true">解析中...</div>
        <el-table
            v-else
            :data="rootList"
            row-key="rowKey"
            style="width: 100%"
            :max-height="500"
            size="small"
            lazy
            :load="load"
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
            :header-cell-style="{backgroundColor: '#f5f7fa'}"
            highlight-current-row
            @current-change="handleCurrentChange"
        >
          <el-table-column prop="name" sortable label="构造函数">
            <template slot-scope="scope">
              <span v-if="scope.row.nameShowPrefix" :style="scope.row.nameShowPrefixStyle">
                {{ scope.row.nameShowPrefix }}
              </span>
              <span v-if="scope.row.nameShowPrefix">&nbsp;::&nbsp;</span>
              <span :style="scope.row.nameShowStyle">
                {{ scope.row.nameShow }}
              </span>
              <span v-if="scope.row.id" class="sub-text">&nbsp;@{{ scope.row.id }}</span>
              <span v-else-if="scope.row.count > 1"
                    class="sub-text">&nbsp;x{{ scope.row.count }}</span>
              <span
                  v-if="scope.row.reachableFromWindow"
                  title="可通过window访问的用户对象"
              > 🀆</span>
              <span
                  v-if="scope.row.detachedDOMTreeNode"
                  title="脱离Dom树"
              > 🀆</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="addedCount"
              sortable
              label="新增数量"
              align="right"
              width="150px"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.addedCount }}</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="removedCount"
              sortable
              label="删除数量"
              align="right"
              width="150px"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.removedCount }}</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="countDelta"
              sortable
              label="增量"
              align="right"
              width="150px"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.countDelta > 0">+</span>
              <span>{{ scope.row.countDelta }}</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="addedSize"
              sortable
              label="新增大小"
              align="right"
              width="150px"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.addedSize }}</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="removedSize"
              sortable
              label="删除大小"
              align="right"
              width="150px"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.removedSize }}</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="sizeDelta"
              sortable
              label="大小增量"
              align="right"
              width="150px"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.sizeDelta > 0">+</span>
              <span>{{ scope.row.sizeDelta }}</span>
            </template>
          </el-table-column>
        </el-table>
        <br/>
        <el-tabs type="border-card">
          <!-- 3.3 保留器 -->
          <el-tab-pane label="父节点">
            <el-table
                v-if="currentNode"
                :data="currentNodeParents"
                row-key="rowKey"
                style="width: 100%"
                :max-height="500"
                size="small"
                lazy
                :load="loadParents"
                :tree-props="{children: 'parents', hasChildren: 'hasParents'}"
                :header-cell-style="{backgroundColor: '#f5f7fa'}"
            >
              <el-table-column prop="name" sortable label="对象">
                <template slot-scope="scope">
                  <span :style="scope.row.nameShowPrefixStyle">
                    {{ scope.row.nameShowPrefix }}
                  </span>
                  <span>&nbsp;::&nbsp;</span>
                  <span :style="scope.row.nameShowStyle">
                    {{ scope.row.nameShow }}
                  </span>
                  <span class="sub-text">&nbsp;@{{ scope.row.id }}</span>
                  <span
                      v-if="scope.row.reachableFromWindow"
                      title="可通过window访问的用户对象"
                  >&nbsp;🀆</span>
                  <span
                      v-if="scope.row.detachedDOMTreeNode"
                      title="脱离Dom树"
                  >&nbsp;🀆</span>
                </template>
              </el-table-column>
              <el-table-column
                  prop="distance"
                  sortable
                  label="最短根距离"
                  align="right"
                  width="150px"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.distanceShow }}</span>
                </template>
              </el-table-column>
              <el-table-column
                  prop="self_size"
                  sortable label="自身大小"
                  align="right"
                  width="150px"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.self_size }}</span>
                  <span class="sub-text">&nbsp;&nbsp;{{ scope.row.selfSizePercent }}%</span>
                </template>
              </el-table-column>
              <el-table-column
                  prop="retained_size"
                  sortable label="总大小"
                  align="right"
                  width="150px"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.retained_size }}</span>
                  <span class="sub-text">&nbsp;&nbsp;{{ scope.row.retainedSizePercent }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import {
  diffShowType,
  getNodeShowInfo,
  nodeFilterOptions,
  nodeFilterType,
} from './utils';

const { mapGetters, mapState } = createNamespacedHelpers('V8Snapshot');

export default {
  name: 'V8SnapshotComparison',
  data() {
    return {
      compareSnapshotId: null,
      nodeFilterSelect: nodeFilterType.all,
      // nodeFilterTypesSelect: [],
      nodeFilterName: '',
      nodeFilterForm: {
        nodeFilterSelect: nodeFilterType.all,
      },
      nodeFilterType,
      currentNode: null,
      nodeFilterOptions,
      // nodeFilterTypeOptions,
      rootId: -1,
    };
  },
  computed: {
    rootList() {
      if (!this.activeSnapshot || !this.activeSnapshot.snapshot
          || !this.compareSnapshot || !this.compareSnapshot.snapshot) {
        return [];
      }
      const diffMap = this.activeSnapshot.snapshot
        .calculateSnapshotDiff(this.compareSnapshot.snapshot);
      return Object.keys(diffMap).map((className) => ({
        ...diffMap[className],
        nameShow: className,
        rowKey: className,
        hasChildren: true,
        level: 1,
      }));
    },
    totalSize() {
      return (this.activeSnapshot
              && this.activeSnapshot.snapshot
              && this.activeSnapshot.snapshot.calculateStatistics().total)
          || 9999999999;
    },
    compareTotalSize() {
      return (this.compareSnapshot
              && this.compareSnapshot.snapshot
              && this.compareSnapshot.snapshot.calculateStatistics().total)
          || 9999999999;
    },
    compareSnapshotList() {
      return this.snapshotList.filter((snapshot) => snapshot.id !== this.activeId);
    },
    compareSnapshot() {
      return this.compareSnapshotId
          && this.snapshotList.find((snapshot) => snapshot.id === this.compareSnapshotId);
    },
    currentNodeParents() {
      return this.currentNode ? this.getNodeParents(this.currentNode.nodeId) : [];
    },
    ...mapState(['snapshotList', 'activeId']),
    ...mapGetters(['activeSnapshot']),
  },
  methods: {
    load(tree, treeNode, resolve) {
      if (!this.activeSnapshot || !this.activeSnapshot.snapshot
          || !this.compareSnapshot || !this.compareSnapshot.snapshot) {
        resolve([]);
        return;
      }
      if (tree.className) {
        const level = 2;
        const addedNodes = tree.addedIds
          .map((id, index) => {
            const node = this.activeSnapshot.snapshot.snapshot_info.nodes[id];
            const children = this.activeSnapshot.snapshot
              .getNodeChildren(node.id);
            return {
              ...getNodeShowInfo({
                node,
                totalSize: this.totalSize,
              }),
              nodeId: node.id,
              removedCount: '',
              removedSize: '',
              addedCount: '△',
              addedSize: node.self_size,
              countDelta: '',
              sizeDelta: '',
              level,
              type: diffShowType.added,
              rowKey: `${diffShowType.added}_${level}_${index}_${node.id}`,
              hasChildren: !!children.length,
            };
          });
        const removedNodes = tree.deletedIds
          .map((id, index) => {
            const node = this.compareSnapshot.snapshot.snapshot_info.nodes[id];
            const children = this.compareSnapshot.snapshot
              .getNodeChildren(node.id);
            return {
              ...getNodeShowInfo({
                node,
                totalSize: this.compareTotalSize,
              }),
              nodeId: node.id,
              removedCount: '△',
              removedSize: node.self_size,
              addedCount: '',
              addedSize: '',
              countDelta: '',
              sizeDelta: '',
              level,
              type: diffShowType.removed,
              rowKey: `${diffShowType.removed}_${level}_${index}_${node.id}`,
              hasChildren: !!children.length,
            };
          });
        resolve([].concat([], addedNodes, removedNodes));
      } else {
        const result = this.getNodeChildren(tree);
        resolve(result);
      }
    },
    onFilter() {
      this.currentNode = null;
      this.rootId -= 1;
    },
    filterItem() {
      return true;
    },
    getNodeChildren(tree) {
      let snapshot;
      let totalSize;
      const level = tree.level + 1;
      if (tree.type === diffShowType.added) {
        if ((!this.activeSnapshot || !this.activeSnapshot.snapshot)) {
          return [];
        }
        snapshot = this.activeSnapshot.snapshot;
        totalSize = this.totalSize;
      } else {
        if ((!this.compareSnapshot || !this.compareSnapshot.snapshot)) {
          return [];
        }
        snapshot = this.compareSnapshot.snapshot;
        totalSize = this.compareTotalSize;
      }
      return snapshot
        .getNodeChildren(tree.nodeId)
        .map((item) => {
          const {
            node,
            edge,
          } = item;
          const children = snapshot
            .getNodeChildren(node.id)
            .filter((v) => this.filterItem(v));
          return {
            ...getNodeShowInfo({
              node,
              edge,
              totalSize,
            }),
            level,
            rowKey: `${level}_${tree.type}_${(edge ? edge.idx : '')}_${node.id}`,
            hasChildren: !!children.length,
            nodeId: node.id,
            removedCount: tree.type === diffShowType.added ? '' : '△',
            removedSize: tree.type === diffShowType.added ? '' : node.self_size,
            addedCount: tree.type === diffShowType.added ? '△' : '',
            addedSize: tree.type === diffShowType.added ? node.self_size : '',
            countDelta: '',
            sizeDelta: '',
            type: tree.type,
          };
        });
    },
    loadParents(tree, treeNode, resolve) {
      if (this.currentNode.type === diffShowType.added) {
        if (!this.activeSnapshot || !this.activeSnapshot.snapshot) {
          resolve([]);
          return;
        }
      } else if (!this.compareSnapshot || !this.compareSnapshot.snapshot) {
        resolve([]);
        return;
      }
      const result = this.getNodeParents(tree.nodeId);
      resolve(result);
    },
    getNodeParents(nodeId) {
      let snapshot;
      let totalSize;
      if (this.currentNode.type === diffShowType.added) {
        if (!this.activeSnapshot || !this.activeSnapshot.snapshot) {
          return [];
        }
        snapshot = this.activeSnapshot.snapshot;
        totalSize = this.totalSize;
      } else {
        if (!this.compareSnapshot || !this.compareSnapshot.snapshot) {
          return [];
        }
        snapshot = this.compareSnapshot.snapshot;
        totalSize = this.compareTotalSize;
      }
      return snapshot
        .getNodeParents(nodeId)
        .filter((item) => this.filterItem(item))
        .map((item) => {
          const {
            node,
            edge,
          } = item;
          const parents = snapshot.getNodeParents(node.id);
          // .filter((v) => this.filterItem(v));
          return {
            ...getNodeShowInfo({
              node,
              edge,
              totalSize,
            }),
            nodeId: node.id,
            rowKey: `${edge ? edge.idx : ''}_${edge ? edge.from_node : node.id}`,
            hasParents: !!(parents.length),
          };
        });
    },
    handleCurrentChange(currentRow) {
      if (currentRow.className) {
        return;
      }
      this.currentNode = currentRow;
    },
  },
};
</script>

<style scoped lang="scss">

</style>

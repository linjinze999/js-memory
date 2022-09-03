<template>
  <div>
    <!-- 1. 文件选择 -->
    <el-card>
      <V8Snapshot-V8SnapshotFiles/>
    </el-card>
    <br/>
    <!-- 2. 选择条件 -->
    <el-card>
      <div slot="header">
        <div>节点过滤</div>
      </div>
      <el-form :inline="true" size="small" :model="nodeFilterForm">
        <el-form-item label="节点类型">
          <el-select
              v-model="nodeFilterForm.nodeFilterSelect"
              placeholder="请选择"
              style="width: 130px;"
          >
            <el-option
                v-for="item in nodeFilterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <!--          <el-select-->
          <!--              v-if="nodeFilterForm.nodeFilterSelect === nodeFilterType.customize"-->
          <!--              v-model="nodeFilterForm.nodeFilterTypesSelect"-->
          <!--              placeholder="请选择"-->
          <!--              multiple-->
          <!--              clearable-->
          <!--          >-->
          <!--            <el-option-->
          <!--                v-for="item in nodeFilterTypeOptions"-->
          <!--                :key="item"-->
          <!--                :label="item"-->
          <!--                :value="item">-->
          <!--            </el-option>-->
          <!--          </el-select>-->
        </el-form-item>
        <el-form-item label="名称">
          <el-input
              placeholder="正则表达式"
              v-model="nodeFilterForm.nodeFilterName"
              clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="最短根距离">
          <div>
            <el-input
                type="number"
                placeholder="大于等于"
                v-model="nodeFilterForm.nodeFilterDistanceMin"
                clearable
                style="width: 130px"
            >
            </el-input>
            -
            <el-input
                type="number"
                placeholder="小于"
                v-model="nodeFilterForm.nodeFilterDistanceMax"
                clearable
                style="width: 130px">
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="自身大小">
          <div>
            <el-input
                type="number"
                placeholder="大于等于"
                v-model="nodeFilterForm.nodeFilterSelfSizeMin"
                clearable
                style="width: 130px">
            </el-input>
            -
            <el-input
                type="number"
                placeholder="小于"
                v-model="nodeFilterForm.nodeFilterSelfSizeMax"
                clearable
                style="width: 130px">
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="总大小">
          <div>
            <el-input
                type="number"
                placeholder="大于等于"
                v-model="nodeFilterForm.nodeFilterRetainedSizeMin"
                clearable
                style="width: 130px">
            </el-input>
            -
            <el-input
                type="number"
                placeholder="小于"
                v-model="nodeFilterForm.nodeFilterRetainedSizeMax"
                clearable
                style="width: 130px">
            </el-input>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onFilter">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <br/>
    <!-- 3. 控制/包含 视图 -->
    <el-card>
      <!-- 3.1 标题 -->
      <div slot="header">
        <div v-if="activeSnapshot">{{ activeSnapshot.name }}</div>
        <div v-else>未选择</div>
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
          <el-table-column prop="name" sortable label="对象">
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
              sortable
              label="自身大小"
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
              sortable
              label="总大小"
              align="right"
              width="150px"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.retained_size }}</span>
              <span class="sub-text">&nbsp;&nbsp;{{ scope.row.retainedSizePercent }}%</span>
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
  filterUserObject,
  getNodeShowInfo, getNodeShowInfoByClass,
  nodeFilterOptions,
  nodeFilterType,
  V8SnapshotInfo,
} from './utils';

const { mapGetters } = createNamespacedHelpers('V8Snapshot');

export default {
  name: 'V8SnapshotSummary',
  data() {
    return {
      nodeFilterSelect: nodeFilterType.all,
      // nodeFilterTypesSelect: [],
      nodeFilterName: '',
      nodeFilterDistanceMin: null,
      nodeFilterDistanceMax: null,
      nodeFilterSelfSizeMin: null,
      nodeFilterSelfSizeMax: null,
      nodeFilterRetainedSizeMin: null,
      nodeFilterRetainedSizeMax: null,
      nodeFilterForm: {
        nodeFilterSelect: nodeFilterType.all,
        // nodeFilterTypesSelect: [],
        nodeFilterName: '',
        nodeFilterDistanceMin: null,
        nodeFilterDistanceMax: null,
        nodeFilterSelfSizeMin: null,
        nodeFilterSelfSizeMax: null,
        nodeFilterRetainedSizeMin: null,
        nodeFilterRetainedSizeMax: null,
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
      if (!this.activeSnapshot || !this.activeSnapshot.snapshot) {
        return [];
      }
      return (this.activeSnapshot.snapshot.getClassList()).map((_class) => getNodeShowInfoByClass({
        _class,
        totalSize: this.totalSize,
      }));
    },
    totalSize() {
      return (this.activeSnapshot
              && this.activeSnapshot.snapshot
              && this.activeSnapshot.snapshot.calculateStatistics().total)
          || 9999999999;
    },
    currentNodeParents() {
      return this.currentNode ? this.getNodeParents(this.currentNode.id) : [];
    },
    ...mapGetters(['activeSnapshot']),
  },
  methods: {
    load(tree, treeNode, resolve) {
      if (!this.activeSnapshot || !this.activeSnapshot.snapshot) {
        resolve([]);
        return;
      }
      if (tree.idxs) {
        const result = tree.idxs
          .map((idx) => ({
            classIdx: tree.idx,
            node: this.activeSnapshot.snapshot.snapshot_info.nodes[idx],
          }))
          .filter((item) => this.filterItem(item))
          .map((item, index) => {
            const {
              node,
              classIdx,
            } = item;
            const children = this.activeSnapshot.snapshot
              .getNodeChildren(node.id)
              .filter((v) => this.filterItem(v));
            return {
              ...getNodeShowInfo({
                node,
                totalSize: this.totalSize,
              }),
              level: 1,
              rowKey: `${classIdx}_${index}_${node.id}`,
              hasChildren: !!children.length,
            };
          });
        resolve(result);
      } else {
        const result = this.getNodeChildren(tree.id, (tree.level || 1) + 1);
        resolve(result);
      }
    },
    onFilter() {
      this.nodeFilterSelect = this.nodeFilterForm.nodeFilterSelect;
      // this.nodeFilterTypesSelect = [].concat(
      //   [],
      //   this.nodeFilterForm.nodeFilterTypesSelect,
      // );
      this.nodeFilterName = this.nodeFilterForm.nodeFilterName
          && new RegExp(this.nodeFilterForm.nodeFilterName);
      this.nodeFilterDistanceMin = this.nodeFilterForm.nodeFilterDistanceMin;
      this.nodeFilterDistanceMax = this.nodeFilterForm.nodeFilterDistanceMax;
      this.nodeFilterSelfSizeMin = this.nodeFilterForm.nodeFilterSelfSizeMin;
      this.nodeFilterSelfSizeMax = this.nodeFilterForm.nodeFilterSelfSizeMax;
      this.nodeFilterRetainedSizeMin = this.nodeFilterForm.nodeFilterRetainedSizeMin;
      this.nodeFilterRetainedSizeMax = this.nodeFilterForm.nodeFilterRetainedSizeMax;
      this.currentNode = null;
      this.rootId -= 1;
    },
    filterItem(item) {
      if (!item || !item.node) {
        return false;
      }
      if (this.nodeFilterSelect === nodeFilterType.userObject
          && !filterUserObject(item)) {
        return false;
      }
      if (this.nodeFilterSelect === nodeFilterType.showObject
          && !(item.node.flag & V8SnapshotInfo.NODE_FLAGS.canBeQueried)) {
        return false;
      }
      // if (this.nodeFilterSelect === nodeFilterType.customize
      //     && !this.nodeFilterTypesSelect.includes(item.node.type)) {
      //   return false;
      // }
      if (this.nodeFilterName && !this.nodeFilterName.test(item.node.name)) {
        return false;
      }
      if ((this.nodeFilterDistanceMin || this.nodeFilterDistanceMin === 0)
          && item.node.distance < this.nodeFilterDistanceMin) {
        return false;
      }
      if ((this.nodeFilterDistanceMax || this.nodeFilterDistanceMax === 0)
          && item.node.distance >= this.nodeFilterDistanceMax) {
        return false;
      }
      if ((this.nodeFilterSelfSizeMin || this.nodeFilterSelfSizeMin === 0)
          && item.node.self_size < this.nodeFilterSelfSizeMin) {
        return false;
      }
      if ((this.nodeFilterSelfSizeMax || this.nodeFilterSelfSizeMax === 0)
          && item.node.self_size >= this.nodeFilterSelfSizeMax) {
        return false;
      }
      if ((this.nodeFilterRetainedSizeMin || this.nodeFilterRetainedSizeMin === 0)
          && item.node.retained_size < this.nodeFilterRetainedSizeMin) {
        return false;
      }
      if ((this.nodeFilterRetainedSizeMax || this.nodeFilterRetainedSizeMax === 0)
          && item.node.retained_size >= this.nodeFilterRetainedSizeMax) {
        return false;
      }
      return true;
    },
    getNodeChildren(nodeId, level) {
      if (!this.activeSnapshot || !this.activeSnapshot.snapshot) {
        return [];
      }
      return this.activeSnapshot.snapshot
        .getNodeChildren(nodeId)
        .filter((item) => this.filterItem(item))
        .map((item) => {
          const {
            node,
            edge,
            classIdx,
          } = item;
          const children = this.activeSnapshot.snapshot
            .getNodeChildren(node.id)
            .filter((v) => this.filterItem(v));
          return {
            ...getNodeShowInfo({
              node,
              edge,
              totalSize: this.totalSize,
            }),
            level,
            rowKey: `${level}_${classIdx || ''}_${(edge ? edge.idx : '')}_${node.id}`,
            hasChildren: !!children.length,
          };
        });
    },
    loadParents(tree, treeNode, resolve) {
      if (!this.activeSnapshot || !this.activeSnapshot.snapshot) {
        resolve([]);
        return;
      }
      const result = this.getNodeParents(tree.id);
      resolve(result);
    },
    getNodeParents(nodeId) {
      if (!this.activeSnapshot || !this.activeSnapshot.snapshot) {
        return [];
      }
      return this.activeSnapshot.snapshot
        .getNodeParents(nodeId)
        .filter((item) => this.filterItem(item))
        .map((item) => {
          const {
            node,
            edge,
          } = item;
          const parents = this.activeSnapshot.snapshot
            .getNodeParents(node.id);
          // .filter((v) => this.filterItem(v));
          return {
            ...getNodeShowInfo({
              node,
              edge,
              totalSize: this.totalSize,
            }),
            rowKey: `${edge ? edge.idx : ''}_${edge ? edge.from_node : node.id}`,
            hasParents: !!(parents.length),
          };
        });
    },
    handleCurrentChange(currentRow) {
      if (!currentRow.id) {
        return;
      }
      this.currentNode = currentRow;
    },
  },
};
</script>

<style scoped lang="scss">
.sub-text {
  color: #909399;
}

.name {
  color: rgb(136, 18, 128);
}
</style>

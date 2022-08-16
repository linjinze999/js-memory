<template>
  <div>
    <!-- 1. 文件选择 -->
    <el-card>
      <V8Snapshot-V8SnapshotFiles/>
    </el-card>
    <br/>
    <el-card>
      <div slot="header">
        <div>节点过滤</div>
      </div>
      <el-form :inline="true">
        <el-form-item label="节点类型">
          <el-select v-model="nodeFilterSelect" placeholder="请选择">
            <el-option
                v-for="item in nodeFilterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <el-select
              v-if="nodeFilterSelect === nodeFilterType.customize"
              v-model="nodeFilterTypesSelect"
              placeholder="请选择"
              multiple
          >
            <el-option
                v-for="item in nodeFilterTypeOptions"
                :key="item"
                :label="item"
                :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input
              placeholder="请输入内容"
              v-model="nodeFilterName"
              clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="最短根距离">
          <el-input
              type="number"
              placeholder="请输入内容"
              v-model="nodeFilterDistanceMin"
              clearable>
          </el-input>
          -
          <el-input
              type="number"
              placeholder="请输入内容"
              v-model="nodeFilterDistanceMax"
              clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="自身大小">
          <el-input
              type="number"
              placeholder="请输入内容"
              v-model="nodeFilterSelfSizeMin"
              clearable>
          </el-input>
          -
          <el-input
              type="number"
              placeholder="请输入内容"
              v-model="nodeFilterSelfSizeMax"
              clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="总大小">
          <el-input
              type="number"
              placeholder="请输入内容"
              v-model="nodeFilterRetainedSizeMin"
              clearable>
          </el-input>
          -
          <el-input
              type="number"
              placeholder="请输入内容"
              v-model="nodeFilterRetainedSizeMax"
              clearable>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>
    <br/>
    <!-- 2. 控制/包含 视图 -->
    <el-card>
      <!-- 2.1 标题 -->
      <div slot="header">
        <div v-if="activeSnapshot">{{activeSnapshot.name}}</div>
        <div v-else>未选择</div>
      </div>
      <div>
        <!-- 2.2 表格树 -->
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
              <span :style="scope.row.nameShowPrefixStyle">
                {{ scope.row.nameShowPrefix }}
              </span>
              <span>&nbsp;::&nbsp;</span>
              <span :style="scope.row.nameShowStyle">
                {{ scope.row.nameShow }}
              </span>
              <span class="sub-text">&nbsp;@{{scope.row.id}}</span>
              <span v-if="scope.row.reachableFromWindow" title="可通过window访问的用户对象"> 🀆</span>
              <span v-if="scope.row.detachedDOMTreeNode" title="脱离Dom树"> 🀆</span>
            </template>
          </el-table-column>
          <el-table-column prop="distance" sortable label="最短根距离" align="right">
            <template slot-scope="scope">
              <span>{{ scope.row.distanceShow }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="self_size" sortable label="自身大小" align="right">
            <template slot-scope="scope">
              <span>{{ scope.row.self_size }}</span>
              <span class="sub-text">&nbsp;&nbsp;{{scope.row.selfSizePercent}}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="retained_size" sortable label="总大小" align="right">
            <template slot-scope="scope">
              <span>{{ scope.row.retained_size }}</span>
              <span class="sub-text">&nbsp;&nbsp;{{scope.row.retainedSizePercent}}%</span>
            </template>
          </el-table-column>
        </el-table>
        <br/>
        <el-tabs type="border-card">
          <!-- 2.3 保留器 -->
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
                  <span class="sub-text">&nbsp;@{{scope.row.id}}</span>
                  <span v-if="scope.row.reachableFromWindow" title="可通过window访问的用户对象"> 🀆</span>
                  <span v-if="scope.row.detachedDOMTreeNode" title="脱离Dom树"> 🀆</span>
                </template>
              </el-table-column>
              <el-table-column prop="distance" sortable label="最短根距离" align="right">
                <template slot-scope="scope">
                  <span>{{ scope.row.distanceShow }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="self_size" sortable label="自身大小" align="right">
                <template slot-scope="scope">
                  <span>{{ scope.row.self_size }}</span>
                  <span class="sub-text">&nbsp;&nbsp;{{scope.row.selfSizePercent}}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="retained_size" sortable label="总大小" align="right">
                <template slot-scope="scope">
                  <span>{{ scope.row.retained_size }}</span>
                  <span class="sub-text">&nbsp;&nbsp;{{scope.row.retainedSizePercent}}%</span>
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
import { getNodeShowInfo, nodeFilterOptions, nodeFilterType, nodeFilterTypeOptions } from './utils';
const { mapGetters } = createNamespacedHelpers('V8Snapshot');

export default {
  name: "V8SnapshotContainment",
  data(){
    return {
      nodeFilterDistanceMin: null,
      nodeFilterDistanceMax: null,
      nodeFilterSelfSizeMin: null,
      nodeFilterSelfSizeMax: null,
      nodeFilterRetainedSizeMin: null,
      nodeFilterRetainedSizeMax: null,
      nodeFilterName: "",
      nodeFilterType,
      nodeFilterSelect: nodeFilterType.userObject,
      currentNode: null,
      nodeFilterOptions,
      nodeFilterTypeOptions,
      nodeFilterTypesSelect: []
    };
  },
  computed: {
    rootList(){
      return this.getNodeChildren();
    },
    totalSize(){
      return ( this.activeSnapshot && this.activeSnapshot.snapshot && this.activeSnapshot.snapshot.calculateStatistics().total) || 9999999999;
    },
    currentNodeParents(){
      return this.currentNode ? this.getNodeParents(this.currentNode.id) : [];
    },
    ...mapGetters(["activeSnapshot"])
  },
  methods: {
    load(tree, treeNode, resolve) {
      if(!this.activeSnapshot || !this.activeSnapshot.snapshot){
        resolve([]);
        return;
      }
      const result = this.getNodeChildren(tree.id );
      resolve(result);
    },
    getNodeChildren(nodeId){
      if(!this.activeSnapshot || !this.activeSnapshot.snapshot){
        return [];
      }
      return this.activeSnapshot.snapshot.getNodeChildren(nodeId).map((item) => {
        const {node, edge} = item;
        const edges = this.activeSnapshot.snapshot.snapshot_info.edges[node.id];
        return {
          ...getNodeShowInfo({node, edge, totalSize: this.totalSize}),
          rowKey: `${edge.name_or_index}_${edge.to_node}`,
          hasChildren: !!(edges && edges.length)
        }
      });
    },
    loadParents(tree, treeNode, resolve) {
      if(!this.activeSnapshot || !this.activeSnapshot.snapshot){
        resolve([]);
        return;
      }
      const result = this.getNodeParents(tree.id);
      resolve(result);
    },
    getNodeParents(nodeId){
      if(!this.activeSnapshot || !this.activeSnapshot.snapshot){
        return [];
      }
      return this.activeSnapshot.snapshot.getNodeParents(nodeId).map((item) => {
        const {node, edge} = item;
        const edges = this.activeSnapshot.snapshot.snapshot_info.edges_to[node.id];
        return {
          ...getNodeShowInfo({node, edge, totalSize: this.totalSize}),
          rowKey: `${edge.name_or_index}_${edge.from_node}`,
          hasParents: !!(edges && edges.length)
        }
      });
    },
    handleCurrentChange(currentRow, oldCurrentRow){
      this.currentNode = currentRow;
    }
  }
}
</script>

<style scoped lang="scss">
.sub-text {
  color: #909399;
}
.name {
  color: rgb(136,18,128);
}
</style>

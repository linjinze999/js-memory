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
        <el-form-item label="名称">
          <el-input
              placeholder="正则表达式"
              v-model="nodeFilterForm.nodeFilterName"
              clearable>
          </el-input>
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
            :data="paginationList"
            style="width: 100%"
            :max-height="500"
            size="small"
            :header-cell-style="{backgroundColor: '#f5f7fa'}"
            highlight-current-row
        >
          <el-table-column prop="name" sortable label="节点名" width="200px">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column prop="scriptName" sortable label="代码文件">
            <template slot-scope="scope">
              {{ scope.row.scriptName }}
            </template>
          </el-table-column>
          <el-table-column prop="scriptName" sortable label="代码行数" width="100px">
            <template slot-scope="scope">
              {{ scope.row.scriptLine }}
            </template>
          </el-table-column>
          <el-table-column prop="scriptName" sortable label="代码列数" width="100px">
            <template slot-scope="scope">
              {{ scope.row.scriptColumn }}
            </template>
          </el-table-column>
          <el-table-column
              prop="selfSize"
              sortable
              label="自身大小"
              align="right"
              width="100px"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.selfSize }}</span>
              <span class="sub-text">&nbsp;&nbsp;{{ scope.row.selfSizePercent }}%</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="retainedSize"
              sortable
              label="总大小"
              align="right"
              width="100px"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.retainedSize }}</span>
              <span class="sub-text">&nbsp;&nbsp;{{ scope.row.retainedSizePercent }}%</span>
            </template>
          </el-table-column>
        </el-table>
        <br/>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filterList.length">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import {
  getScriptCodeShowInfo,
} from './utils';

const { mapGetters } = createNamespacedHelpers('V8Snapshot');

export default {
  name: 'V8SnapshotLocation',
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      nodeFilterName: '',
      nodeFilterSelfSizeMin: null,
      nodeFilterSelfSizeMax: null,
      nodeFilterRetainedSizeMin: null,
      nodeFilterRetainedSizeMax: null,
      nodeFilterForm: {
        nodeFilterName: '',
        nodeFilterSelfSizeMin: null,
        nodeFilterSelfSizeMax: null,
        nodeFilterRetainedSizeMin: null,
        nodeFilterRetainedSizeMax: null,
      },
      rootId: -1,
    };
  },
  computed: {
    rootList() {
      if (!this.activeSnapshot || !this.activeSnapshot.snapshot) {
        return [];
      }
      return (this.activeSnapshot.snapshot.getScriptCode());
    },
    filterList() {
      return this.rootList.filter((v) => this.filterItem(v));
    },
    paginationList() {
      const list = this.filterList.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
      return getScriptCodeShowInfo({
        list,
        totalSize: this.totalSize,
      });
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
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
    },
    onFilter() {
      this.nodeFilterName = this.nodeFilterForm.nodeFilterName
          && new RegExp(this.nodeFilterForm.nodeFilterName);
      this.nodeFilterSelfSizeMin = this.nodeFilterForm.nodeFilterSelfSizeMin;
      this.nodeFilterSelfSizeMax = this.nodeFilterForm.nodeFilterSelfSizeMax;
      this.nodeFilterRetainedSizeMin = this.nodeFilterForm.nodeFilterRetainedSizeMin;
      this.nodeFilterRetainedSizeMax = this.nodeFilterForm.nodeFilterRetainedSizeMax;
      this.rootId -= 1;
    },
    filterItem(item) {
      if (!item || !item.node) {
        return false;
      }
      if (this.nodeFilterName && !this.nodeFilterName.test(item.node.name)) {
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
  },
};
</script>

<style scoped>
.sub-text {
  color: #909399;
}

.name {
  color: rgb(136, 18, 128);
}
</style>

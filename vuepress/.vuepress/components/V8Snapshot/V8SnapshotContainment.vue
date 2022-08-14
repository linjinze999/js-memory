<template>
  <div>
    <el-card>
      <V8Snapshot-V8SnapshotFiles/>
    </el-card>
    <br/>
    <el-card>
      <div slot="header">
        <div v-if="activeSnapshot">{{activeSnapshot.name}}</div>
        <div v-else>未选择</div>
      </div>
      <div>
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
        >
          <el-table-column prop="name" sortable label="对象">
            <template slot-scope="scope">
              <span :style="{
                color: ['internal', 'hidden', 'weak'].indexOf(scope.row.type) > -1
                   ? '#909399'
                   : scope.row.type ==='context'
                    ? 'rgb(26,26,166)'
                     : 'rgb(136,18,128)'
              }"
              >
                {{ scope.row.type === 'element' ? `[${scope.row.name_or_index}]` : scope.row.name_or_index }}
              </span>
              <span> :: {{ scope.row.name }}</span>
              <span class="sub-text">&nbsp;@{{scope.row.id}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="distance" sortable label="距离" align="right">
            <template slot-scope="scope">
              <span>{{ scope.row.distance >= BASE_SYSTEM_DISTANCE ? "-" : scope.row.distance }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="self_size" sortable label="浅层大小" align="right">
            <template slot-scope="scope">
              <span>{{ scope.row.self_size }}</span>
              <span class="sub-text">&nbsp;&nbsp;{{Math.round(scope.row.self_size * 100 / totalSize)}}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="retained_size" sortable label="保留大小" align="right">
            <template slot-scope="scope">
              <span>{{ scope.row.retained_size }}</span>
              <span class="sub-text">&nbsp;&nbsp;{{Math.round(scope.row.retained_size * 100 / totalSize)}}%</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import {V8SnapshotInfo} from '../../../../src/v8/snapshot/V8SnapshotInfo'
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('V8Snapshot');

export default {
  name: "V8SnapshotContainment",
  data(){
    return {
      BASE_SYSTEM_DISTANCE: V8SnapshotInfo.BASE_SYSTEM_DISTANCE
    }
  },
  computed: {
    rootList(){
      return this.getNodeChildren();
    },
    totalSize(){
      return ( this.activeSnapshot && this.activeSnapshot.snapshot && this.activeSnapshot.snapshot.calculateStatistics().total) || 9999999999;
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
      return this.activeSnapshot.snapshot.getChildren(nodeId).map(item => {
        const edges = this.activeSnapshot.snapshot.snapshot_info.edges[item.node.id];
        return {
          ...item.node,
          ...item.edge,
          rowKey: `${item.edge.name_or_index}_${item.edge.to_node}`,
          hasChildren: !!(edges && edges.length)
        }
      });
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

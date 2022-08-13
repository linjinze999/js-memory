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
            size="small"
            lazy
            :load="load"
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
          <el-table-column fixed prop="name" sortable label="对象"/>
          <el-table-column prop="distance" sortable label="距离"/>
          <el-table-column prop="self_size" sortable label="浅层大小"/>
          <el-table-column prop="retained_size" sortable label="保留大小"/>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('V8Snapshot');

export default {
  name: "V8SnapshotContainment",
  computed: {
    rootList(){
      const result = this.getNodeChildren();
      return result;
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
  },
  mounted() {

  }
}
</script>

<style scoped lang="scss">

</style>

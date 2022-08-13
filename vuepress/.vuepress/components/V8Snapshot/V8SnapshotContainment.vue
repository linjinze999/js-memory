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
        待实现
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
    ...mapGetters(["activeSnapshot"])
  },
}
</script>

<style scoped lang="scss">

</style>

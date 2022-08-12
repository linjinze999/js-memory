<template>
  <div>
    <div style="font-weight: bold; border-bottom: 1px solid #dcdfe6;padding-bottom: 10px;margin: 10px;">
      当前快照：
    </div>
    <div class="snapshot-list">
      <input type="file" accept=".heapsnapshot" ref="input" class="input" @change="onInput" />
      <div
          v-for="item in snapshotList"
          :key="item.name"
          class="item"
          :class="{active: item.id === activeSnapshot.id}"
          v-loading="item.progress < 1"
          :element-loading-text="item.progressText"
          @click="updateActive(item)"
      >
        {{item.name}}
        <i v-if="item.id !== 1" class="el-icon-delete delete" @click="onRemove(item)"></i>
      </div>
      <i class="el-icon-plus item add" @click="showInput"></i>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import { readFiles } from '../../utils/files';
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('V8Snapshot');

export default {
  name: 'V8SnapshotFiles',
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false
    };
  },
  computed: {
    ...mapState({
      snapshotList: state => state.snapshotList,
    }),
    ...mapGetters(["activeSnapshot"])
  },
  methods: {
    showInput(){
      this.$refs.input.dispatchEvent(new MouseEvent('click'));
    },
    onInput(){
      readFiles(this.$refs.input.files).then(fileList => {
        this.addSnapshot(fileList);
      }).catch(() => {
        this.$message.error('读取文件出错');
      })
    },
    onRemove(snapshot) {
      this.$confirm(`是否删除《${snapshot.name}》`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.removeSnapshot({snapshotList: [snapshot]});
      }).catch(() => {});
    },
    updateActive(snapshot){
      this.updateActiveSnapshot(snapshot);
    },
    ...mapActions(["addSnapshot", "updateActiveSnapshot", "removeSnapshot"])
  }
};
</script>

<style scoped lang="scss">
.snapshot-list{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  .input {
    display: none;
  }
  .item {
    position: relative;
    border: 1px dashed #c0ccda;
    border-radius: 6px;
    box-sizing: border-box;
    width: 148px;
    height: 148px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 5px;
    padding: 10px;
    word-break: break-all;

    &:hover, &:focus, &.active{
      border-color: #409eff;
      color: #409eff;
    }

    .delete {
      color: #8c939d;
      position: absolute;
      right: 0;
      top: 0;
      padding: 5px;
      border-radius: 5px;

      &:hover{
        color: #fff;
        background-color: #F56C6C;
      }
    }
  }

  .add{
    font-size: 28px;
    color: #8c939d;
  }
}
</style>

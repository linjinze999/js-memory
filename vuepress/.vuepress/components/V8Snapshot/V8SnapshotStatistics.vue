<template>
  <div>
    <el-card>
      <V8Snapshot-V8SnapshotFiles/>
    </el-card>
    <br/>
    <el-card>
      <div slot="header">
        <div v-if="activeSnapshot && activeSnapshotStatistics">{{activeSnapshot.name}}：{{Math.round(activeSnapshotStatistics.total / 1000).toLocaleString()}}KB</div>
        <div v-else>未选择</div>
      </div>
      <div class="echarts-wrap">
        <div id="echarts"></div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapGetters } = createNamespacedHelpers('V8Snapshot');

export default {
  name: 'V8SnapshotStatistics',
  computed: {
    activeSnapshotStatistics(){
      return this.activeSnapshot && this.activeSnapshot.snapshot ? this.activeSnapshot.snapshot.calculateStatistics() : null;
      // {
      //   total: 0, // 总计
      //   native: 0, // 类型化数组
      //   code: 0, // 代码
      //   string: 0, // 字符串
      //   array: 0, // js数组
      //   system: 0, // 系统对象
      //   others: 0 // 其他
      // };
    },
    ...mapGetters(["activeSnapshot"])
  },
  watch:{
    activeSnapshotStatistics(newValue){
      this.initEcharts(newValue);
    }
  },
  methods:{
    initEcharts(activeSnapshotStatistics){
      if(!this.activeSnapshot || !activeSnapshotStatistics){
        return;
      }
      const statistics = activeSnapshotStatistics;
      const data = [
        { value: statistics.code, name: '代码' },
        { value: statistics.string, name: '字符串' },
        { value: statistics.array, name: 'js数组' },
        { value: statistics.native, name: '类型化数组' },
        { value: statistics.system, name: '系统对象' },
        { value: statistics.others, name: '其他' }
      ];
      const myChart = this.$echarts.init(document.getElementById('echarts'));
      const option = {
        color: [
          '#5470c6',
          '#91cc75',
          '#fac858',
          '#ee6666',
          '#73c0de',
          '#cccccc',
          '#fc8452',
          '#9a60b4',
          '#ea7ccc'
        ],
        toolbox: {
          show: true,
          right: 50,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: true, lang: ['数据视图', '关闭', '刷新'], title: '数据视图' },
            saveAsImage: { show: true, title: '保存为图片' }
          }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: 'bottom',
          // top: 'center',
          // left: 'left',
          // orient: 'vertical',
          formatter: function (name) {
            const value = data.find(v => v.name === name).value;
            return `${name}（${Math.round(value * 100 / statistics.total)}%，${Math.round(value/1000).toLocaleString()}KB）`;
          }
        },
        series: [
          {
            name: this.activeSnapshot.name,
            type: 'pie',
            radius: ['30%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '15',
                fontWeight: 'bold'
              }
            },
            data: data
          }
        ]
      };
      myChart.setOption(option);
    }
  },
  mounted() {
    this.initEcharts(this.activeSnapshotStatistics);
  }
};
</script>

<style scoped lang="scss">
.echarts-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}
#echarts{
  height: 600px;
  width: 600px;
}
</style>

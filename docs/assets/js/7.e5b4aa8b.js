(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{337:function(t,a,e){},358:function(t,a,e){"use strict";e(337)},365:function(t,a,e){"use strict";e.r(a);var s=e(62);const{mapGetters:i}=Object(s.a)("V8Snapshot");var n={name:"V8SnapshotStatistics",computed:{activeSnapshotStatistics(){return this.activeSnapshot&&this.activeSnapshot.snapshot?this.activeSnapshot.snapshot.calculateStatistics():null},...i(["activeSnapshot"])},watch:{activeSnapshotStatistics(t){this.initEcharts(t)}},methods:{initEcharts(t){if(!this.activeSnapshot||!t)return;const a=t,e=[{value:a.code,name:"代码"},{value:a.string,name:"字符串"},{value:a.array,name:"js数组"},{value:a.native,name:"类型化数组"},{value:a.system,name:"系统对象"},{value:a.others,name:"其他"}],s=this.$echarts.init(document.getElementById("echarts")),i={color:["#5470c6","#91cc75","#fac858","#ee6666","#73c0de","#cccccc","#fc8452","#9a60b4","#ea7ccc"],toolbox:{show:!0,right:50,feature:{mark:{show:!0},dataView:{show:!0,readOnly:!0,lang:["数据视图","关闭","刷新"],title:"数据视图"},saveAsImage:{show:!0,title:"保存为图片"}}},tooltip:{trigger:"item"},legend:{top:"bottom",formatter:function(t){const s=e.find(a=>a.name===t).value;return`${t}（${Math.round(100*s/a.total)}%，${Math.round(s/1e3).toLocaleString()}KB）`}},series:[{name:this.activeSnapshot.name,type:"pie",radius:["30%","50%"],avoidLabelOverlap:!1,itemStyle:{borderRadius:4,borderColor:"#fff",borderWidth:2},emphasis:{label:{show:!0,fontSize:"15",fontWeight:"bold"}},data:e}]};s.setOption(i)}},mounted(){this.initEcharts(this.activeSnapshotStatistics)}},o=(e(358),e(19)),c=Object(o.a)(n,(function(){var t=this,a=t._self._c;return a("div",[a("el-card",[a("V8Snapshot-V8SnapshotFiles")],1),t._v(" "),a("br"),t._v(" "),a("el-card",[a("div",{attrs:{slot:"header"},slot:"header"},[t.activeSnapshot&&t.activeSnapshotStatistics?a("div",[t._v(t._s(t.activeSnapshot.name)+"："+t._s(Math.round(t.activeSnapshotStatistics.total/1e3).toLocaleString())+"KB")]):a("div",[t._v("未选择")])]),t._v(" "),a("div",{staticClass:"echarts-wrap"},[a("div",{attrs:{id:"echarts"}})])])],1)}),[],!1,null,"295136e8",null);a.default=c.exports}}]);
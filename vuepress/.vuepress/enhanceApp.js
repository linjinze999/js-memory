import Vuex from 'vuex';
import store from './store'
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import * as echarts from 'echarts';

export default ({ Vue, options, router, isServer }) => {
  console.log("echarts",echarts)
  Vue.prototype.$echarts = echarts;
  Vue.use(Vuex);
  options.store = new Vuex.Store(store);
  Vue.use(Element);
};

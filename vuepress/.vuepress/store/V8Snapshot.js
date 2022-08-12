import V8SnapshotExample from "../example/kg_qq_com.js"
import { V8Snapshot } from "../../../src/index"
import { Message } from 'element-ui';

let idIndex = 1;

export default {
  namespaced: true,
  state: () => {
    return {
      snapshotList: [
        {
          id: idIndex,
          name: "示例.heapsnapshot",
          snapshot: new V8Snapshot({text: JSON.stringify(V8SnapshotExample)}),
          progress: 1,
          progressText: "初始化完成"
        }
      ],
      activeId: idIndex
    }
  },
  getters: {
    activeSnapshot: (state, getters, rootState) => {
      return state.snapshotList.find(v => v.id === state.activeId);
    }
  },
  mutations: {
    addSnapshot (state, { snapshotList }) {
      state.snapshotList = state.snapshotList.concat(snapshotList);
      if(state.snapshotList.length){
        state.activeId = state.snapshotList[state.snapshotList.length - 1].id
      }
    },
    updateSnapshot (state, { snapshotMap }) {
      state.snapshotList = state.snapshotList.map(snapshot => {
        if(snapshotMap[snapshot.id]){
          snapshot = Object.assign({}, snapshot, snapshotMap[snapshot.id]);
        }
        return snapshot;
      });
    },
    removeSnapshot(state, { snapshotList }) {
      state.snapshotList = state.snapshotList.filter(v => !snapshotList.some(s => s.id === v.id));
      if(snapshotList.some(item => item.id === state.activeId && state.snapshotList.length)){
        state.activeId = state.snapshotList[state.snapshotList.length - 1].id
      }
    },
    updateActiveSnapshot(state, { id }) {
      state.activeId = id;
    },
  },
  actions: {
    addSnapshot ({ commit, state }, fileList) {
      // 初始插入
      const snapshotList = fileList.map(file => {
        return {
          id: ++idIndex,
          name: file.name,
          snapshot: null,
          progress: 0,
          progressText: "初始化..."
        }
      })
      commit('addSnapshot', { snapshotList });
      // 异步解析
      snapshotList.forEach((item, index) => {
        setTimeout(() => {
          try {
            const snapshot = new V8Snapshot({
              text: fileList[index].text,
              // 会卡住
              // progressCallback(params){
              //   // 同步解析进度
              //   commit('updateSnapshot', {
              //     snapshotMap: {
              //       [item.id]: {
              //         progress: params.progress,
              //         progressText: params.text
              //       }
              //     }
              //   });
              // }
            });
            // 解析完成
            commit('updateSnapshot', {
              snapshotMap: {
                [item.id]: {
                  snapshot,
                  progress: 1,
                  progressText: "初始化完成"
                }
              }
            });
          } catch (e) {
            // 解析失败
            Message.error(`解析《${item.name}》出错`);
            commit('removeSnapshot', { snapshotList: [item] });
          }
        }, 1000);
      });
    },
    updateActiveSnapshot ({ commit, state }, snapshot) {
      commit('updateActiveSnapshot', snapshot);
    },
    removeSnapshot ({ commit, state }, {snapshotList}) {
      commit('removeSnapshot', { snapshotList });
    }
  }
}

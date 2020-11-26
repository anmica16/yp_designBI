import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import $ from "@/plugins/js/loader";
import Api from "./Api/lserp_v8";
Vue.Api = Api;

let theStore = new Vuex.Store({
  state: {
    //【1】绘板列表，按登录信息初始化列表
    //Board_records: [],
    //Instance_records: [],
    //【3】点开一个绘板之后，获取到的数据就在这里面，key - 数组的形式保存
    templateMap: {}
  },
  getters: {
    getBoard: state => templateCode => {
      let mapItem = state.templateMap[templateCode];
      if (!mapItem) {
        return null;
      }
      let theBoard = mapItem.board;
      return theBoard;
    },
    //~ 2 不存在就新建一个 数组，只有edit第一次打开时会有该情况
    getInstances: state => templateCode => {
      let mapItem = state.templateMap[templateCode];
      if (!mapItem) {
        return null;
      }
      if (!state.templateMap[templateCode].items) {
        Vue.set(state.templateMap[templateCode], "items", []);
      }

      return state.templateMap[templateCode].items;
    },
    getInstance: (state, getters) => (insCode, templateCode) => {
      let items = getters.getInstances(templateCode);
      if (!items) return null;
      else {
        return items.find(item => {
          return item.instanceCode === insCode;
        });
      }
    }
  },
  mutations: {
    AddOrUpdRecords(state, { table, recordData }) {
      let records;
      if (!recordData) {
        return false;
      }
      let templateCode = recordData.templateCode;
      if (!state.templateMap[templateCode]) {
        Vue.set(state.templateMap, templateCode + "", {});
      }
      if (table === "board") {
        Vue.set(state.templateMap[templateCode], "board", recordData);
      } else if (table === "item") {
        if (!state.templateMap[templateCode].items) {
          Vue.set(state.templateMap[templateCode], "items", []);
        }
        records = state.templateMap[templateCode].items;
        let at = records.indexOf(recordData);
        if (at < 0) {
          records.push(recordData);
        } else {
          records[at] = recordData;
        }
      }
      return true;
    }
  },
  actions: {
    //~ 1 对象，添加进，首先进行数据库交互，然后ok后进行操作【交给实体的save函数】
    // AddOrUpdRecords({ commit }, recordData) {
    //   return new Promise((res, rej) => {
    //     $.ajax({
    //       url: Vue.Api.designBI,
    //       method: Vue.Api.designBI.AddOrUpdRecords,
    //       data: {
    //         recordData: recordData,
    //         table: "board"
    //       }
    //     }).then(result => {
    //       commit("AddOrUpdRecords", recordData);
    //       res();
    //     }).catch(() => {
    //       rej();
    //     });
    //   });
    // },
    //@1 进来第一个获取
    refreshBoardRecords({ state, commit }) {
      return new Promise(res => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.BoardList
        }).then(result => {
          if (result.data && result.data.length) {
            tool.each(result.data, board => {
              commit("AddOrUpdRecords", {
                table: "board",
                recordData: board,
                templateCode: board.templateCode
              });
            });
          }
          res();
        });
      });
    },
    //@2 从数据库中获取一次 template的 items数据
    getInstanceRecords({ state }, params) {
      return new Promise(res => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.InstanceList,
          data: {
            templateCode: params.templateCode
          }
        }).then(result => {
          Vue.set(state.templateMap[params.templateCode], "items", result.data);
          res();
        });
      });
    }
  }
});

export { theStore };

import Maker_DrawingBoard from "./Factory/Maker_DrawingBoard.vue";
import tool from "../../../plugins/js/tool";
Vue.component("Maker_DrawingBoard", Maker_DrawingBoard);

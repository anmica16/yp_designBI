import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import $ from "@/plugins/js/loader";
import Api from "./Api/lserp_v8";
Vue.Api = Api;

let theStore = new Vuex.Store({
  state: {
    //【1】绘板列表，按登录信息初始化列表
    Board_records: [],
    //【2】点开一个绘板之后，获取到的数据就在这里面，key - 数组的形式保存
    Instance_records: {}
  },
  getters: {
    getInstance: state => insCode => {
      return null;
    }
  },
  mutations: {
    AddOrUpdRecords({ state }, { table, recordData }) {
      let records;
      if (table === "board") {
        records = state.Board_records;
      } else if (table === "item") {
        records = state.Instance_records;
      } else {
        return false;
      }
      let at = records.indexOf(recordData)
      if (at < 0) {
        records.push(recordData);
      } else {
        records[at] = recordData;
      }
      return records[at];
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
    refreshBoardRecords({ state }) {
      return new Promise(res => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.DrawingBoardList
        }).then(result => {
          state.Board_records = result.data;
          res();
        });
      });
    },
    getInstanceRecords({ state }, params) {
      return new Promise(res => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.DesignItemInstanceList,
          data: {
            templateCode: params.templateCode
          }
        }).then(result => {
          Vue.set(
            state.Instance_records,
            params.templateCode,
            result.data
          );
          res();
        });
      });
    }
  }
});

export { theStore };

import Maker_DrawingBoard from './Factory/Maker_DrawingBoard.vue';
Vue.component("Maker_DrawingBoard", Maker_DrawingBoard);

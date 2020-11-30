import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import tool from "@/plugins/js/tool";
import $ from "@/plugins/js/loader";
import Api from "./Api/lserp_v8";
Vue.Api = Api;

import DesignItemInstance from "./Entity/DesignItemInstance";
import DrawingBoard from "./Entity/DrawingBoard";
import DrawEntityBase from "./Entity/DrawEntityBase";

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
    //~ 3 实例 现只有 board和 items两种
    getInstance: (state, getters) => params => {
      let type = params.type;
      //console.log(["检测$context获得 的 getter", type, instanceCode, templateCode]);
      if (params instanceof DrawEntityBase) {
        type = params.table;
        params = params.recordData;
      }
      if (type === "item") {
        let { instanceCode, templateCode } = params;
        let items = getters.getInstances(templateCode);
        if (!items || !items.length) return null;
        else {
          return items.find(item => {
            return item.getData("instanceCode") === instanceCode;
          });
        }
      } else if (type === "board") {
        return getters.getBoard(params.templateCode);
      }
      return null;
    }
  },
  mutations: {
    //#1 保存到map，都为实体对象
    AddOrUpdRecords(state, { Entity }) {
      let records;
      if (!Entity) {
        return false;
      }
      let recordData = Entity.recordData;
      let templateCode = recordData.templateCode;
      if (!state.templateMap[templateCode]) {
        Vue.set(state.templateMap, templateCode + "", {});
      }
      if (Entity instanceof DrawingBoard) {
        Vue.set(state.templateMap[templateCode], "board", Entity);
      } else if (Entity instanceof DesignItemInstance) {
        if (!state.templateMap[templateCode].items) {
          Vue.set(state.templateMap[templateCode], "items", []);
        }
        records = state.templateMap[templateCode].items;
        let at = records.indexOf(Entity);
        if (at < 0) {
          records.push(Entity);
        } else {
          records[at] = Entity;
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

import "./Factory";

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import $ from "@/plugins/js/loader";
import Api from "./Api/lserp_v8";
Vue.Api = Api;

let theStore = new Vuex.Store({
  state: {
    //【1】绘板列表，按登录信息初始化列表
    DrawingBoard_records: [],
    //【2】点开一个绘板之后，获取到的数据就在这里面，key - 数组的形式保存
    DesignItemInstance_records: {}
  },
  getters: {
    getInstance: (state) => (insCode) => {
      return null;
    }
  },
  actions: {
    refresh_DrawingBoard_records({ state }) {
      return new Promise(res => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.DrawingBoardList
        }).then(result => {
          state.DrawingBoard_records = result.data;
          res();
        });
      });
    },
    get_DesignItemInstance_records({ state }, params) {
      return new Promise(res => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.DesignItemInstanceList,
          data: {
            templateCode: params.templateCode
          }
        }).then(result => {
          Vue.set(
            state.DesignItemInstance_records,
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

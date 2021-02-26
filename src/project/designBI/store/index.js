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
    //【1】点开一个绘板之后，获取到的数据就在这里面，key - 数组的形式保存
    templateMap: {},
    //【2】进度条，用于显示一次加载请求的进度情况，null表示无，数字0~100表示一次开始到结束
    progress: null,
    centerTitle: "朗速BI设计系统-主界面",
    loginTitle: "朗速BI设计系统-登录",
    getBoardsInDBLoading: false
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
      if (!params) {
        return null;
      }
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
    },
    //--------------
    // 二、computed变量
    loading(state) {
      return state.progress === null ? false : true;
    }
  },
  mutations: {
    //#1 保存到map，都为实体对象
    AddOrUpdRecord(state, payload) {
      let records, Entity;
      if (payload instanceof DrawEntityBase) {
        Entity = payload;
      } else {
        Entity = payload.Entity;
      }
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
    },
    //#2 有新增就有删除
    DeleteRecord(state, payload) {
      let Entity;
      //console.log(["这里咋回事"]);
      if (payload instanceof DrawEntityBase) {
        Entity = payload;
      } else {
        Entity = payload.Entity;
      }
      if (!Entity) {
        return false;
      }
      let recordData = Entity.recordData;
      let templateCode = recordData.templateCode;
      if (Entity instanceof DrawingBoard) {
        state.templateMap[templateCode] = null;
        delete state.templateMap[templateCode];
        return true;
      } else if (Entity instanceof DesignItemInstance) {
        if (!state.templateMap[templateCode].items) {
          return false;
        }
        let records = state.templateMap[templateCode].items;
        let at = records.indexOf(Entity);
        if (at < 0) {
          return false;
        } else {
          records.splice(at, 1);
          return true;
        }
      }
      //到这里说明 没删除啥
      return false;
    }
  },
  actions: {
    //@1 进来第一个获取
    getBoardsInDB({ state, commit }, nowPIndex) {
      return new Promise(res => {
        state.getBoardsInDBLoading = true;
        $.ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.BoardListFolder,
            pIndex: nowPIndex
          }
        })
          .then(result => {
            if (result.data && result.data.length) {
              tool.each(result.data, board => {
                let boardEntity = new DrawingBoard(board);

                commit("AddOrUpdRecord", {
                  //table: "board",
                  Entity: boardEntity
                  //templateCode: board.templateCode
                });
              });
            }
            res();
          })
          .finally(() => {
            state.getBoardsInDBLoading = false;
          });
      });
    },
    //@ 1-2 外部调用获取 boards
    getBoardList({ state, getters }, nowPIndex) {
      return new Promise((res, rej) => {
        $.ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.BoardListFolder,
            pIndex: nowPIndex
          }
        })
          .then(result => {
            let boardDatas = [];
            if (result.data && result.data.length) {
              boardDatas = result.data.sort((a, b) => {
                let d1 = tool.Date.toDateTime(a.editTime),
                  d2 = tool.Date.toDateTime(b.editTime);
                return d1 && d2 && d1 < d2;
              });
            }
            res(boardDatas);
          })
          .catch(r => {
            rej(r);
          });
      });
    },

    //@ 1-3 外部调用获取 单独board
    getNowBoard({ state, getters, commit }, params) {
      let me = this,
        templateCode = params,
        index = null;
      return new Promise((res, rej) => {
        if (tool.isObject(templateCode)) {
          templateCode = params.templateCode;
          index = params.index;
        }
        let findBoard = getters.getBoard(templateCode);
        if (findBoard) {
          res(findBoard);
          return;
        }
        $.ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.BoardList,
            templateCode,
            index
          }
        })
          .then(result => {
            let boardEntity = null;
            if (result.data && result.data.length) {
              boardEntity = new DrawingBoard(result.data[0]);
              commit("AddOrUpdRecord", {
                Entity: boardEntity
              });
            }
            res(boardEntity);
          })
          .catch(r => {
            rej(r);
          });
      });
    },

    //@2 从数据库中获取一次 template的 items数据
    getInstancesInDB({ state, getters }, params) {
      let templateCode = tool.isString(params) ? params : params.templateCode;
      return new Promise(res => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.InstanceList,
          data: {
            templateCode: templateCode
          }
        }).then(result => {
          let items = getters.getInstances(templateCode);
          //console.log(["咋是2个？"]);
          tool.each(result.data, item => {
            try {
              let itemEntity = new DesignItemInstance(item);
              items.push(itemEntity);
            } catch (e) {
              console.error(["初始化-getInstances-new实例错误：", item]);
            }
          });
          //Vue.set(state.templateMap[params.templateCode], "items", result.data);
          res(items);
        });
      });
    },
    //@ 2-2 外部调用获取 items
    getInstancesFn({ state, getters }, params) {
      let templateCode = tool.isString(params) ? params : params.templateCode;
      return new Promise(res => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.InstanceList,
          data: {
            templateCode: templateCode
          }
        }).then(result => {
          res(result.data);
        });
      });
    }
  }
});

export { theStore };

const selectTypes = [
  //~ 1 table表
  {
    type: "table-mingxi",
    icon: "bi-table-mingxi",
    name: "明细表",
    desp: ""
  },
  {
    type: "table",
    icon: "bi-table",
    name: "分组表",
    desp: ""
  },
  // {
  //   type: "table-cross",
  //   icon: "bi-table-cross",
  //   name: "交叉表",
  //   desp: ""
  // },
  //~ 2 柱状图
  {
    type: "bar-divid",
    icon: "bi-bar-divid",
    name: "分区柱状图",
    desp: "建议至少1个维度，至少1个指标"
  },
  {
    type: "bar-stack",
    icon: "bi-bar-stack",
    name: "堆积柱形图",
    desp: "建议至少1个维度，至少2个指标"
  },
  {
    type: "bar",
    icon: "bi-bar",
    name: "多系列柱形图",
    desp: "建议至少1个维度，至少2个指标"
  },
  {
    type: "bar-contrast",
    icon: "bi-bardiagram",
    name: "对比柱状图",
    desp: "建议1个维度，2个指标"
  },
  {
    type: "bar-pubu",
    icon: "bi-pubutu",
    name: "瀑布图",
    desp: "建议至少1个维度，2个指标"
  },
  //~ 3 折线图
  {
    type: "line-divid",
    icon: "bi-line-divid",
    name: "分区折线图",
    desp: "建议至少1个维度，至少1个指标"
  },
  {
    type: "line",
    icon: "bi-zhexiantu",
    name: "多系列折线图",
    desp: "建议至少1个维度，至少2个指标"
  },
  {
    type: "line-radio",
    icon: "bi-leidatu",
    name: "折线雷达图",
    desp: "建议至少1个维度，至少1个指标"
  },
  {
    type: "line-range",
    icon: "bi-range",
    name: "范围面积图",
    desp: "建议至少1个维度，2个指标"
  },
  //~ 4 散点
  {
    type: "scatter",
    icon: "bi-sandian",
    name: "散点图",
    desp: "建议至少1个维度，至少1个指标"
  },
  //~ 5 饼图
  {
    type: "pie",
    icon: "bi-pie",
    name: "饼图",
    desp: "建议1个维度，1个指标"
  },
  {
    type: "pie-meigui",
    icon: "bi-meiguitu",
    name: "玫瑰图",
    desp: "建议1个维度，2个指标"
  },
  //~ 6 漏斗
  {
    type: "funnel",
    icon: "bi-loudoutu",
    name: "漏斗图",
    desp: "建议1个维度，1个指标"
  },
  //~ 7 仪表盘
  {
    type: "dashboard",
    icon: "bi-yibiaopan",
    name: "仪表盘",
    desp: "建议0个维度，1个指标"
  }
];
let getSelectType = type => {
  return (
    selectTypes.find(a => {
      return a.type === type;
    }) || selectTypes[0]
  );
};

export { selectTypes, getSelectType };

import "./Factory";

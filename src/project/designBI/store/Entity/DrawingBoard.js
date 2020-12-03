import Vue from "vue";
import tool from "@/plugins/js/tool";
import { theStore } from "../index";
import DrawEntityBase from "./DrawEntityBase";
import { createAndTime } from "../public/fields";
//import DesignItemInstance from './DesignItemInstance';

const BaseCfg = tool.apply(
  {
    //----------------------
    // Section 1 基本参数
    //----------------------
    id: {
      name: "ID",
      desp: "数据库id",
      disabled: true,
      hidden: true
    },
    templateCode: {
      name: "绘板CODE",
      desp: "绘板识别码ID",
      //hidden: true,
      disabled: true,
      default() {
        return "board_" + tool.uniqueStr();
      }
    },

    //Code类型会 以context的obj会转化为 实体类型
    rootInstance: {
      name: "根实例CODE",
      desp: "根实例对应code",
      $jsonFields: {
        $context: {
          $jsonFields: {
            type: {
              default() {
                return "item";
              }
            },
            templateCode: "所在绘板",
            instanceCode: "实例ID"
          }
        }
      },
      hidden: true,
      disabled: true
      // default(rec) {

      // }
    },
    name: {
      name: "绘板名称",
      desp: "自定义名称",
      placeholder: "请输入绘板名称",
      rules: [
        {
          required: true,
          message: "请输入绘板名称",
          trigger: "blur"
        }
        // {
        //   min: 4,
        //   message: "绘板识别码至少4位",
        //   trigger: "blur"
        // }
      ]
    },
    desp: {
      name: "备注",
      desp: "该控件实例的详细描述"
    }
  },

  //----------------------
  // Section 1.2 创建修改
  //----------------------
  createAndTime
);

export default class DrawingBoard extends DrawEntityBase {
  //# 1 实例树结构，仅是record的树，不过record一旦进行实体化了就会有对应的 $el引用
  //instanceRoot = null;
  templateCode = null;
  table = "board";
  constructor(record) {
    super(BaseCfg, record);
    let me = this,
      insKey = "rootInstance",
      ins = me.getData(insKey);

    //~ 1 绑定this到record
    me.set({ $el: me });

    //console.log(["加入的时候，子控件", me.recordData.templateCode]);
    if (!ins.$context.instanceCode) {
      //~ 2 会转化为 cfg后面的 值
      me.setData({
        [insKey]: {
          //~ 2.2 根据以下参数在 store中寻找，如果没找到，那么根据以下可选参数进行新建一个实例
          $context: {
            type: "item",
            useType: 2,
            instanceCode: "root_" + tool.uniqueStr(),
            templateCode: me.recordData.templateCode
          }
        }
      });
    }
    //~ 3 传出值
    Vue.set(me, "templateCode", me.recordData.templateCode);
  }

  // save(options) {
  //   options = options || {};
  //   //options.table = "board";
  //   return super.save.call(this, options);
  // }

  delete(options) {
    let me = this;
    options = options || {};
    tool.apply(options, {
      method: Vue.Api.designBI.DeleteBoard,
      templateCode: me.recordData.templateCode
    });
    return new Promise((res, rej) => {
      super.delete
        .call(this, options)
        .then(result => {
          console.log(["测试 delete Board位置"]);
          theStore.commit("DeleteRecord", {
            Entity: me
          });
          res(result);
        })
        .catch(result => {
          rej(result);
        });
    });
  }
}

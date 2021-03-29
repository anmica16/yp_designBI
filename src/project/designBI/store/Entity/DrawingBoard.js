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
    index: "树节点值",
    pIndex: "父级的树节点值",
    isFolder: "是否为文件夹",
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
    },
    ownerGroup: "所属团队ID"
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
    let me = this;
    //~ 1 绑定this到record
    me.set({ $el: me });

    if (!me.recordData.isFolder) {
      let insKey = "rootInstance",
        ins = me.getData(insKey);

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
              templateCode: me.recordData.templateCode,
              drag_resize_cfg: {
                can_dragTo: false
              },
              style: {
                width: 1080,
                height: 720
              }
            }
          }
        });
      }
    }
    //~ 3 传出值
    Vue.set(me, "templateCode", me.recordData.templateCode);
  }

  newSave(options) {
    options = options || {};
    tool.apply(options, {
      method: Vue.Api.designBI.AddNewTreeItem
    });
    return super.save.call(this, options);
  }

  delete(options) {
    let me = this;
    options = options || {};

    //# 2 已标记deleted 不再deleted
    if (me.parser.deleted) {
      return Promise.resolve("已经删除，请勿重复删除");
    }
    //# 3 先标记已删除 包括所有template为 该绘板的子控件，主要针对已获取并实例化进map的子控件items。
    me.parser.deleted = true;
    let items = theStore.getters.getInstances(me.templateCode);
    tool.each(items, item => {
      item.parser.deleted = true;
    });

    tool.apply(options, {
      method: Vue.Api.designBI.DeleteBoard,
      templateCode: me.recordData.templateCode,
      index: me.recordData.index
    });
    return new Promise((res, rej) => {
      super.delete
        .call(this, options)
        .then(result => {
          //console.log(["测试 delete Board位置"]);
          theStore.commit("DeleteRecord", {
            Entity: me
          });
          res(result);
        })
        .catch(result => {
          //# 4 失败了的删除，就应该返回deleted状态
          //先不管删除到了哪一步。都可以通过保留的web信息进行保存回来。
          me.parser.deleted = false;
          tool.each(items, item => {
            item.parser.deleted = false;
          });

          rej(result);
        });
    });
  }
}

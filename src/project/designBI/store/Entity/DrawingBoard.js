import tool from "@/plugins/js/tool";
import DrawEntityBase from "./DrawEntityBase";
import { createAndTime } from "../public/fields";
//import DesignItemInstance from './DesignItemInstance';

const BaseCfg = tool.apply(
  {
    //----------------------
    // Section 1 基本参数
    //----------------------
    id: {
      desp: "数据库id",
      readOnly: true
    },
    templateCode: {
      desp: "绘板识别码ID",
      $context: "board",
      require: true
    },

    //Code类型会 以context的obj会转化为 实体类型
    root_instanceCode: {
      desp: "根实例对应code",
      $context: "item",
      readOnly: true
      // default(rec) {

      // }
    },
    name: {
      desp: "自定义名称"
    },
    desp: {
      desp: "该控件实例的详细描述"
    }
  },

  //----------------------
  // Section 1.2 创建修改
  //----------------------
  createAndTime
);

export default class DrawingBoard extends DrawEntityBase {
  constructor(record) {
    super(BaseCfg, record);
    let me = this,
      insKey = "root_instanceCode",
      ins = me.get(insKey);

    if (!ins) {
      //~ 2 会转化为 cfg后面的 值
      me.setData({
        [insKey]: {
          $context: {
            type: "item",
            instanceCode: "root",
            templateCode: me.templateCode
          }
        }
      });
    }
  }

  save(options) {
    options = options || {};
    options.table = "board";
    return super.save(options);
  }
}

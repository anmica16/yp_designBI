import tool from "@/plugins/js/tool";
import DrawEntityBase from "./DrawEntityBase";
import { createAndTime } from "../public/fields";

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
      desp: "绘板唯一码，表示该实例所属绘板是哪个",
      $context: "board",
      require: true
    },

    root_instanceCode: {
      desp: "根实例对应code",
      $context: "item",
      readOnly: true,
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
  }
}

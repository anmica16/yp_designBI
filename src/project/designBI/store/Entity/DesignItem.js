import tool from "@/plugins/js/tool";
import DrawEntityBase from "./DrawEntityBase";
//import { createAndTime } from "../public/fields";

const BaseCfg = tool.apply({
  //一、props

  //----------------------
  // Section 1 基本参数
  //----------------------
  id: {
    name: "ID",
    desp: "数据库id",
    disabled: true
  },
  //【=1=】
  xtype: {
    desp: "使用时调用的Vue/Yw识别码 Yw为@，Vue为普通"
  },
  //【=2=】
  typeCode: {
    desp: "类型id，唯一码，下拉框区别以及树结构的id，作为关联left join的关键字"
  },
  //【3】name：
  name: {
    desp: "中文名"
  },
  //【4】desp：
  desp: {
    desp: "该控件的详细描述"
  },
  //【5】props：
  props: {
    desp:
      "可传参数列表，形如Vue，作为提醒的重要一环; 一般Yw的变量不需要特别验证，传给vue的才需要如下设定",
    $json: Map,
    $jsonFields: {
      type: {
        desp: "类型",
        type: "type"
      }, // ①、type：
      default: {
        desp: "默认值，引用类型则要function返回",
        type: Function
      }, //②、default ：
      required: {
        desp: "是否必须",
        default() {
          return true;
        }
      }, //③、required：
      validator: {
        desp: "验证函数，返回是否为true",
        type: Function
      },
      desp: "描述"
    }
  },

  //----------------------
  // Section 2 数据源
  //----------------------
  //【6】source_influence：
  source_influence: {
    desp:
      "数据源所产生的影响，主要是产生的子控件、零件的描述; 数组，所包含的为对象；无则表示数据源不产生任何结果；",
    $json: Array,
    $jsonFields: {
      slot: {
        desp:
          "无则无需特别说明在哪个位置，【@型ref】可以是Yw的data-ref也可是vue的ref或【#型slot】插槽"
      },
      desp: {
        desp: "关于位置的说明"
      }, //②、
      typeCode: {
        desp: "子控件识别码，与【2】关联，可读取到section 1中描述"
      } //③、
    }
  },

  //----------------------
  // Section 3 默认值
  //----------------------
  defaultValues: {
    desp: "每个DesignItem实例的默认初始值。"
  }
});

export default class DesignItem extends DrawEntityBase {
  table = "item_tip";
  constructor(record) {
    super(BaseCfg, record);
  }
}

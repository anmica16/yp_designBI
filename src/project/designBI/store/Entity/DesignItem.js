import tool from "@/plugins/js/tool";
export default class DesignItem {
  constructor(cfg) {
    let me = this;
    tool.apply(me, cfg);
  }

  static JsonFields = ["props"];
  static VerbFields = ["props->validator"];

  //一、props

  //----------------------
  // Section 1 基本参数
  //----------------------

  id = 0;

  //【=1=】使用时调用的Vue/Yw识别码 Yw为@，Vue为普通
  xtype = "";
  //【=2=】类型id，唯一码，下拉框区别以及树结构的id，作为关联left join的关键字
  typeCode = "";
  //【3】name：中文名
  name = "";
  //【4】desp：该控件的详细描述
  desp = "";
  //【5】props：可传参数列表，形如Vue，作为提醒的重要一环; 一般Yw的变量不需要特别验证，传给vue的才需要如下设定
  props = {
    onePro: {
      type: String, // ①、type：类型
      default: "str", //②、default ：默认值，引用类型则要function返回
      required: true, //③、required：是否必须
      validator: function(val) {
        return val && true;
      } //④、validator：验证函数，返回是否为true
    }
  };

  //----------------------
  // Section 2 数据源
  //----------------------
  //【6】source_influence：数据源所产生的影响，主要是产生的子控件、零件的描述; 数组，所包含的为对象；无则表示数据源不产生任何结果；
  source_influence = {
    slot: "", //①、无则无需特别说明在哪个位置，【@型ref】可以是Yw的data-ref也可是vue的ref或       【#型slot】插槽
    desp: "", //②、关于位置的说明
    typeCode: "" //③、子控件识别码，与【2】关联，可读取到section 1中描述
  };
}

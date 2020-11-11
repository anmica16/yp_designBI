import tool from "../views/drawer/node_modules/@/plugins/js/tool";
import { DesignVerb, JsonVerb } from "../public/Verbs";
export default class DesignItemInstance {
  constructor(cfg) {
    let me = this;
    tool.apply(me, cfg);
  }

  static JsonFields = [
    "propsData",
    "item_instanceCodes",
    "style",
    "class",
    "config_yw",
    "event_custom",
    "event_life"
  ];

  //一、props

  //----------------------
  // Section 1 基本参数
  //----------------------

  id = 0;

  //【1】instanceCode：唯一码，非随机生成，需实现固定查询，每次生成都一致，生成的id其实也能实现这个效果，只要每次新生成的固定下来即可
  instanceCode = "";
  //【2】templateCode：绘板唯一码，表示该实例所属绘板是哪个
  templateCode = "";
  //【3】name：中文名
  name = "";
  //【4】desp：该控件实例的详细描述
  desp = "";
  //【5】useType：-1 私有加入子控件； 0 普通子控件；1 整体可调用，无其他子控件以来；2 root控件，也是绘板的最顶层1类型控件，默认为0
  useType = 0;
  //【6】【JSON】propsData：自身控件传递的实参：名称 对应 DesignVerb，获取和上传时要通过DesignVerb来翻译
  propsData = {
    onePro: DesignVerb //一个Pro的 参数形式
  };

  //----------------------
  // Section 1.2 创建修改
  //----------------------
  //【++ 1】创建时赋予
  createTime = ""; //Yw.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss")
  //【++ 1.2】创建者 用户表中信息
  createOper = "";
  createOperId = "";

  //【++ 2】修改保存时赋予
  editTime = ""; //Yw.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss")
  //【++ 2.2】修改者 用户表中信息
  editOper = "";
  editOperId = "";

  //----------------------
  // Section 2 父子级
  //----------------------
  //【7】parent_instanceCode：父级inscode
  parent_instanceCode = "";
  //【8】【JSON】item_instanceCodes：子集顺序和位置记录
  item_instanceCodes = [
    //key: ①、无则无需特别说明在哪个位置，@型可以是Yw的data-ref也可是vue的ref或       #型插槽
    {
      slot: "【@型ref】【#型slot】",
      desp: "", //关于位置的说明
      instanceCode: "" //子控件实例识别码
    }
  ];

  //----------------------
  // Section 3 数据源
  //----------------------
  //【9】source：4种数据类型，同桌面BI的逻辑
  source = "";
  //【9.2】source_type：0 自定义（默认）；1 普通sql“@”;2 存储过程“#”; 3 模块编号 “\d+”
  source_type = 0;
  //【10】source_enable：默认1开启
  source_enable = true;

  //----------------------
  // Section 4 样式布局
  //----------------------
  //【11-1】【JSON】style：样式对象，可保持相互更新
  style = {
    width: "100px"
  };
  //【11-2】【JSON】class：样式名，可保持相互更新
  class = { theme1: true, theme2: false };
  //【12】【JSON】【将弃用】config_yw：设计时涉及Yw的变量
  config_yw = {
    onePro: "abc"
  };
  //【12-2】【JSON】drag_resize_cfg：拖拽、resize设定，无则表示不可
  drag_resize_cfg = {
    can_drag: "defaultFlag", //拖拽标识，是否可拖拽
    can_drop: "defaultFlag", //拖拽标识，是否可拽入
    can_resize: true //是否resize
  };

  //----------------------
  // Section 5 事件体系
  //----------------------
  //【13】【JSON】event_custom：事件对象集合; 数组，所包含的为对象；
  event_custom = [
    {
      event_type: "", //（1）事件类型，【本地下拉框】，可选dom事件，排第一的为自定义事件
      event_name: "", //（2）选择后自动生成名，然后可输入.myAfter的后缀
      event_target_instanceCode: "", //无则自身，有则按规则寻找
      event_handler: DesignVerb //DesignHandler变量的翻译处理
    }
  ];
  //【14】【JSON】event_life：生命事件对象集合
  event_life = [
    {
      life_type: "", //（1）life事件类型，【本地下拉框】，参考vue的事件体系
      life_weight: 0, //先后顺序，适应Yw体系，因为这多由Yw来触发
      life_auto: true, //（3）默认为1，auto自动触发还是由其他触发
      life_handler: DesignVerb // （4）DesignHandler变量的翻译处理
    }
  ];
}

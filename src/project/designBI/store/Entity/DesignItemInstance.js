import tool from "@/plugins/js/tool";
import DrawEntityBase from "./DrawEntityBase";
import { createAndTime } from "../public/fields";

const BaseCfg = tool.apply(
  {
    //一、props

    //----------------------
    // Section 1 基本参数
    //----------------------
    id: {
      desp: "数据库id"
    },

    //【1】
    instanceCode: {
      desp:
        "唯一码，非随机生成，需实现固定查询，每次生成都一致，生成的id其实也能实现这个效果，只要每次新生成的固定下来即可",
      required: true
    },

    //【=1.2=】
    xtype: {
      desp: "使用时调用的Vue/Yw识别码 Yw为@，Vue为普通",
      required: true
    },
    //【2】templateCode：
    templateCode: {
      desp: "绘板唯一码，表示该实例所属绘板是哪个",
      required: true
    },
    //【3】name：
    name: {
      desp: "中文名"
    },
    //【4】desp：
    desp: {
      desp: "该控件实例的详细描述"
    },
    //【5】useType：
    useType: {
      desp:
        "-1 私有加入子控件； 0 普通子控件；1 整体可调用，无其他子控件以来；2 root控件，也是绘板的最顶层1类型控件，默认为0",
      default() {
        return 0;
      }
    },
    //【6】【JSON】propsData：
    propsData: {
      desp:
        "【JSON】自身控件传递的实参：名称 对应 DesignVerb，获取和上传时要通过DesignVerb来翻译",
      $json: Object //一个Pro的 参数形式
    }
  },
  //----------------------
  // Section 1.2 创建修改
  //----------------------
  createAndTime,
  {
    //----------------------
    // Section 2 父子级
    //----------------------
    //【7】parent_instanceCode：
    parent: {
      desp: "父级inscode",
      $jsonFields: {
        $context: "item"
      }
    },
    //【8】【JSON】item_instanceCodes：
    items: {
      desp: "子集顺序和位置记录",
      $json: Array,
      $jsonFields: {
        slot: {
          desp:
            "无则无需特别说明在哪个位置，@型可以是Yw的data-ref也可是vue的ref或#型插槽",
          placeHolder: "【@型ref】【#型slot】"
        },
        desp: {
          desp: "关于位置的说明"
        },
        instance: {
          $context: "item"
        }
      }
    },

    //----------------------
    // Section 3 数据源
    //----------------------
    //【9】source：
    source: {
      desp: "4种数据类型，同桌面BI的逻辑"
    },
    //【9.2】source_type：
    source_type: {
      desp: "0 自定义（默认）；1 普通sql“@”;2 存储过程“#”; 3 模块编号 “d+”",
      default() {
        return 0;
      }
    },
    //【10】source_enable：
    source_enable: {
      desp: "是否开启数据源，默认1开启",
      default() {
        return true;
      }
    },

    //----------------------
    // Section 4 样式布局
    //----------------------
    //【11-1】【JSON】style：
    style: {
      desp: "样式对象，可保持相互更新",
      $json: Object,
      default() {
        return {};
      }
    },
    //【11-2】【JSON】class：样式名，可保持相互更新
    class: {
      desp: "样式名，可保持相互更新",
      $json: Object,
      default() {
        return {};
      }
    },
    //【12】【JSON】【将弃用】config_yw：
    config_yw: {
      desp: "设计时涉及Yw的变量",
      $json: Object
    },
    //【12-2】【JSON】drag_resize_cfg：
    drag_resize_cfg: {
      desp: "拖拽、resize设定，无则表示不可",
      $json: Object,
      $jsonFields: {
        can_drag: {
          desp: "拖拽标识，是否可拖拽",
          default() {
            return "defaultFlag";
          }
        }, //
        can_drop: {
          desp: "拖拽标识，是否可拽入",
          default() {
            return "defaultFlag";
          }
        },
        can_resize: {
          desp: "是否resize",
          default() {
            return true;
          }
        } //
      }
    },

    //----------------------
    // Section 5 事件体系
    //----------------------
    //【13】【JSON】event_custom：；
    event_custom: {
      desp: "事件对象集合; 数组，所包含的为对象",
      $json: Array,
      $jsonFields: {
        type: {
          desp:
            "（1）事件类型，【本地下拉框】，可选dom事件，排第一的为自定义事件"
        }, //
        name: {
          desp: "（2）选择后自动生成名，然后可输入.myAfter的后缀"
        }, //
        target: {
          desp: "（3）无则自身，有则按规则寻找",
          $context: true
        }, //
        handler: {
          desp: "（4）监听事件触发函数",
          $context: true
        }
      }
    },
    //【14】【JSON】event_life：
    event_life: {
      desp: "生命事件对象集合",
      $json: Array,
      $jsonFields: {
        type: {
          desp: "（1）life事件类型，【本地下拉框】，参考vue的事件体系"
        }, //
        weight: {
          desp: "（2）先后顺序，适应Yw体系，因为这多由Yw来触发",
          default() {
            return 0;
          }
        }, //
        auto: {
          desp: "（3）默认为1，auto自动触发还是由其他触发",
          default() {
            return true;
          }
        }, //
        handler: {
          desp: "（4）监听生命周期事件触发函数",
          $context: true
        }
      }
    }
  }
);

export default class DesignItemInstance extends DrawEntityBase {
  constructor(record) {
    super(BaseCfg, record);
  }
  save(options) {
    options = options || {};
    options.table = "item";
    return super.save(options);
  }
}

import tool from "@/plugins/js/tool";
import Vue from "vue";
import DrawEntityBase from "./DrawEntityBase";
import { createAndTime } from "../public/fields";
import { theStore } from "../index";
import DesignItem from "./DesignItem";
import InstanceVueCfg from "./InstanceVue.vue";
import dropManager from "@designBI/views/drawer/dropManager";

const InstanceVue = Vue.extend(InstanceVueCfg);

const BaseCfg = tool.apply(
  {
    //一、props

    //----------------------
    // Section 1 基本参数
    //----------------------
    id: {
      desp: "数据库id",
      disabled: true,
      hidden: true
    },

    //【1】
    instanceCode: {
      desp:
        "唯一码，非随机生成，需实现固定查询，每次生成都一致，生成的id其实也能实现这个效果，只要每次新生成的固定下来即可",
      //required: true
      disabled: true,
      default() {
        return "item_" + tool.uniqueStr();
      }
    },

    //【=1.2=】
    xtype: {
      desp: "使用时调用的Vue/Yw识别码 Yw为@，Vue为普通",
      required: true
    },
    //【2】templateCode：
    templateCode: {
      desp: "绘板唯一码，表示该实例所属绘板是哪个",
      required: true,
      disabled: true,
      hidden: true
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
      },
      disabled: true,
      hidden: true
    },
    //【6】【JSON】propsData：
    propsData: {
      desp:
        "【JSON】自身控件传递的实参：名称 对应 DesignVerb，获取和上传时要通过DesignVerb来翻译",
      $json: Object, //一个Pro的 参数形式
      disabled: true,
      hidden: true
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
      },
      disabled: true,
      hidden: true
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
      },
      disabled: true,
      hidden: true
    },

    //----------------------
    // Section 3 数据源
    //----------------------
    //【9】source：
    source: {
      desp: "4种数据类型，同桌面BI的逻辑",
      disabled: true,
      hidden: true
    },
    //【9.2】source_type：
    source_type: {
      desp: "0 自定义（默认）；1 普通sql“@”;2 存储过程“#”; 3 模块编号 “d+”",
      default() {
        return 0;
      },
      disabled: true,
      hidden: true
    },
    //【10】source_enable：
    source_enable: {
      desp: "是否开启数据源，默认1开启",
      default() {
        return true;
      },
      disabled: true,
      hidden: true
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
      },
      disabled: true,
      hidden: true
    },
    //【11-2】【JSON】class：样式名，可保持相互更新
    class: {
      desp: "样式名，可保持相互更新",
      $json: Object,
      default() {
        return {};
      },
      disabled: true,
      hidden: true
    },
    //【12】【JSON】【将弃用】config_more：
    config_more: {
      desp: "设计时涉及更多的变量",
      $json: Object,
      disabled: true,
      hidden: true
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
        can_dragTo: {
          desp: "是否可拖拽到另一个组件",
          default() {
            return true;
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
      },
      disabled: true,
      hidden: true
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
      },
      disabled: true,
      hidden: true
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
      },
      disabled: true,
      hidden: true
    }
  }
);

export default class DesignItemInstance extends DrawEntityBase {
  designItem = null;
  table = "item";
  instanceCode = null;
  templateCode = null;

  //# 1 新vue
  instanceVue = null;

  //----------
  // 二、过程中使用的变量
  //----------
  //@ 1 父亲链，用于拖拽比较最前端item
  //parentsList = [];

  constructor(xtype, record) {
    //#1 配置形式
    if (tool.isObject(xtype)) {
      record = xtype;
      xtype = xtype.xtype;
    } else if (tool.isString(xtype)) {
      record = record || {};
      record.xtype = xtype;
    } else if (xtype instanceof DesignItem) {
      record = record || {};
      record.xtype = xtype.getData("xtype");
    } else {
      throw `错误的构造参数：${xtype}，${record}`;
    }
    super(BaseCfg, record);

    let me = this;
    //~ 1 xtype确定
    if (xtype instanceof DesignItem) {
      me.designItem = xtype;
    } else {
      let theDI = null;
      if (tool.isString(xtype)) {
        theDI = Vue.$itemManager.get(xtype);
      }
      if (theDI) {
        me.designItem = theDI;
      } else {
        throw `未找到对应xtype子控件：${xtype}`;
      }
    }
    //~ 2 默认值赋入
    let dFn = me.designItem.getData("defaultValues"),
      defaultValues = tool.isFunction(dFn) && dFn();
    if (defaultValues) {
      //#2 考虑record以及默认值的优先级 进行合并
      me.setDataIf(defaultValues);
    }
    //~ 3 传出值
    Vue.set(me, "templateCode", me.recordData.templateCode);
    Vue.set(me, "instanceCode", me.recordData.instanceCode);
    //~ 4 新增vue部分：
    me.instanceVue = new InstanceVue({
      propsData: {
        Entity: me
      }
    });
  }

  checkType(Instance) {
    if (!(Instance instanceof DesignItemInstance)) {
      throw `add时给了错误类型的参数！`;
    }
  }
  // setParentsList(Instance) {
  //   let me = this;
  //   //if (me.parentsList.indexOf(Instance) < 0) {
  //   let targetPL = Instance.parentsList;
  //   me.parentsList = targetPL.concat([Instance]);
  //   //}
  // }
  setParent(Instance) {
    let me = this;
    me.checkType(Instance);
    //~ 1 Data处理
    me.setData({
      parent: {
        $context: {
          type: "item",
          //接受方 2个都接受
          instanceCode: Instance.instanceCode,
          templateCode: Instance.templateCode
        }
      }
    });
    return me.save();
    //~ 2 父亲链处理
    //me.setParentsList(Instance);
  }
  //解决部分不响应items的组件
  refreshItems() {
    let me = this;
    Vue.set(me.recordData, "items", me.recordData.items);
  }
  leaveParent() {
    let me = this,
      meInsCode = me.getData("instanceCode"),
      parent = me.get("parent");
    console.log(["开始离开父亲"]);
    return new Promise((res, rej) => {
      if (parent && parent instanceof DesignItemInstance) {
        let pItemsData = parent.getData("items"),
          at = pItemsData.findIndex(
            item => item.$context && item.$context.instanceCode === meInsCode
          );
        if (at > -1) {
          pItemsData.splice(at, 1);
          //# 2 父亲要保存一下
          parent
            .save()
            .then(r => {
              res(r);
            })
            .catch(r => {
              rej(r);
            });
          return;
        }
      }
      //没有父亲就算做 ok
      res();
    });
  }
  syncPositionToMe(Instance) {
    let me = this,
      meParents = me.instanceVue.parentsList,
      insParents = Instance.instanceVue.parentsList,
      // 0 对应目标上升 + 的终点
      // 1 对应 下降开始 - 到me的起点
      lastParents = dropManager.findLastParent(insParents, meParents);
    console.log(["syncPositionToMe 检查"]);
    //~ 1 只有是root是 me的时候，才会不存在，不存在就设为0
    let parentAt = lastParents && lastParents[1] || 0,
    //# 0 起点坐标
      style = Instance.getData("style"),
      resultLeft = style.leftPx,
      resultTop = style.topPx;

    //# 1 上升累积 +
    for (let i = insParents.length - 1; i > parentAt; --i) {
      let theP = insParents[i],
        theStyle = theP.getData("style");
      resultLeft += theStyle.leftPx;
      resultTop += theStyle.topPx;
    }

    //# 2 下降累积 -
    if (parentAt + 1 < meParents.length) {
      for (let j = parentAt + 1; j < meParents.length; ++j) {
        let theP = meParents[j],
          theStyle = theP.getData("style");
        resultLeft -= theStyle.leftPx;
        resultTop -= theStyle.topPx;
      }
    }

    //# 3 再减去me -
    let meStyle = me.getData("style");
    resultLeft -= meStyle.leftPx;
    resultTop -= meStyle.topPx;

    //# 4 设定Instance
    Instance.setData({
      style: {
        left: resultLeft,
        top: resultTop
      }
    });
  }
  add(Instance) {
    let me = this;
    me.checkType(Instance);

    let makePro = function (Entity, savePro) {
      return new Promise((res, rej) => {
        savePro
          .then(r => {
            //Entity 为parent时，出现下列情况时一定存在
            if (r && r.type === "abort") {
              //# 4 存在保存时中断之前保存的操作，这里就统一以 成功保存为准，不管中断多少次
              Entity.parser.$once("save-success", () => {
                adding && (theStore.state.progress += 30);
                res(r);
              });
            } else {
              adding && (theStore.state.progress += 30);
              res(r);
            }
          })
          .catch(r => {
            rej(r);
          });
      });
    };

    let adding = true;
    //@ 1 开始
    theStore.state.progress = 0;

    //# 4 在离开父亲之前，先进行Left、Top转换
    me.syncPositionToMe(Instance);

    let pros = [];
    //# 3 后续加入 之前的父亲去除本 Entity
    let pro1 = makePro(Instance.get("parent"), Instance.leaveParent());
    pros.push(pro1);

    //# 1 一是，自身items加入一个
    me.recordData.items.push({
      $context: {
        type: "item",
        //输出方 绘板按照自己
        instanceCode: Instance.instanceCode,
        templateCode: me.templateCode
      }
    });
    let pro2 = makePro(me, me.save());
    pros.push(pro2);

    //# 2 二是，对方parent设定
    let pro3 = makePro(Instance, Instance.setParent(me));
    pros.push(pro3);

    return new Promise((res, rej) => {
      Promise.all(pros)
        .then(r => {
          //theStore.state.progress = 100;
          res(r);
        })
        .catch(r => {
          console.log(["add的中间过程出现了 rejection ", r]);
          //theStore.state.progress = 100;
          rej(r);
        })
        .finally(() => {
          adding = false;
          theStore.state.progress = 100;
        });
    });
  }
  delete(options) {
    let me = this;
    //# 2 已标记deleted 不再deleted
    if (me.parser.deleted) {
      return Promise.resolve("已经删除，请勿重复删除");
    }
    //# 3 先标记已删除
    me.parser.deleted = true;

    return new Promise((res, rej) => {
      super.delete
        .call(this, options)
        .then(r => {
          console.log(["测试 delete Instance"]);
          //#2 store中删除
          theStore.commit("DeleteRecord", me);
          //#3 parent中删除
          me.leaveParent();

          res(r);
        })
        .catch(r => {
          //# 4 失败了的删除，就应该返回deleted状态
          //先不管删除到了哪一步。都可以通过保留的web信息进行保存回来。
          me.parser.deleted = false;
          rej(r);
        });
    });
  }
}

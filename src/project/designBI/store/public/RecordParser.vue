<script>
import tool from "@/plugins/js/tool";
import Vue from "vue";
import { theStore } from "../index";
import $ from "@/plugins/js/loader";
import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance.js";
export default {
  name: "RecordParser",
  props: {
    baseConfig: {
      type: Object,
      required: true
    },
    baseData: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      record: {},
      recordData: {},

      //【=1=】个体更新状态
      //# 1 如果在save，那么ajax赋给他
      updating: false,
      showLoad_upd: false,
      //# 2 如果已标记deleted，那么中断且 不可再save
      deleted: false
    };
  },
  computed: {
    baseCfg() {
      return this.stdBaseCfg(this.baseConfig);
    },
    //不知道这个桥搭得过去不
    recordMid() {
      let me = this,
        theRec = me.loadRecordData(me.recordData);
      return theRec;
    },
    storeLoading() {
      return theStore.getters.loading;
    }
  },
  watch: {
    // recordData(newVal) {
    //   //console.log(["刷新了！recordData"]);
    //   this.triggerSave(newVal);
    // },
    recordMid(newVal) {
      //console.log(["刷新了！recordMid"]);
      tool.mergeSet(Vue.set, this.record, newVal);
    }
  },
  methods: {
    //【5】将字符串转化为对象
    stdBaseCfg(theCfg, propsArray) {
      let me = this;
      propsArray = propsArray || [];
      tool.each(theCfg, (key, val) => {
        let keyPropsArray = propsArray.concat([key]);
        //~ 1 转化
        if (!tool.isObject(val)) {
          if (!val) {
            console.log(["这里调试"]);
            throw `配置不允许毫无描述！key：${key}`;
          }
          theCfg[key] = {
            name: val + "",
            desp: val + ""
          };
        }
        //名称
        theCfg[key].name = theCfg[key].name || theCfg[key].desp;
        //~ 3 公共附加属性
        tool.apply(theCfg[key], {
          $key: key,
          propsArray: keyPropsArray
        });

        //~ 2 是否有 $jsonFields
        if (theCfg[key].$jsonFields) {
          theCfg[key].$jsonFields = me.stdBaseCfg(
            theCfg[key].$jsonFields,
            keyPropsArray
          );
        }
      });
      return theCfg;
    },

    //【1】根据baseCfg初始化一个record，default有用，初始化不用迭代
    newRecordData(jsonFields) {
      let me = this,
        rec = {};
      //console.log(["newRecordData 的问题"]);
      tool.each(jsonFields ? jsonFields : me.baseCfg, function(key, val) {
        let initVal = null;
        //#1 只有拥有default函数的，才有初始值，其他均为 null
        if (tool.isFunction(val.default)) {
          initVal = val.default(rec, me.baseCfg);
        }

        //~ 2 jsonFileds处理
        if (val) {
          //#2 数组形式的，暂不添加
          if (val.$json === Array) {
            initVal = [];
            // if (val.$jsonFields) {
            //   //@@ 2 保存到record上 作为添加时的准则属性 不用
            //   rec["$jsonFields_" + key] = val.$jsonFields;
            // }
          } else if (val.$json === Object || val.$jsonFields) {
            //#3 对象形式的，可按设置来一波默认值
            if (val.$jsonFields) {
              initVal = me.newRecordData(val.$jsonFields);
            } else {
              initVal = {};
            }
          }
        }

        //#4 需要响应式的
        //Vue.set(rec, key, initVal);
        rec[key] = initVal;
      });
      return rec; //hasProp ? rec : null;
    },
    loadContextByProp(sourceObj, originPropsArray) {
      if (!originPropsArray || !originPropsArray.length) {
        return null;
      }
      //# 0 避免源 propsArray被剥削
      let propsArray = tool.clone(originPropsArray);
      let me = this,
        deepObj = sourceObj[propsArray[0]];
      propsArray.splice(0, 1);
      if (propsArray.length > 0) {
        return me.loadContextByProp(deepObj, propsArray);
      } else {
        return deepObj;
      }
    },
    //【2-1】根据对象化的 data进行赋值
    loadRecordData(data, inLoop) {
      let me = this,
        rec = {};
      tool.each(inLoop ? data : me.baseCfg, function(key, val) {
        let readVal = data[key],
          resultVal = null;
        //~ 1 数组 分别执行load
        //# ++ 1 数组就不搞这么复杂了
        if (tool.isArray(readVal)) {
          //resultVal = readVal;

          let readValArray = [];
          tool.each(readVal, rData => {
            //console.log(["针对Items进行检查", rData]);
            //# 1 因为内部的 $context是需要一个壳才能进入each中转化的，所以这里提供一个rData壳。
            let resultObj = me.loadRecordData({ rData }, true);
            if (resultObj) {
              readValArray.push(resultObj.rData);
            }
          });
          resultVal = readValArray;
        }
        //~ 2 对象
        else if (tool.isObject(readVal)) {
          //# 1 带有上下文的对象，要从itemMap里面找，必有propName
          if (readVal.$context) {
            //console.log(["检测$context获得", readVal.$context]);
            let theObj = theStore.getters.getInstance(readVal.$context);
            //# 1.3 如果存在深入选择 那么进行深入
            if (readVal.$propsArray && readVal.$propsArray.length) {
              resultVal = me.loadContextByProp(theObj, readVal.$propsArray);
            } else {
              resultVal = theObj;
            }
            //# 1.2 采用如此的形式保留OBJ的参数
            rec["$cfg_" + key] = readVal;
          }
          //# 2 如果是函数，必有function
          else if (readVal.$isFn) {
            try {
              eval("resultVal = " + readVal.function);
            } catch (e) {
              console.error(["函数转换失败", me, key, val]);
            }
          }
          //# 3 普通对象则继续深入
          else {
            // let re = {};
            // tool.each(readVal, (k, v) => {
            //   re[k] = me.loadRecordData(v, true);
            // });
            // resultVal = re;
            resultVal = me.loadRecordData(readVal, true);
          }
        }
        //~ 3 字面值在这里，那么就直接赋值
        else {
          resultVal = readVal;
        }

        //#4 需要响应式的
        //Vue.set(rec, key, resultVal);
        rec[key] = resultVal;
      });
      return rec;
    },
    //【3】触发save
    triggerSave(recordData, jsonFields) {
      let me = this,
        theCfg = jsonFields || me.baseCfg;
      tool.each(theCfg, (key, val) => {
        //# 1 有则 触发
        if (tool.isFunction(val.default_save)) {
          recordData[key] = val.default_save(me.recordData, theCfg[key]);
        }
        //# 2 仅当未设置值且 为Obj 或 Array时 继续深入触发
        else if (val.$jsonFields) {
          if (tool.isObject(recordData[key])) {
            me.triggerSave(recordData[key], val.$jsonFields);
          } else if (tool.isArray(recordData[key])) {
            recordData[key].forEach(item => {
              me.triggerSave(item, val.$jsonFields);
            });
          }
        }
      });
    },
    //【4】保存到数据库
    save(options, Entity) {
      let me = this;

      //# 2 已标记deleted 不再save
      if (me.deleted) {
        return Promise.resolve("已删除，保存或更新失败");
      }

      //console.log(["保存的groupId确认", theStore.state.pageGroupId]);

      //# 4 save触发
      me.triggerSave(me.recordData);

      //# 3 单独的 更新状态管理
      //~ 3.1 上一次的状态
      let canShow = me.showLoad_upd;
      me.showLoad_upd = !me.storeLoading;

      //# 1 正在save的，中断然后再save
      if (me.updating) {
        me.updating.abort();
        me.updating = null;

        // ~ 3.1-2 传递上一次状态到这一次
        me.showLoad_upd = canShow;
      }

      options = options || {};
      me.showLoad_upd && (theStore.state.progress = 20);
      return new Promise((res, rej) => {
        me.updating = $.ajax({
          url: Vue.Api.designBI,
          data: tool.apply(
            {
              method: Vue.Api.designBI.AddOrUpd,
              records: JSON.stringify([me.recordData]),
              table: Entity.table,

              groupId: theStore.state.pageGroupId
            },
            options
          )
        });
        me.updating
          .then(result => {
            console.log(["成功的save", result]);
            me.updating = null;
            me.showLoad_upd && (theStore.state.progress = 100);
            if (Entity.$isNew) {
              //# 4 有些没有id的应该在保存之后设定
              Entity.setData({ id: result.other });
            }
            theStore.commit("AddOrUpdRecord", {
              Entity: Entity
            });
            me.$emit("save-success");
            res(result);
          })
          .catch(result => {
            //console.log(["中断的理由？ 【++4】", arguments]);
            //# 5 中断的，要将中断的信息传递出去，为wrap式多项save操作 提供一个数据参考，如【add】方法
            if (result && result.statusText === "abort") {
              me.showLoad_upd && (theStore.state.progress = 40);
              res({ result, type: "abort" });
            } else {
              rej(result);
            }
          });
      });
    },
    //【5】从数据库中删除，不会有多次，只考虑一次情况
    delete(options, Entity) {
      let me = this;

      let showLoad = !me.storeLoading;

      options = options || {};
      showLoad && (theStore.state.progress = 20);
      return new Promise((res, rej) => {
        //# 5 交给后台判断 是否有ID
        $.ajax({
          url: Vue.Api.designBI,
          data: tool.apply(
            {
              method: Vue.Api.designBI.Delete,
              ids: JSON.stringify([me.recordData.id]),
              table: Entity.table,
              groupId: theStore.state.pageGroupId
            },
            options
          )
        })
          //#1 delete 就把后续操作交给 实体自己了
          .then(result => {
            console.log(["测试delete", result]);
            // theStore.commit("DeleteRecord", {
            //   Entity: Entity,
            //   //table: Entity.table,
            //   // //item 附加
            //   // templateCode: options.templateCode
            // });
            res(result);
          })
          .catch(result => {
            Vue.$alert("失败", "删除失败！")
              .then(() => {})
              .catch(() => {});
            rej(result);
          })
          .finally(() => {
            showLoad && (theStore.state.progress = 100);
          });
      });
    },

    //-------------
    // 二、开放方法
    //----------

    //# 1 对record的设置，不影响到recData上
    set(val) {
      let me = this;
      me.record = tool.mergeSet(Vue.set, me.record, val);
    },
    get(key) {
      return this.record[key];
    },
    //# 2 将触发一次 record转化 和 save trigger
    setData(data) {
      let me = this;
      me.recordData = tool.mergeSet(Vue.set, me.recordData, data);
    },
    setDataIf(data) {
      let me = this;
      me.recordData = tool.mergeSetIf(Vue.set, me.recordData, data);
    },
    getData(key) {
      return this.recordData[key];
    },
    //# 3 主动根据 recordData 刷新一次record 以及 save
    refreshData() {
      let me = this;
      me.setData({});
    }
  },
  created() {
    let me = this,
      data = me.baseData,
      baseCfg = me.baseCfg;
    //【+1】检测default一定为 fn 或 未定义
    tool.each(baseCfg, (key, val) => {
      if (
        (val.default && !tool.isFunction(val.default)) ||
        (val.default_save && !tool.isFunction(val.default_save))
      ) {
        throw `RecordParser配置的属性中，default、default_save值设定器必须设置为function形式！key:${key},val:${val}`;
      }
    });

    //console.log(["奇幻的 转换", data]);
    //【+2】初始
    let initRec = me.newRecordData();
    if (data && tool.isObject(data)) {
      tool.merge(initRec, data);
    }
    me.recordData = initRec;
  }
};
</script>

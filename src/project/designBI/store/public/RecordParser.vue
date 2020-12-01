<script>
import tool from "@/plugins/js/tool";
import Vue from "vue";
import { theStore } from "../index";
import $ from "@/plugins/js/loader";
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
      recordData: {}
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
    }
  },
  watch: {
    recordData(newVal) {
      console.log(["刷新了！recordData"]);
      this.triggerSave(newVal);
    },
    recordMid(newVal) {
      console.log(["刷新了！recordMid"]);
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
        if (tool.isArray(readVal)) {
          let readValArray = [];
          tool.each(readVal, rData => {
            readValArray.push(me.loadRecordData(rData, true));
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
    //【4】保存函数
    save(options, Entity) {
      let me = this;
      options = options || {};
      return new Promise((res, rej) => {
        $.ajax({
          url: Vue.Api.designBI,
          data: tool.apply(
            {
              method: Vue.Api.designBI.AddOrUpd,
              records: JSON.stringify([me.recordData]),
              table: Entity.table
            },
            options
          )
        })
          .then(result => {
            console.log(["测试save", result]);
            theStore.commit("AddOrUpdRecords", {
              Entity: Entity
              //table: Entity.table,
              // //item 附加
              // templateCode: options.templateCode
            });
            res(result);
          })
          .catch(result => {
            rej(result);
          });
      });
    },

    //-------------
    // 二、开放方法
    //----------

    //# 1 对record的设置，不影响到recData上
    set(val) {
      let me = this;
      tool.mergeSet(Vue.set, me.record, val);
    },
    get(key) {
      return this.record[key];
    },
    //# 2 将触发一次 record转化 和 save trigger
    setData(data) {
      let me = this;
      me.recordData = tool.mergeSet(Vue.set, me.recordData, data);
    },
    getData(key) {
      return this.recordData[key];
    },
    //# 3 主动根据 recordData 刷新一次record 以及 save
    refreshRecord() {
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

    //【+2】初始
    let initRec = me.newRecordData();
    if (data && tool.isObject(data)) {
      tool.merge(initRec, data);
    }
    me.recordData = initRec;
  }
};
</script>

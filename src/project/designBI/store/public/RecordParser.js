import tool from "@/plugins/js/tool";
import { theStore } from "../index";
import $ from "@/plugins/js/loader";
import Vue from "vue";

//请使用 set的方式设置 RecordParser的rec中属性值!
export default class RecordParser {
  //@ 1 基本配置
  baseCfg = null;
  //@ 2 new 出来以及后续改动的 record
  get record() {
    return this._record;
  }
  set record(rec) {
    this._record = rec;
    this._recordData = this.getRecordSaveData(rec);
  }
  //@ 3 获取时得到的 data形式的 record
  get recordData() {
    return this._recordData;
  }

  //----------
  // 二、方法
  //----------

  //# 1 对record的设置
  set(val) {
    let me = this;
    me.record = tool.apply(me.record, val);
  }
  get(key) {
    return this.record[key];
  }

  //# 2 对 data形式的 record的设置
  setData(data) {
    let me = this,
      addRec = me.loadRecordData(data);
    me.set(addRec);
  }

  constructor(baseCfg, data) {
    let me = this;
    //【+1】检测default一定为 fn 或 未定义
    tool.each(baseCfg, (key, val) => {
      if (
        (val.default && !tool.isFunction(val.default)) ||
        (val.default_save && !tool.isFunction(val.default_save))
      ) {
        console.warn([
          "RecordParser配置的属性中，default、default_save值设定器必须设置为function形式！",
          key,
          val
        ]);
      }
    });
    //【+2】初始
    me.baseCfg = baseCfg;
    let initRec = me.newRecord();
    if (data) {
      let dataRec = me.loadRecordData(data);
      tool.apply(initRec, dataRec);
    }
    me.record = initRec;
    //【+3】如果有
  }

  //【1】根据baseCfg初始化一个record，default有用，初始化不用迭代
  newRecord() {
    let me = this,
      rec = {};
    tool.each(me.baseCfg, function(key, val) {
      let initVal = "";
      if (tool.isFunction(val.default)) {
        initVal = val.default(rec, me.baseCfg);
      }
      rec[key] = initVal;
    });
    return rec;
  }

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
          let theObj = theStore.getters.getInstance(readVal.$context);
          resultVal = readVal.propName ? theObj[readVal.propName] : theObj;
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

      rec[key] = resultVal;
    });
    return rec;
  }

  //【3】根据实例record 转化为data，触发save
  getRecordSaveData(record, inLoop) {
    let me = this,
      rec = {};
    tool.each(inLoop ? record : me.baseCfg, function(key, val) {
      let initVal = record[key],
        resultVal = null;
      //~ 1 转化为save值
      if (!inLoop && tool.isFunction(val.default_save)) {
        initVal = val.default_save(record, me.baseCfg);
      }

      //~ 2 按Array、function、context、普通对象进行JSON化
      if (tool.isArray(initVal)) {
        let valArray = [];
        tool.each(initVal, oneProp => {
          valArray.push(me.getRecordSaveData(oneProp, true));
        });
        resultVal = valArray;
      }
      //# 2 Func
      else if (tool.isFunction(initVal)) {
        resultVal = initVal.toString();
      }
      //# 3 如果有cfg的 key配置，那么是一个context的对象
      else if (initVal["$cfg_" + key]) {
        resultVal = initVal["$cfg_" + key];
      }
      //# 4 对象类型深入
      else if (tool.isObject(initVal)) {
        resultVal = me.getRecordSaveData(initVal, true);
      } else {
        //# 5 值类型
        resultVal = initVal;
      }

      rec[key] = resultVal;
    });
    return rec;
  }

  save(options) {
    let me = this;
    options = options || {};
    return $.ajax({
      url: Vue.Api.designBI,
      data: tool.apply(
        {
          method: Vue.Api.designBI.AddOrUpd,
          records: JSON.stringify([me.record])
        },
        options
      )
    });
  }
}

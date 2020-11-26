import tool from "@/plugins/js/tool";
import { theStore } from "../index";
import $ from "@/plugins/js/loader";
import Vue from "vue";

//请使用 set的方式设置 RecordParser的rec中属性值!
export default class RecordParser {
  //@ 1 基本配置
  baseCfg = null;
  _record = {};
  _recordData = {};
  //@ 2 new 出来以及后续改动的 record
  get record() {
    return this._record;
  }
  // set record(rec) {
  //   this._record = rec;
  //   this._recordData = this.getRecordSaveData(rec);
  // }
  //@ 3 获取时得到的 data形式的 record
  get recordData() {
    return this._recordData;
  }
  //@ 3-2 部分影响到record 上，record上还有其他属性
  set recordData(recData) {
    this._recordData = recData;
    tool.merge(this._record, this.loadRecordData(this._recordData));
  }

  //----------
  // 二、方法
  //----------

  //# 1 对record的设置，不影响到recData上
  set(val) {
    let me = this;
    tool.merge(me._record, val);
    //me.record = tool.apply(me.record, val);
  }
  get(key) {
    return this.record[key];
  }

  //# 2 对 data形式的 record的设置
  setData(data) {
    let me = this;
    //addRec = me.loadRecordData(data, true);
    console.log(["setData的问题"]);
    //me.set(addRec);
    me.recordData = tool.merge(me._recordData, data);
  }

  getData(key) {
    return this._recordData[key];
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
    let initRec = me.newRecordData();
    if (data && tool.isObject(data)) {
      tool.merge(initRec, data);

      //let dataRec = me.loadRecordData(data);
      //tool.apply(initRec, dataRec);
    }
    me.recordData = initRec;

    //me.record = initRec;
    //【+3】如果有
  }

  //【1】根据baseCfg初始化一个record，default有用，初始化不用迭代
  newRecordData(jsonFields) {
    let me = this,
      //hasProp = false,
      rec = {};
    //console.log(["newRecordData 的问题"]);
    tool.each(jsonFields ? jsonFields : me.baseCfg, function(key, val) {
      //不对$属性采取措施 --- 因recData 取消该限制
      // if (key && key[0] === "$") {
      //   return;
      // }
      //hasProp = true;
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

      rec[key] = initVal;
    });
    return rec; //hasProp ? rec : null;
  }

  loadContextByProp(sourceObj, propArray) {
    if (!propArray || !propArray.length) {
      return null;
    }
    let me = this,
      deepObj = sourceObj[propArray[0]];
    propArray.splice(0, 1);
    if (propArray.length > 0) {
      return me.loadContextByProp(deepObj, propArray);
    } else {
      return deepObj;
    }
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
          //# 1.3 如果存在深入选择 那么进行深入
          if (readVal.$propNames && readVal.$propNames.length) {
            resultVal = me.loadContextByProp(
              theObj,
              tool.clone(readVal.$propNames)
            );
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

      rec[key] = resultVal;
    });
    return rec;
  }

  //【3】根据实例record 转化为data，触发save
  getRecordSaveData(record, inLoop, jsonFields) {
    let me = this,
      rec = {};
    //@@ 1 循环且未传入 jsonFields时，读record
    tool.each(
      inLoop && !jsonFields ? record : jsonFields || me.baseCfg,
      function(key, val) {
        //~ 0 save时的jsonFields的 save钩子触发,先是内部
        if (!inLoop) {
          if (val.$jsonFields && record[key]) {
            record[key] = me.getRecordSaveData(
              record[key],
              false,
              val.$jsonFields
            );
          }

          //~ 1 后是外头， 转化为save值
          if (!inLoop && tool.isFunction(val.default_save)) {
            record[key] = val.default_save(record, jsonFields || me.baseCfg);
          }
          //@@ 2 如果是传入jsonFields的，那么下面的步骤就不走了，因为会重复，仅转换下 save钩子即可
          if (jsonFields) {
            rec[key] = record[key];
            return;
          }
        }

        //~ 3 对，这个值应该是 data的值，只是放在了 $cfg上
        //如果有cfg的 key配置，那么是一个context的对象 再转化为对应key上
        let initVal = record["$cfg_" + key] || record[key],
          resultVal = null;

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
        } else if (tool.isObject(initVal)) {
          //# 4 对象类型深入
          resultVal = me.getRecordSaveData(initVal, true);
        } else {
          //# 5 值类型
          resultVal = initVal;
        }

        rec[key] = resultVal;
      }
    );
    return rec;
  }

  save(options) {
    let me = this;
    options = options || {};
    return new Promise((res, rej) => {
      $.ajax({
        url: Vue.Api.designBI,
        data: tool.apply(
          {
            method: Vue.Api.designBI.AddOrUpd,
            records: JSON.stringify([me.recordData])
          },
          options
        )
      })
        .then(result => {
          console.log(["测试save", result]);
          theStore.commit("AddOrUpdRecords", {
            recordData: me.recordData,
            table: options.table,
            //item 附加
            templateCode: options.templateCode
          });
          res(result);
        })
        .catch(result => {
          rej(result);
        });
    });
  }
}

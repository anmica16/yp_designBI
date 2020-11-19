//import tool from "@/plugins/js/tool";
import tool from "../../../../plugins/js/tool";
import RecordParser from "../public/RecordParser";
export default class DrawEntityBase {
  constructor(baseCfg, record) {
    let me = this;
    me.parser = new RecordParser(baseCfg, record);
  }

  //----------
  // 一、属性变量
  //----------
  get baseCfg() {
    return this.parser.baseCfg;
  }
  get record() {
    return this.parser.record;
  }
  set record(val) {
    this.parser.record = val;
  }
  get recordData() {
    return this.parser.recordData;
  }
  get $isNew() {
    return this.record.id + "" === "";
  }

  //----------
  // 二、方法
  //----------
  set(val) {
    this.parser.set(val);
  }
  get(key) {
    return this.parser.get(key);
  }
  setData(data) {
    this.parser.setData(data);
  }
  save(options) {
    return this.parser.save(options);
  }
}

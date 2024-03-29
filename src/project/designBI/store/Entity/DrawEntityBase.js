//import tool from "@/plugins/js/tool";
import tool from "@/plugins/js/tool";
import Vue from "vue";
import RecordParserVue from "../public/RecordParser.vue";
const RecordParser = Vue.extend(RecordParserVue);
export default class DrawEntityBase {
  table = "base";
  parser = null;
  constructor(baseCfg, record) {
    let me = this,
      theRec = tool.parseObject(record);

    me.parser = new RecordParser({
      propsData: {
        baseConfig: baseCfg,
        baseData: theRec || {}
      }
    });
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
  // set record(val) {
  //   this.parser.record = val;
  // }
  get recordData() {
    return this.parser.recordData;
  }
  set recordData(val) {
    this.parser.recordData = val;
  }
  get $isNew() {
    return !this.recordData.id;
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
  setDataIf(data) {
    this.parser.setDataIf(data);
  }
  getData(key) {
    return this.parser.getData(key);
  }
  save(options) {
    options = options || {};
    //options.table = options.table || this.table;
    return this.parser.save(options, this);
  }
  delete(options) {
    options = options || {};
    //options.table = options.table || this.table;
    return this.parser.delete(options, this);
  }
  refreshData() {
    this.parser.refreshData();
  }
}

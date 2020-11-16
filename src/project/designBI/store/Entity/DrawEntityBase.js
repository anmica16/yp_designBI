//import tool from "@/plugins/js/tool";
import RecordParser from "../public/RecordParser";
export default class DrawEntityBase {
  constructor(baseCfg, record) {
    let me = this;
    me.parser = new RecordParser(baseCfg, record);
  }

  set(val) {
    this.parser.set(val);
  }
  setData(data) {
    this.parser.setData(data);
  }
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
}

import tool from "@/plugins/js/tool";
//管理拽入的控件
let itemManager = {
  records: [],

  add(el) {
    this.records.push(el);
  },

  remove(el) {
    if (tool.isNumber(el)) {
      if (el < this.records.length) {
        this.records.splice(el, 1);
      }
    } else {
      let at = this.records.indexOf(el);
      if (at > -1) {
        this.records.splice(at, 1);
      }
    }
  }
};

window.D = window.D || {};
window.D.itemManager = itemManager;

export default itemManager;

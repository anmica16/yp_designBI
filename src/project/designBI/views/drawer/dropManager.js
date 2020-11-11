import tool from "@/plugins/js/tool";
//管理拽入的控件
let dropManager = {
  boxs: [],

  add(el) {
    this.boxs.push(el);
  },

  remove(el) {
    if (tool.isNumber(el)) {
      if (el < this.boxs.length) {
        this.boxs.splice(el, 1);
      }
    } else {
      let at = this.boxs.indexOf(el);
      if (at > -1) {
        this.boxs.splice(at, 1);
      }
    }
  }
};

window.D = window.D || {};
window.D.dropManager = dropManager;

export default dropManager;

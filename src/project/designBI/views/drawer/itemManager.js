import tool from "@/plugins/js/tool";
//管理拽入的控件
let itemManager = {
  items: [],

  add(newItem) {
    if (!newItem.recordData.xtype) {
      throw `未设定xtype，请检查！`;
    }
    let me = this,
      find = me.items.find(item => item.recordData.xtype === newItem.recordData.xtype);
    if (!find) {
      this.items.push(newItem);
    } else {
      throw `重复的xtype：${newItem.xtype}，请重新命名后再生成！`;
    }
  },

  remove(item) {
    if (tool.isNumber(item)) {
      if (item < this.items.length) {
        this.items.splice(item, 1);
      }
    } else {
      let at = this.items.indexOf(item);
      if (at > -1) {
        this.items.splice(at, 1);
      }
    }
  }
};

export default itemManager;

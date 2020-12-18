import tool from "@/plugins/js/tool";
export default {
  data() {
    return {
      //~ 2 加入进来的shadow，单个操作不会出现多个， --> 只有 BaseBubble和 CellBubble有
      addShadows: [],
      addMasks: []
    };
  },
  methods: {
    //【shadow 1】拖拽
    dragShadow(shadow) {
      let me = this;
      //# 1 加入到自己体系
      if (shadow.parent !== me) {
        if (shadow.parent) {
          let at = shadow.parent.addShadows.indexOf(shadow);
          at > -1 && shadow.parent.addShadows.splice(at, 1);
        }
        shadow.parent = me;
        let at2 = me.addShadows.indexOf(shadow);
        at2 < 0 && me.addShadows.push(shadow);
      }
    },
    resizeMask(mask) {
      let me = this;
      //# 1 加入到自己体系
      if (mask.parent !== me) {
        if (mask.parent) {
          let at = mask.parent.addMasks.indexOf(mask);
          at > -1 && mask.parent.addMasks.splice(at, 1);
        }
        mask.parent = me;
        let at2 = me.addMasks.indexOf(mask);
        at2 < 0 && me.addMasks.push(mask);
      }
    }
  }
};

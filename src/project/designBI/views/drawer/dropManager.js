import tool from "@/plugins/js/tool";
import Vue from "vue";
let dropManagerCfg = {
  name: "dropManager",
  data() {
    return {
      //# 1 在Bubble中 引用
      //管理拽入的控件
      items: new Map()
    };
  },
  computed: {
    mapNodes() {
      let me = this,
        dragNodes = [],
        ownerNodes = [];
      me.items.forEach((val, key) => {
        ownerNodes.push(key);
        dragNodes.push(val);
      });
      return {
        dragNodes,
        ownerNodes
      };
    },
    dragNodes() {
      return this.mapNodes.dragNodes;
    },
    ownerNodes() {
      return this.mapNodes.ownerNodes;
    }
  },
  methods: {
    set() {
      return this.items.set(...arguments);
    },
    get() {
      return this.items.get(...arguments);
    },

    remove(el) {
      if (tool.isNumber(el)) {
        if (el < this.items.length) {
          this.items.splice(el, 1);
        }
      } else {
        let at = this.items.indexOf(el);
        if (at > -1) {
          this.items.splice(at, 1);
        }
      }
    },

    checkResizeStop(ownerNode, dragNode) {
      let me = this;
      return new Promise((res, rej) => {
        res();
      });
    },

    checkDragStop(ownerNode, dragNode) {
      let me = this;
      return new Promise((res, rej) => {
        res();
      });
    }
  },
  created() {
    let me = this;
    //--------
    // drop管理器事件体系：
    //【1】有一个组件触发了 drop判定
    me.$on("dragstop", function(draggingNode, l, t, w, h) {
      //~ 1 该区域有哪些可选 能drop进的组件
      //~ 2 选择图层最前的元素 ==》 这个交给图层数来判断，父亲链
      //~ 3 进行拽入，传入Entity
    });
  }
};
let dropManagerCtor = Vue.extend(dropManagerCfg);
const dropManager = new dropManagerCtor();

export default dropManager;

import $ from "jquery";
import tool from "@/plugins/js/tool";

let candy = {
  //name: "candy",
  props: {
    //# 1 管理拖拽用
    candyMaster: {
      type: Object,
      required: true
    },
    vNode: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dragDom: null,
      dragStart: false,
      dragging: false,
      //# 1 悬浮的父亲coating节点
      overCoating: null
      //mouseX: null,
      //mouseY: null
    };
  },
  methods: {
    handleDown(e) {
      let me = this,
        uid = tool.random62(4),
        dom = $(me.vNode.$el).clone();
      $("body").append(dom);
      dom.css({
        display: "none",
        position: "absolute"
      });
      me.dragDom = dom;
      me.dragStart = true;
      //~ 1 初始位置
      // me.mouseX = e.pageX;
      // me.mouseY = e.pageY;

      $("body").on(`mousemove.${uid}`, me.handleMove);
      $("body").on(`mouseup.${uid}`, me.handleUp);
    },
    handleMove(e) {
      let me = this;
      if (!me.dragStart) {
        return;
      }
      me.dragging = true;

      //~ 1 移动位置
      let w = me.dragDom.width(),
        h = me.dragDom.height(),
        left = e.pageX - 0.4 * w,
        top = e.pageY - 0.5 * h;

      me.dragDom.css({
        display: "block",
        left: left + "px",
        top: top + "px"
      });

      //~ 2 master over检测
      me.candyMaster.checkOver({ left, top }, me.vNode);
    },
    handleUp(e) {
      let me = this;
      me.dragging = false;
      me.dragStart = false;

      //~ 2 结束
      me.dragDom.remove();

      me.candyMaster.checkDrop({ left: e.pageX, top: e.pageY }, me.vNode);
    }
  }
};

let candyMaster = {
  data() {
    return {
      //# 1 vNode形式的
      coatings: [],
      overCoatings: []
    };
  },
  methods: {
    addCoating(c) {
      let me = this,
        at = me.coatings.indexOf(c);
      if (at < 0) {
        me.coatings.push(c);
      }
    },
    removeCoating(c) {
      let me = this,
        at = me.coatings.indexOf(c);
      if (at > -1) {
        me.coatings.splice(at, 1);
      }
    },
    //# 1简单处理，就同一面，不重复
    checkOver(pos, vnode) {
      let me = this,
        stopX = pos.left,
        stopY = pos.top;
      //~ 1 该区域有哪些可选 能drop进的组件
      let fitOwners = [];
      me.coatings.forEach(function(cNode) {
        let dom = $(cNode.$el);
        //# 1 要可见
        if (!dom.is(":visible")) {
          return;
        }

        //# 2 开始检测
        let off = dom.offset(),
          rectX = off.left,
          rectY = off.top,
          rectW = dom.width(),
          rectH = dom.height();
        //console.log(["比较与client的点 X", stopX, rectX, "Y", stopY, rectY]);
        if (
          stopX > rectX &&
          stopX < rectX + rectW &&
          stopY > rectY &&
          stopY < rectY + rectH
        ) {
          fitOwners.push(cNode);
        }
      });
      fitOwners.forEach(cNode => {
        if (me.overCoatings.indexOf(cNode) < 0) {
          me.overCoatings.push(cNode);
          //# 3-1 初次得有个 离开的动作
          $(cNode.$el).one("mouseleave", () => {
            cNode.candyLeave(vnode);
          });
        }
        //# 3 交给coating来处理 位置
        cNode.candyOver(pos, vnode);
      });
    },
    checkDrop(pos, vnode) {}
  }
};

let coating = {
  props: {
    //# 1 管理拖拽用
    candyMaster: {
      type: Object,
      required: true
    },
    vNode: {
      type: Object,
      required: true
    },
    candyClass: {
      type: String,
      default: "candy"
    }
  },
  data() {
    return {
      //# 1 里面也许有，ref为对应 key
      candies: []
    };
  },
  methods: {
    candyOver(pos, candyHostNode) {
      let me = this,
        nowAt = 0;
      //# 1 寻找正确的位置，然后置换
      tool.each(me.candies, c => {
        let key = c.key,
          cEl = me.$refs[key],
          cDom = $(cEl);
      });
    }
  },
  mounted() {
    let me = this;
    me.candyMaster.addCoating(me);
  },
  beforeDestroy() {
    let me = this;
    me.candyMaster.removeCoating(me);
  }
};

export { candy, candyMaster, coating };

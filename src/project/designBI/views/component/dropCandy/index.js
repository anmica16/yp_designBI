import $ from "jquery";
import tool from "@/plugins/js/tool";

let Candy = {
  //name: "candy",
  props: {
    //# 1 管理拖拽用
    candyMaster: {
      type: Object
      //required: true
    },
    Dim: Object
  },
  data() {
    return {
      dragDom: null,
      dragStart: false,
      dragging: false
      //# 1 悬浮的父亲coating节点
      //overCoating: null
      //mouseX: null,
      //mouseY: null
    };
  },
  methods: {
    candyHandleDown(e) {
      let me = this,
        uid = tool.random62(4),
        dom = $(me.$el).clone();
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

      //~ 2 【update】从coating中触发？

      $("body").on(`mousemove.${uid}`, me.handleMove);
      $("body").on(`mouseup.${uid}`, me.handleUp);
    },
    candyHandleMove(e) {
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
      me.candyMaster.checkOver({ left, top }, me);
    },
    candyHandleUp(e) {
      let me = this;
      me.dragging = false;
      me.dragStart = false;

      //~ 2 结束
      me.dragDom.remove();

      me.candyMaster.checkDrop({ left: e.pageX, top: e.pageY }, me);
    }
  }
};

let CandyMaster = {
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
    checkOver(pos, candy) {
      let me = this,
        stopX = pos.left,
        stopY = pos.top;
      //~ 1 该区域有哪些可选 能drop进的组件
      let fitOwners = [];
      me.coatings.forEach(function(coat) {
        let dom = $(coat.$el);
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
          fitOwners.push(coat);
        }
      });
      fitOwners.forEach(coat => {
        if (me.overCoatings.indexOf(coat) < 0) {
          me.overCoatings.push(coat);
          //# 3-1 初次得有个 离开的动作
          $(coat.$el).one("mouseleave", () => {
            coat.candyLeave(candy);
          });
        }
        //# 3 交给coating来处理 位置
        coat.candyOver(pos, candy);
      });
    },
    checkDrop(pos, candy) {
      let me = this;
      me.overCoatings = [];
    }
  }
};

let Coating = {
  props: {
    //# 1 管理拖拽用
    candyMaster: {
      type: Object
      //required: true
    }
  },
  data() {
    return {
      //# 1 里面也许有，ref为对应 key
      candies: []
    };
  },
  methods: {
    candyOver(pos, candy) {
      let me = this,
        cDim = candy.Dim,
        cgToDimAt = null,
        overCandyAt = me.candies.findIndex(c => {
          return c.$id === cDim.$id;
        });
      //# 1 寻找正确的位置，然后置换
      tool.each(me.candies, (c, i) => {
        let key = c.key,
          cEl = me.$refs[key],
          cDom = $(cEl),
          off = cDom.offset(),
          rectX = off.left,
          rectW = cDom.width();
        if (pos.left > rectX && pos.left < rectX + rectW) {
          //~ 1 要么左边，
          if (pos.left < rectX + 0.4 * rectW) {
            cgToDimAt = i;
          } else {
            // 2 要么右边
            cgToDimAt = i + 1;
          }
          return false;
        }
      });
      //# 2 如果可替换的
      if (cgToDimAt) {
        //~ 1 未加入，则直接insert
        if (overCandyAt < 0) {
          tool.insert(me.candies, cgToDimAt, cDim);
        } else {
          //~ 2 加入 则替换
          let overCandy = me.candies.splice(overCandyAt, 1);
          tool.insert(me.candies, cgToDimAt - 1, overCandy);
        }
      } else {
        //# 3 如果无，则不变 or 新加入
        if (overCandyAt < 0) {
          me.candies.push(cDim);
        }
      }
    },
    candyLeave(pos, candy) {
      let me = this;
      //# 1 dragging中
      if (candy.dragging) {
        let cDim = candy.Dim,
          candyAt = me.candies.findIndex(c => {
            return c.$id === cDim.$id;
          });
        if (candyAt > -1) {
          me.candies.splice(candyAt, 1);
        }
      } else {
        //# 2 结束drag
      }
    }
  },
  mounted() {
    let me = this;
    me.candyMaster && me.candyMaster.addCoating(me);
  },
  beforeDestroy() {
    let me = this;
    me.candyMaster && me.candyMaster.removeCoating(me);
  }
};

export { Candy, CandyMaster, Coating };

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
    //# 2 放在这里面的一些变量！通用性强，同一个对象 里有 额外 parentCoating
    Dim: Object
  },
  data() {
    return {
      dragDom: null,
      dragStart: false,
      dragging: false,
      eventId: null

      //mouseX: null,
      //mouseY: null
    };
  },
  methods: {
    candyHandleDown(e) {
      let me = this,
        uid = tool.random62(4),
        dom = $(me.$el).clone();
      me.eventId = uid;

      console.log(["drag开始！", uid, me]);

      $("body").append(dom);
      dom.addClass("edit drag");
      dom.css({
        display: "none",
        position: "absolute",
        left: 0,
        top: 0,
        "z-index": 999
      });
      me.dragDom = dom;
      me.dragStart = true;
      //~ 1 初始位置
      // me.mouseX = e.pageX;
      // me.mouseY = e.pageY;

      //~ 2 【update】从coating中触发？

      $("body").on(`mousemove.${uid}`, me.candyHandleMove);
      $("body").on(`mouseup.${uid}`, me.candyHandleUp);
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

      $("body").off(`mousemove.${me.eventId}`);
      $("body").off(`mouseup.${me.eventId}`);

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
          // $(coat.$el).one("mouseleave", () => {
          //   coat.candyLeave(candy);
          // });
        }
        //# 3 交给coating来处理 位置
        coat.candyOver(pos, candy);
      });
      //# 4 离开动作
      me.overCoatings.slice().forEach(coat => {
        let at = fitOwners.indexOf(coat);
        if (at < 0) {
          me.overCoatings.splice(at, 1);
          coat.candyLeave(candy);
        }
      });
    },
    checkDrop(pos, candy) {
      let me = this;
      me.overCoatings = [];
      me.$emit("dropEnd");
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
          return !tool.isNull(c.$id) && c.$id === cDim.$id;
        });
      //++ 1 父外套 关联
      if (cDim.parentCoating && cDim.parentCoating !== me) {
        cDim.parentCoating.candyLeave(candy);
      }
      cDim.parentCoating = me;
      //# 1 寻找正确的位置，然后置换
      tool.each(me.candies, (c, i) => {
        //~ 3 略过自身
        if (c.$id === cDim.$id) {
          return;
        }
        let key = c.key,
          cElBase = me.$refs[key],
          cEl2 = tool.isArray(cElBase) ? cElBase[0] : cElBase,
          cEl = cEl2.$el || cEl2,
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
          console.log(["~ 2 加入 则替换"]);
          let overCandy = me.candies.splice(overCandyAt, 1);
          tool.insert(me.candies, cgToDimAt - 1, overCandy);
        }
      } else {
        //# 3 如果无，则不变 or 新加入
        if (overCandyAt < 0) {
          me.candies.push(cDim);
        }
        //# 4 其他则保持不变
      }
    },
    candyLeave(candy) {
      let me = this,
        cDim = candy.Dim;
      //++ 1 父外套
      cDim.parentCoating === me && (cDim.parentCoating = null);
      //# 1 dragging中
      //if (candy.dragging) {
      let candyAt = me.candies.findIndex(c => {
        return c.$id === cDim.$id;
      });
      if (candyAt > -1) {
        console.log(["走了移除", candyAt]);
        me.candies.splice(candyAt, 1);
      }
      // } else {
      //   //# 2 结束drag
      // }
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

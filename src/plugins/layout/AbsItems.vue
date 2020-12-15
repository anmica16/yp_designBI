<script>
import $ from "jquery";
import tool from "@/plugins/js/tool";

export default {
  name: "AbsItems",
  props: {
    //~ 1 必选
    //# 1
    items: {
      type: Array,
      required: true,
    },
    //# 2 父元素，就不限定 vue控件了
    holderJS: {
      type: Object,
      required: true,
    },

    //~ 2 可选
    //【1】多少列布局？默认为6
    columnNumber: {
      type: Number,
      default: 6,
    },
    //【2】宽度模式
    widthMode: {
      type: String,
      default() {
        return "per";
      },
      validator(val) {
        let limit = ["per", "num"];
        return limit.indexOf(val) > -1;
      },
    },
    //【2-2】仅在num的情况有用
    maxWidth: {
      type: Number,
    },
    //【2-3】
    // maxHeight: {
    //   type: Number
    // }

    //【3-1】一行高度
    rowHeight: {
      type: Number,
      default: 20,
    },
  },
  data() {
    return {
      cellsMap: [],
    };
  },
  computed: {
    maxW() {
      let me = this;
      return me.widthMode === "per"
        ? 100
        : me.maxWidth || me.holderJS.scrollWidth;
    },
    //【3-2】一列宽度
    columnWidth() {
      return parseFloat((this.maxW / this.columnNumber).toFixed(2));
    },
  },
  methods: {
    //---------------------------
    // 一、 std 高宽left top 格子化
    //-------------
    //【Std 1】$atCol 设置item标准 left
    makeStdLeft(item) {
      let me = this,
        nCol = me.columnNumber,
        stdW = me.columnWidth;

      if (!item.left) {
        item.left = 0;
      }
      if (tool.isString(item.left) && item.left.indexOf("%") > -1) {
        item.$atCol = Math.floor(
          (parseFloat(item.left.replace("%", "")) / 100) * nCol
        );
      } else {
        item.$atCol = Math.floor(item.width / stdW);
      }
      item.$atCol > nCol - 1 && (item.$atCol = nCol - 1); //排除过大超标情况
      item.$atCol < 0 && (item.$atCol = 0); //排除过小，从而为0的情况
    },
    //【Std 2】$nCol 设置item标准Nth列宽度
    makeStdWidth(item) {
      let me = this,
        nCol = me.columnNumber,
        stdW = me.columnWidth;

      if (!tool.isNumber(item.$atCol)) {
        me.makeStdLeft(item);
      }

      if (!item.width) {
        item.width = stdW; //按照较小档次计算
      }
      if (tool.isString(item.width) && item.width.indexOf("%") > -1) {
        item.$nCol = Math.round(
          (parseFloat(item.width.replace("%", "")) / 100) * nCol
        );
      } else {
        item.$nCol = Math.round(item.width / stdW);
      }
      item.$nCol + item.$atCol > nCol && (item.$nCol = nCol - item.$atCol); //排除过大超标情况
      item.$nCol <= 0 && (item.$nCol = 1); //排除过小，从而为0的情况
    },
    //【Std 3】$atRow top的 map位置
    makeStdTop(item) {
      let me = this;

      // 【=1=】高度设置的准备工作
      if (!item.top) {
        item.top = 0;
      }
      if (tool.isString(item.top)) {
        let parseH = parseFloat(item.top);
        console.warn([
          "item的top不兼容百分比模式，请使用Number类型，已简易转化为parseFloat的形式。",
          `${item.top} -> ${top}`,
        ]);
        item.top = parseH;
      }
      let rowAt = Math.ceil(item.top / me.rowHeight);
      rowAt = rowAt >= 0 ? rowAt : 0; //避免row为负的情况，最小也是0行
      item.$atRow = rowAt;
    },
    //【Std 4】$rowH 设置item标准Nth列高度，规范化
    makeStdHeight(item) {
      let me = this;

      if (!tool.isNumber(item.$atRow)) {
        me.makeStdTop(item);
      }

      // 【=1=】高度设置的准备工作
      if (!item.height) {
        item.height = me.rowHeight; //默认一行
      }
      if (tool.isString(item.height)) {
        let parseH = parseFloat(item.height);
        console.warn([
          "item的高度不兼容百分比模式，请使用Number类型，已简易转化为parseFloat的形式。",
          `${item.height} -> ${parseH}`,
        ]);
        item.height = parseH;
      }
      let row = Math.round(item.height / me.rowHeight);
      row = row > 0 ? row : 1; //避免row为0的情况，最小也是1行
      item.$rowH = row;
    },
    //---------------------------
    // 二、 初始 去重复 去上下空隙
    //-------------
    orderItems() {
      let me = this;
      me.items.sort((a, b) => {
        let t = a.$atRow - b.$atRow,
          l = a.$atCol - b.$atCol;
        return t * (me.columnNumber + 1) + l;
      });
    },
    // 去重 2
    getRepeatAreaItems(checkItem) {
      let me = this,
        repeatItems = [];
      tool.each(me.items, (item) => {
        if (item === checkItem) {
          return;
        }
        //~ 1 水平方向重叠
        if (
          (item.$atCol < checkItem.$atCol &&
            item.$atCol + item.$nCol > checkItem.$atCol) ||
          (item.$atCol >= checkItem.$atCol &&
            item.$atCol < item.$atCol + item.$nCol)
        ) {
          //~ 2 垂直方向重叠
          if (
            (item.$atRow < checkItem.$atRow &&
              item.$atRow + item.$rowH > checkItem.$atRow) ||
            (item.$atRow >= checkItem.$atRow &&
              item.$atRow < item.$atRow + item.$rowH)
          ) {
            repeatItems.push(item);
          }
        }
      });
      return repeatItems;
    },
    // 去重 1
    deRepeatArea(beginItem, isLoop = true) {
      let me = this,
        nextItem = null,
        beginAt = 0;
      me.orderItems();
      if (beginItem) {
        let at = me.items.indexOf(beginItem);
        // 可以对倒数第二个进行判断 看倒数第一个是否在其范围内
        if (at > -1 && me.items.length >= 3 && at < me.items.length - 1) {
          beginAt = at;
        }
      }
      for (let i = beginAt; i < me.items.length; ++i) {
        let item = me.items[i];
        let reItems = me.getRepeatAreaItems(item);
        if (reItems.length) {
          let ratio = item.$rowH / item.$nCol;
          reItems.forEach(ri => {
            let ri_h = ri.$nCol * ratio;
            //# 1 高于 那么就往下
            if (ri.$rowH >= ri_h) {
              ri.$atRow += item.$rowH;
            } else {
              //# 2 低于 则往右
              ri.$atCol += item.$nCol;
            }
          });
          if (isLoop && i < me.items.length - 1) {
            nextItem = me.items[i+1];
          }
          return;
        }
      }
      if (nextItem) {
        me.deRepeatArea(nextItem);
      }
    },
    //向某方向（向上）移动一格


    //----------
    // 零、总运行
    //----------
    AbsStep1BeforeAdd() {
      let me = this;
      //~ 1 对items进行规则转化，形成map定位
      tool.each(me.items, (item) => {
        me.makeStdLeft(item);
        me.makeStdTop(item);
        me.makeStdWidth(item);
        me.makeStdHeight(item);
      });
      //~ 2
    },
  },
};
</script>

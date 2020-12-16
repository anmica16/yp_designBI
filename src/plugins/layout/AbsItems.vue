<script>
//import $ from "jquery";
import tool from "@/plugins/js/tool";

export default {
  name: "AbsItems",
  props: {
    //~ 1 必选
    //# 1
    items: {
      type: Array,
      required: true
    },
    //【2-2】传递数字 那么为 num模式，否则为 100%模式
    maxWidth: {
      type: [Number, String],
      default() {
        return "100%";
      }
    },
    //# 2 父元素，就不限定 vue控件了
    // holderJS: {
    //   type: Object,
    //   required: true,
    // },

    //~ 2 可选
    //【1】多少列布局？默认为6
    columnNumber: {
      type: Number,
      default: 6
    },
    //【2】宽度模式
    // widthMode: {
    //   type: String,
    //   default() {
    //     return "per";
    //   },
    //   validator(val) {
    //     let limit = ["per", "num"];
    //     return limit.indexOf(val) > -1;
    //   },
    // },
    //【2-3】
    // maxHeight: {
    //   type: Number
    // }

    //【3-1】一行高度
    rowHeight: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      cellsMap: []
    };
  },
  computed: {
    widthMode() {
      let me = this;
      if (tool.isNumber(me.maxWidth)) {
        return "num";
      } else {
        return "per";
      }
    },
    maxW() {
      let me = this;
      return me.widthMode === "per" ? 99.99 : me.maxWidth;
    },
    //【3-2】一列宽度
    columnWidth() {
      return parseFloat((this.maxW / this.columnNumber).toFixed(2));
    },
    //【Map 5-3 ··地图··Get】获得以 x轴 纵向遍历 为视角的map
    cellsMap_h() {
      let me = this,
        cellsMap = me.cellsMap;

      let cellsMapVertical = [];
      if (!cellsMap.length) {
        return cellsMapVertical;
      }
      let rowLen = cellsMap[0].length, //每行长度
        colLen = cellsMap.length; //每列长度

      for (let x = 0; x < rowLen; ++x) {
        for (let y = 0; y < colLen; ++y) {
          let cell = cellsMap[y][x]; //x不变，y在递增,cellsMap是先是纵坐标 再是横坐标
          //【1】cellsMap的纵形
          cellsMapVertical[x] = cellsMapVertical[x] || [];
          cellsMapVertical[x][y] = cell; //这样就转化为了每个 x上 y的集合的形式，x对应每个列
        }
      }
      return cellsMapVertical;
    }
  },
  methods: {
    //---------------------------
    // 三、 map 操作汇集
    //-------------
    //【Map 1-1 ··地图··构建】返回一个空白格子：
    newEmptyCell(x, y) {
      x = x || null;
      y = y || null;
      return {
        x,
        y,
        items: [], //表示所引用的 item

        //~ 通用方法
        indexOf(item) {
          return this.items.indexOf(item);
        },
        hasItem(item) {
          let cell = this,
            at = cell.indexOf(item);
          return at > -1 ? true : false;
        },
        unbindItem(item) {
          let cell = this,
            at = cell.indexOf(item);
          if (at > -1) {
            //~ 1 item 删除
            item.$cells = item.$cells || [];
            let cellAt = item.$cells.indexOf(cell);
            cellAt > -1 && item.$cells.splice(cellAt, 1);
            //~ 2 cell 删除
            cell.items.splice(at, 1);
          }
        },
        bindItem(item) {
          let cell = this,
            at = cell.indexOf(item);
          if (at < 0) {
            //~ 1 item 添加
            item.$cells = item.$cells || [];
            let cellAt = item.$cells.indexOf(cell);
            cellAt < 0 && item.$cells.push(cell);
            //~ 2 cell 添加
            cell.items.push(item);
          }
        }
      };
    },
    //【Map 1-2 ··地图··构建】创建一个新行，便于添加进 map中，其中 每一个格子是一个 cell对象
    newEmptyRow(y) {
      let me = this;
      let Row = [];
      for (let i = 0; i < me.columnNumber; ++i) {
        //要根据 nCol来弄格子！
        Row[i] = me.newEmptyCell(i, y);
      }
      return Row;
    },
    //【Map 1-3 ··地图··构建】补充地图不足行
    supplyMapRow(targetY) {
      let me = this,
        targetLen = targetY + 1;
      if (targetLen > me.cellsMap.length) {
        let startRow = me.cellsMap.length;
        for (let i = startRow; i < targetLen; ++i) {
          let newRow = me.newEmptyRow(i);
          me.cellsMap.push(newRow);
        }
      }
    },
    //【Map 2-1 ··地图··使用】按照 指定的位置信息 “使用”掉对应的格子，并对这些格子做好相应的记录、引用处理。
    useCells(item) {
      let me = this;
      //~ 1 清除之前联系
      me.freeCells(item);
      //~ 3 看是否要补充
      let maxY = item.$atRow + item.$rowH - 1,
        maxX = item.$atCol + item.$nCol - 1;
      me.supplyMapRow(maxY);
      //~ 4 进行联系建立
      for (let y = item.$atRow; y <= maxY; ++y) {
        let row = me.cellsMap[y];
        for (let x = item.$atCol; x <= maxX; ++x) {
          let cell = row[x];
          cell.bindItem(item);
        }
      }
    },
    //【Map 2-2 ··地图··使用】后期 移动 or change item的时候，格子相应变化前的 free动作
    freeCells(item) {
      let me = this;
      //~ 1 清除之前联系
      if (item.$cells && item.$cells.length) {
        item.$cells.forEach(cell => {
          cell.unbindItem(item);
        });
      }
    },

    //【Map 3-1】地图cell与items的关系刷新
    refreshMap(items) {
      let me = this,
        rItems = null;
      if (tool.isObject(items)) {
        rItems = [items];
      } else if (tool.isArray(items)) {
        rItems = items;
      } else {
        rItems = me.items;
      }
      rItems.forEach(item => {
        me.useCells(item);
      });
    },

    //【Map 5-4 ··地图··Get】返回item某方向紧邻的格子cells和其中的item引用数组。item可能是空白格子 也可能是控件元素。返回 cells数组与 neighbours数组
    getItemCloses(item, toward) {
      let me = this,
        closeCells = [],
        neighbours = [], //一起寻找，找到紧邻的items
        map = me.cellsMap, //水平方向地图
        mapVertical = me.cellsMap_h; //ok
      //【1】空白格子直接返回 空[]
      if (!item || item.isEmpty) {
        //isEmpty表示这只是一个 避免报错的 空{}对象
        return {
          closeCells: closeCells,
          neighbours: neighbours
        }; //直接返回空
      }
      //【2】控件元素就 遍历
      switch (toward.toLowerCase()) {
        case "right":
        case "r": // 假如是右
          for (let i = 0; i < item.$rowH; ++i) {
            let pCol = item.$atCol + item.$nCol - 1, //最右的位置
              pRow = item.$atRow + i,
              pToward = pCol + 1; //最右 +1
            if (pToward < map[pRow].length) {
              //保证没有出界
              let cell = map[pRow][pToward];
              //【1】cell格子加入完毕
              closeCells.push(cell);
              //【2】cell格子中的 item加入完毕
              cell.items.forEach(cItem => {
                !neighbours.some(function(a) {
                  return a === cItem;
                }) && neighbours.push(cItem);
              });
              //注意避免 空白格子的 null的加入
            } else {
              return {
                closeCells: closeCells,
                neighbours: neighbours
              }; //否则就提前返回，因为这里是矩形规则框框，一个边的点出界了，那么整个边都 出界了。
            }
          }
          break;

        case "left":
        case "l":
          for (let i = 0; i < item.$rowH; ++i) {
            let pCol = item.$atCol, //最左的位置
              pRow = item.$atRow + i,
              pToward = pCol - 1; //最左 -1
            if (pToward >= 0) {
              //保证没有出界
              let cell = map[pRow][pToward];
              //【1】cell格子加入完毕
              closeCells.push(cell);
              //【2】cell格子中的 itemRef加入完毕
              cell.items.forEach(cItem => {
                !neighbours.some(function(a) {
                  return a === cItem;
                }) && neighbours.push(cItem);
              });
            } else {
              return {
                closeCells: closeCells,
                neighbours: neighbours
              };
            }
          }
          break;

        case "up":
        case "u":
          for (let i = 0; i < item.$nCol; ++i) {
            let pCol = item.$atRow, //最左的位置
              pRow = item.$atCol + i,
              pToward = pCol - 1; //最左 -1
            if (pToward >= 0) {
              //保证没有出界
              let cell = mapVertical[pRow][pToward];
              //【1】cell格子加入完毕
              closeCells.push(cell);
              //【2】cell格子中的 itemRef加入完毕
              cell.items.forEach(cItem => {
                !neighbours.some(function(a) {
                  return a === cItem;
                }) && neighbours.push(cItem);
              });
            } else {
              return {
                closeCells: closeCells,
                neighbours: neighbours
              };
            }
          }
          break;

        case "down":
        case "d":
          for (let i = 0; i < item.$nCol; ++i) {
            let pCol = item.$atRow + item.$rowH - 1, //最右的位置
              pRow = item.$atCol + i,
              pToward = pCol + 1; //最右 +1
            if (pToward < mapVertical[pRow].length) {
              //保证没有出界
              let cell = mapVertical[pRow][pToward];
              //【1】cell格子加入完毕
              closeCells.push(cell);
              //【2】cell格子中的 itemRef加入完毕
              cell.items.forEach(cItem => {
                !neighbours.some(function(a) {
                  return a === cItem;
                }) && neighbours.push(cItem);
              });
            } else {
              return {
                closeCells: closeCells,
                neighbours: neighbours
              };
            }
          }
          break;

        default:
          throw "没有给定正确的方向！请在up down left right中选择一个！";
      }
      return {
        closeCells: closeCells,
        neighbours: neighbours
      }; //读取完毕 正常返回
    },
    //【Map 5-5 ··地图··Get】获得相反的方向
    getReverseToward(toward) {
      switch (toward) {
        case "right":
        case "r":
          return "l";

        case "left":
        case "l":
          return "r";

        case "up":
        case "u":
          return "d";

        case "down":
        case "d":
          return "u";

        default:
          throw "没有给定正确的方向！请在up down left right中选择一个！";
      }
    },

    //【Move 1 ··移动】【核心1】对item向某方向前进1个格子是否可行进行分析，会对邻近item元素进行迭代分析。一次只对 1格进行分析，不要多了。要多也可以，基于这个一格的method扩展即可
    makeMovePlan(item, toward, moveNbs) {
      //第三个参数表示紧邻程度，用于辨别是否是第一次，因为第一次不能为 null，而后续是可以为 null的
      let me = this;

      toward = toward || "up"; //默认为 向上，初始化阶段即向上

      // 当前plan阶段，就已经通过 扩散传播 获取主动调用该方法，在这个 方向上做了一次 plan，那么就忽略 这个 item接下来的 plan make
      if (item.$movePlan) {
        return item.$movePlan.canMove && !item.$movePlan.finished; // 就可以直接返回这个plan方向的 结论
      }

      // 为了垂直方向做准备
      let cellsAndNbs = me.getItemCloses(item, toward),
        closeCells = cellsAndNbs.closeCells,
        neighbours = cellsAndNbs.neighbours; //获得方向上 紧邻的 格子

      //# 1 公有的
      item.$movePlan = {
        toward,
        neighbours,
        closeCells,
        canMove: true
      };

      //【++ 1】如果不移动邻居，那么只要存在邻居，就判定为 false
      if (!moveNbs && neighbours && neighbours.length) {
        item.$movePlan.canMove = false;
        return false;
      }

      if (closeCells.length) {
        //【++ 2】如果moveNbs 为 false 那么到这里就表示 全为空格子了
        if (!moveNbs) {
          item.$movePlan.canMove = true;
          return true;
        } else {
          for (let i = 0; i < neighbours.length; ++i) {
            let neighbour = neighbours[i]; //邻居是 itemRef 而不是cell容器
            if (!me.makeMovePlan(neighbour, toward, moveNbs)) {
              //对每一个 紧邻格子 也做计划
              item.$movePlan.canMove = false;
              return false; //如果有 某个邻近格子做出了无法 move的判断，那么整个move plan就失败
            }
          }
          // 这里就是 迭代得到全部行可以 move的结论后的位置
          //  --- 提示：到达这里即表示 该控件占有的 全部行 的最右边紧邻格子 均边是 空白格子，这样才会返回下面的true
          item.$movePlan.canMove = true;
          //item
          return true;
        }
      } else {
        //没有格子，那么该 item就是到达 边界的 item
        //【2】到达最右边边界 从而无法移动的 item控件
        item.$movePlan.canMove = false;
        return false;
      }
    },

    //【Move 2 ··移动】【核心3-1】对item进行一格的移动
    moveItem(item) {
      let me = this;
      if (!item.$movePlan || !item.$movePlan.canMove) {
        return false;
      }
      switch (item.$movePlan.toward) {
        case "right":
        case "r":
          ++item.$atCol;
          break;

        case "left":
        case "l":
          --item.$atCol;
          break;

        case "up":
        case "u":
          --item.$atRow;
          break;

        case "down":
        case "d":
          ++item.$atRow;
          break;

        default:
          throw "没有给定正确的方向！请在up down left right中选择一个！";
      }
      //item.$newPosition = newPosition;//绑定好

      //item["$positionChanged"] = true; //表示需要重新设定 top left
      return true;
    },

    //【Move 3 ··移动】【核心2】对带有可行movePlan的item进行其movePlan的执行！
    processMovePlan(item, moveNbs, finishItems) {
      finishItems = finishItems || [];
      finishItems.push(item);

      if (item.$movePlan.finished) {
        return finishItems; //已经执行就不要再执行了，不然会重复进行，这既浪费效率，又会出bug
      }
      let me = this;
      let canMove = item.$movePlan && item.$movePlan.canMove;
      if (moveNbs) {
        let neighbours = item.$movePlan.neighbours;
        for (let i = 0; i < neighbours.length; ++i) {
          me.processMovePlan(neighbours[i], moveNbs, finishItems); //全都执行一次
        }
      }

      if (canMove) {
        // 移动
        me.moveItem(item);
        // 然后使用格子
        me.useCells(item);
      }

      item.$movePlan.finished = true; //表示已经执行了这一次movePlan
      return finishItems; //必然成功
    },
    sweepMovePlan(items, config = {}) {
      let me = this;
      if (tool.isObject(items)) {
        items = [items];
      }
      items.forEach(item => {
        if (item.$movePlan) {
          //# 1 成功的更有意义加入
          if (item.$movePlan.canMove) {
            item.$movePlanHis = item.$movePlanHis || [];
            tool.applyIf(item.$movePlan, config);
            item.$movePlanHis.unshift(item.$movePlan);
          }
          delete item.$movePlan;
        }
      });
    },
    doProcessMovePlan(item, moveNbs) {
      let me = this;
      let moveItems = me.processMovePlan(item, moveNbs);
      me.sweepMovePlan(moveItems, {
        originItem: item,
        time: new Date(),
        id: tool.random62(4)
      });
    },

    //【Move 4 ··移动】单个item的尝试移动
    tryMoveItem(item, toward, moveNbs) {
      let me = this;
      let plan = me.makeMovePlan(item, toward, moveNbs);
      if (plan) {
        me.doProcessMovePlan(item, moveNbs);
        return true;
      } else {
        return false;
      }
    },

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
        item.$atCol = Math.floor(item.left / stdW);
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
          `${item.top} -> ${top}`
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
          `${item.height} -> ${parseH}`
        ]);
        item.height = parseH;
      }
      let row = Math.round(item.height / me.rowHeight);
      row = row > 0 ? row : 1; //避免row为0的情况，最小也是1行
      item.$rowH = row;
    },
    //【Std 4】将定位四大要素给放入item
    setStdLayout(items) {
      let me = this;
      if (tool.isObject(items)) {
        items = [items];
      }
      items.forEach(item => {
        item.width = "calc( " + (99.99 * item.$nCol) / me.columnNumber + "%)";
        item.left = "calc( " + (99.99 * item.$atCol) / me.columnNumber + "%)";
        item.height = item.$rowH * me.rowHeight;
        item.top = item.$atRow * me.rowHeight;
      });
    },

    //---------------------------
    // 二、 初始 去重复 加入地图 去上下空隙
    //-------------
    orderItems(toward) {
      let me = this;
      me.items.sort((a, b) => {
        let t = a.$atRow - b.$atRow,
          l = a.$atCol - b.$atCol;
        if (["down", "d"].indexOf(toward) > -1) {
          t = -t;
          l = -l;
        } else if (["right", "r"].indexOf(toward) > -1) {
          l = -l;
        }
        return t * (me.columnNumber + 1) + l;
      });
    },
    //【de 2】去重 2
    getRepeatAreaItems(checkItem) {
      let me = this,
        repeatItems = [];
      tool.each(me.items, item => {
        if (item === checkItem) {
          return;
        }
        //~ 1 水平方向重叠
        if (
          (item.$atCol < checkItem.$atCol &&
            item.$atCol + item.$nCol > checkItem.$atCol) ||
          (item.$atCol >= checkItem.$atCol &&
            item.$atCol < checkItem.$atCol + checkItem.$nCol)
        ) {
          //~ 2 垂直方向重叠
          if (
            (item.$atRow < checkItem.$atRow &&
              item.$atRow + item.$rowH > checkItem.$atRow) ||
            (item.$atRow >= checkItem.$atRow &&
              item.$atRow < checkItem.$atRow + checkItem.$rowH)
          ) {
            repeatItems.push(item);
          }
        }
      });
      return repeatItems;
    },
    //【de 1】去重
    deRepeatArea(beginItem, isLoop = true) {
      let me = this,
        nextItem = null,
        beginAt = 0;
      //~ 1 避免空
      if (!me.items.length) {
        return false;
      }
      // ~ 2 第一次顺序
      if (!beginItem) {
        me.orderItems();
      }
      if (beginItem) {
        let at = me.items.indexOf(beginItem);
        // 可以对倒数第二个进行判断 看倒数第一个是否在其范围内
        if (at > -1 && me.items.length >= 3 && at < me.items.length - 1) {
          beginAt = at;
        } else {
          return false; //避免死循环
        }
      }
      let item = me.items[beginAt];
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
        if (isLoop && beginAt < me.items.length - 1) {
          //# 3 主要针对后面的内容进行排序
          me.orderItems();
          nextItem = me.items[beginAt + 1];
          //# 4 下一次循环
          me.deRepeatArea(nextItem);
        }
      }
    },

    //【de up-down】去 上下间隙，每一个item都执行，直到均为false的 plan
    deGapSpaces(toward) {
      let me = this;

      me.orderItems(toward);
      me.items.forEach(item => {
        let plan = me.makeMovePlan(item, toward, true);
        while (plan) {
          me.doProcessMovePlan(item, true);
          plan = me.makeMovePlan(item, toward, true);
        }
        //# 2 最后一次补充false的 do
        me.doProcessMovePlan(item, true);
      });
    },

    //----------
    // 零、总运行
    //----------
    AbsStep1InitLayout() {
      let me = this;
      console.log(["AbsStep1InitLayout 过程！"]);
      //~ 1 对items进行规则转化，形成map定位
      tool.each(me.items, item => {
        me.makeStdLeft(item);
        me.makeStdTop(item);
        me.makeStdWidth(item);
        me.makeStdHeight(item);
      });
      //~ 2 去重
      me.deRepeatArea();
      //~ 2-2 放入地图
      me.items.forEach(item => {
        me.useCells(item);
      });

      //~ 3 去 上下间隙
      me.deGapSpaces("up");
      //~ 4 根据信息重设 高宽left top
      me.setStdLayout(me.items);
    }
  },
  created() {
    let me = this;
    me.AbsStep1InitLayout();
  }
};
</script>

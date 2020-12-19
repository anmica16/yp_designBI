<template>
  <div v-if="false"></div>
</template>

<script>
//import $ from "jquery";
import tool from "@/plugins/js/tool";
class AbsItems_Cell {
  x = null;
  y = null;
  items = [];

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  //~ 通用方法
  indexOf(item) {
    return this.items.indexOf(item);
  }
  hasItem(item) {
    let cell = this,
      at = cell.indexOf(item);
    return at > -1 ? true : false;
  }
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
  }
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
}

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
    },
    //【4】移动时的A线高度位置
    lineA: {
      type: Number,
      default: 0.2
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
    // cellsMap_h() {
    //   let me = this,
    //     cellsMap = me.cellsMap;

    //   let cellsMapVertical = [];
    //   if (!cellsMap.length) {
    //     return cellsMapVertical;
    //   }
    //   let rowLen = cellsMap[0].length, //每行长度
    //     colLen = cellsMap.length; //每列长度

    //   for (let x = 0; x < rowLen; ++x) {
    //     for (let y = 0; y < colLen; ++y) {
    //       let cell = cellsMap[y][x]; //x不变，y在递增,cellsMap是先是纵坐标 再是横坐标
    //       //【1】cellsMap的纵形
    //       cellsMapVertical[x] = cellsMapVertical[x] || [];
    //       cellsMapVertical[x][y] = cell; //这样就转化为了每个 x上 y的集合的形式，x对应每个列
    //     }
    //   }
    //   return cellsMapVertical;
    // },
    positionChange() {
      let me = this;
      return tool.throttle(me.positionChangeAtomic, 20);
    }
  },
  methods: {
    //---------------------------
    // 三、 map 操作汇集
    //-------------
    //【Map 1-1 ··地图··构建】返回一个空白格子：
    newEmptyCell(x, y) {
      return new AbsItems_Cell(x, y);
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
        let dCells = item.$cells.concat([]);
        dCells.forEach(cell => {
          cell.unbindItem(item);
        });
      }
    },
    //【Map 2-X】 取边界cell，以item为坐标系取
    getMarginCells(item, reAtRow, reAtCol) {
      let me = this,
        map = me.cellsMap,
        cells = [],
        x = item.$atCol,
        y = item.$atRow,
        passRow = tool.isNumber(reAtRow),
        passCol = tool.isNumber(reAtCol);

      //# 0 首先扩充一下
      if (passRow) {
        me.supplyMapRow(y + reAtRow);
      }

      //# 1 两者都有 取单个cell
      if (passRow && passCol) {
        let cell = map[y + reAtRow][x + reAtCol];
        cells.push(cell);
      }
      //# 2 仅行
      else if (passRow) {
        cells = map[y + reAtRow].slice(x, x + item.$nCol);
      }
      //# 3 仅列
      else if (passCol) {
        for (let i = 0; i < item.$rowH; ++i) {
          let cell = map[y + i][x + reAtCol];
          cells.push(cell);
        }
      }
      return cells;
    },
    //【Map 2-1-2 ··地图··使用】边际使用，小消费，坐标为相对于item自身，无free操作
    marginUseCells(item, reAtRow, reAtCol) {
      let me = this,
        cells = me.getMarginCells(item, reAtRow, reAtCol);
      cells.forEach(cell => {
        cell.bindItem(item);
      });
    },
    //【Map 2-2-2 ··地图··使用】边际free
    marginFreeCells(item, reAtRow, reAtCol) {
      let me = this,
        cells = me.getMarginCells(item, reAtRow, reAtCol);
      cells.forEach(cell => {
        cell.unbindItem(item);
      });
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
        map = me.cellsMap; //水平方向地图
      //【1】空白格子直接返回 空[]
      if (!item || item.isEmpty) {
        //isEmpty表示这只是一个 避免报错的 空{}对象
        return {
          closeCells: closeCells,
          neighbours: neighbours
        }; //直接返回空
      }
      let mapCheck = function(rowCheck, colCheck) {
        //保证没有出界
        let cell = map[rowCheck][colCheck];
        //【1】cell格子加入完毕
        closeCells.push(cell);
        //【2】cell格子中的 item加入完毕
        cell.items.forEach(cItem => {
          !neighbours.some(function(a) {
            return a === cItem;
          }) && neighbours.push(cItem);
        });
        //注意避免 空白格子的 null的加入
      };
      //【2】控件元素就 遍历
      switch (toward.toLowerCase()) {
        case "right":
        case "r": // 假如是右
          for (let i = 0; i < item.$rowH; ++i) {
            let rowCheck = item.$atRow + i, //确定即可
              colCheck = item.$atCol + item.$nCol;
            if (colCheck < map[rowCheck].length) {
              mapCheck(rowCheck, colCheck);
            }
          }
          break;

        case "left":
        case "l":
          for (let i = 0; i < item.$rowH; ++i) {
            let rowCheck = item.$atRow + i, //确定即可
              colCheck = item.$atCol - 1;
            if (colCheck >= 0) {
              mapCheck(rowCheck, colCheck);
            }
          }
          break;

        case "up":
        case "u":
          for (let i = 0; i < item.$nCol; ++i) {
            let rowCheck = item.$atRow - 1, //确定即可
              colCheck = item.$atCol + i;
            if (rowCheck >= 0) {
              mapCheck(rowCheck, colCheck);
            }
          }
          break;

        case "down":
        case "d":
          for (let i = 0; i < item.$nCol; ++i) {
            let rowCheck = item.$atRow + item.$rowH, //确定即可
              colCheck = item.$atCol + i;
            if (rowCheck < map.length) {
              mapCheck(rowCheck, colCheck);
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
    makeMovePlan(item, toward, moveNbs, canOutMap) {
      let me = this;

      toward = toward || "up"; //默认为 向上，初始化阶段即向上

      // 扩散传播做了一次 plan，则忽略
      if (item.$movePlan) {
        return item.$movePlan;
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
        canMove: false
      };

      //【++ 1】如果不移动邻居，那么只要存在邻居，就判定为 false
      if (!moveNbs && neighbours && neighbours.length) {
        return item.$movePlan;
      }

      if (closeCells.length) {
        //【++ 2】如果moveNbs 为 false 那么到这里就表示 全为空格子了
        if (!moveNbs) {
          item.$movePlan.canMove = true;
          return item.$movePlan;
        } else {
          for (let i = 0; i < neighbours.length; ++i) {
            let neighbour = neighbours[i],
              plan = me.makeMovePlan(neighbour, toward, moveNbs);
            if (!plan.canMove || plan.finished) {
              //对每一个 紧邻格子 也做计划
              item.$movePlan.canMove = false;
              return item.$movePlan; //如果有 某个邻近格子做出了无法 move的判断，那么整个move plan就失败
            }
          }
          // 这里就是 迭代得到全部行可以 move的结论后的位置
          //  --- 这里 紧邻格子 均边是 空白格子
          item.$movePlan.canMove = true;
          //item
          return item.$movePlan;
        }
      } else {
        //没有格子，那么该 item就是到达 边界的 item
        if (canOutMap) {
          //【2020-1218】目前只开放down
          if (toward === "down") {
            me.supplyMapRow(me.cellsMap.length);
            let nowClose = me.getItemCloses(item, toward);
            item.$movePlan.closeCells = nowClose.closeCells;
            item.$movePlan.canMove = true;
          }
        }
        //【2】到达最右边边界 从而无法移动的 item控件
      }
      return item.$movePlan;
    },

    //【Move 2 ··移动】【核心3-1】对item进行一格的移动 或扩展
    moveItem(item, doExpand) {
      let me = this;
      //# 1 以 plan作为指导！通过则必无问题
      if (!item.$movePlan || !item.$movePlan.canMove) {
        return false;
      }
      switch (item.$movePlan.toward) {
        case "right":
        case "r":
          //~ 1 都增加
          me.marginUseCells(item, null, item.$atCol + item.$nCol);
          //~ 2 增量不同
          if (doExpand) {
            ++item.$nCol;
          } else {
            me.marginFreeCells(item, null, item.$atCol);
            ++item.$atCol;
          }
          break;

        case "left":
        case "l":
          //~ 1 都增加
          me.marginUseCells(item, null, item.$atCol - 1);
          --item.$atCol;
          //~ 2 增量不同
          if (doExpand) {
            ++item.$nCol;
          } else {
            me.marginFreeCells(item, null, item.$atCol + item.$nCol);
          }
          break;

        case "up":
        case "u":
          //~ 1 都增加
          me.marginUseCells(item, item.$atRow - 1, null);
          --item.$atRow;
          //~ 2 增量不同
          if (doExpand) {
            ++item.$rowH;
          } else {
            me.marginFreeCells(item, item.$atRow + item.$rowH, null);
          }
          break;

        case "down":
        case "d":
          //~ 1 都增加
          me.marginUseCells(item, item.$atRow + item.$rowH, null);
          //~ 2 增量不同
          if (doExpand) {
            ++item.$rowH;
          } else {
            me.marginFreeCells(item, item.$atRow, null);
            ++item.$atRow;
          }
          break;

        default:
          throw "没有给定正确的方向！请在up down left right中选择一个！";
      }
      return true;
    },

    //【Move 3 ··移动】【核心2】对带有可行movePlan的item进行其movePlan的执行！
    processMovePlan(item, moveNbs, doExpand, finishItems) {
      finishItems = finishItems || [];
      if (!item.$movePlan) {
        return finishItems;
      }
      finishItems.push(item);

      if (item.$movePlan.finished) {
        return finishItems; //已经执行就不要再执行了，不然会重复进行，这既浪费效率，又会出bug
      }
      item.$movePlan.finished = true; //表示已经执行了这一次movePlan

      let me = this;
      let canMove = item.$movePlan && item.$movePlan.canMove;
      if (moveNbs) {
        let neighbours = item.$movePlan.neighbours;
        //console.log(["这里重复？", neighbours, neighbours.length]);
        for (let i = 0; i < neighbours.length; ++i) {
          me.processMovePlan(neighbours[i], moveNbs, false, finishItems); //全都执行一次，仅第一个可以 expand！
        }
      }

      if (canMove) {
        // 移动
        me.moveItem(item, doExpand);
      }

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
          //【debug】改bug有需要再加入
          // if (item.$movePlan.canMove) {
          //   item.$movePlanHis = item.$movePlanHis || [];
          //   tool.applyIf(item.$movePlan, config);
          //   item.$movePlanHis.unshift(item.$movePlan);
          // }
          delete item.$movePlan;
        }
      });
    },
    doProcessMovePlan(item, moveNbs, doExpand) {
      let me = this;
      let moveItems = me.processMovePlan(item, moveNbs, doExpand);
      me.sweepMovePlan(moveItems, {
        originItem: item,
        time: new Date(),
        id: tool.random62(4)
      });
    },

    //【Move 4 ··移动】单个item的尝试移动
    tryMoveItem(item, toward, moveNbs, step = 1, canOutMap, doExpand) {
      let me = this,
        finishStep = 0,
        movePlan,
        success = true;
      for (; finishStep < step; ++finishStep) {
        movePlan = me.makeMovePlan(item, toward, moveNbs, canOutMap);
        success = movePlan.canMove;
        //# 1 这么重要的别搞掉。
        me.doProcessMovePlan(item, moveNbs, doExpand);
        if (!success) {
          break;
        }
      }
      return {
        movePlan,
        success,
        finishStep,
        restStep: step - finishStep
      };
    },
    //【Move 4-2 ··移动】单个item的某方向所有邻居尝试移动
    tryMoveItemNeighbours(
      item,
      toward,
      moveNbs,
      step = 1,
      canOutMap,
      doExpand
    ) {
      let me = this,
        result = new Map(),
        nbs = me.getItemCloses(item, "down").neighbours;
      if (nbs.length) {
        nbs.forEach(nb => {
          let oneR = me.tryMoveItem(
            nb,
            toward,
            moveNbs,
            step,
            canOutMap,
            doExpand
          );
          result.set(nb, oneR);
        });
      }
      return result;
    },
    //【Move 5-1】扩展，检测移动，可，则可扩展。

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
    //【Std 5】统合版
    makeStdWHLT(items) {
      let me = this;
      if (tool.isObject(items)) {
        items = [items];
      }
      tool.each(items, item => {
        me.makeStdLeft(item);
        me.makeStdTop(item);
        me.makeStdWidth(item);
        me.makeStdHeight(item);
      });
    },
    //【Std 6】将定位四大要素给放入item
    setStdLayout(items) {
      let me = this;
      if (tool.isObject(items)) {
        items = [items];
      }
      items.forEach(item => {
        item.width = ((99.99 * item.$nCol) / me.columnNumber).toFixed(2) + "%";
        item.left = ((99.99 * item.$atCol) / me.columnNumber).toFixed(2) + "%";
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
    deRepeatArea(items) {
      items = items || this.items;
      let me = this,
        totCount = items.length;
      //~ 1 避免空
      if (!totCount) {
        return false;
      }
      for (let i = 0; i < totCount; ++i) {
        //# 1 排序
        me.orderItems();
        //# 2 当前item
        let item = items[i],
          reItems = me.getRepeatAreaItems(item);
        //# 3 存在重复
        if (reItems.length) {
          let ratio = item.$rowH / item.$nCol;
          reItems.forEach(ri => {
            let ri_h = ri.$nCol * ratio;
            //# 1 高于 那么就往下
            if (ri.$rowH >= ri_h) {
              ri.$atRow += item.$rowH;
            } else {
              //# 2 低于 则往右
              let endCol = ri.$atCol + item.$nCol,
                endRight = endCol + ri.$nCol;
              //# 2-2 超过右边，看能不能恰好抵在右边
              if (endRight >= me.columnNumber) {
                let minLeft = me.columnNumber - ri.$nCol;
                if (minLeft >= item.$nCol + item.$atCol) {
                  ri.$atCol = minLeft;
                } else {
                  //# 2-3 否则就往下
                  ri.$atRow += item.$rowH;
                }
              } else {
                ri.$atCol += item.$nCol;
              }
            }
          });
        } //re len
      } //for
    },

    //【de up-down】去 上下间隙，每一个item都执行，直到均为false的 plan
    deGapSpaces(toward) {
      let me = this;

      me.orderItems(toward);
      me.items.forEach(item => {
        let plan = me.makeMovePlan(item, toward, true);
        while (plan.canMove) {
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
    //@@ 1 对一组items的 合适初始化处理，要求已加入
    initItemsLayout(items) {
      let me = this;
      //console.log(["initItemsLayout 过程！"]);
      //~ 1 对items进行规则转化，形成map定位
      me.makeStdWHLT(items);
      //~ 2 去重
      me.deRepeatArea();
      //~ 2-2 放入地图
      items.forEach(item => {
        me.useCells(item);
      });

      //~ 3 去 上下间隙
      me.deGapSpaces("up");
      //~ 4 根据信息重设 高宽left top
      me.setStdLayout(items);
    },

    //@@ 2 外部给内部加入符合要求的 items的调用
    itemsAddRemove(addItems, removeItems) {
      let me = this,
        addItemsReady = [];
      console.log(["itemsAddRemove 过程！", addItems, removeItems]);
      //# 1 先去掉items
      removeItems.forEach(item => {
        item.$cells.forEach(cell => {
          cell.unbindItem(item);
        });
        let at = me.items.indexOf(item);
        at > -1 && me.items.splice(at, 1);
      });
      //# 2 再加入
      if (addItems.length) {
        addItems.forEach(item => {
          let at = me.items.indexOf(item);
          if (at < 0) {
            me.items.push(item);
            addItemsReady.push(item);
          }
        });
      }
      //# 3 调用初始化
      if (addItemsReady.length) {
        me.initItemsLayout(addItemsReady);
      }
    },

    //@@ 3 初始化调用
    AbsStep1InitLayout() {
      let me = this;
      if (me.items.length) {
        me.initItemsLayout(me.items);
      }
    },

    //@@ 4 某一item发生cg，分位移和 大小两种
    positionChangeBase(item, realStyle, toward) {
      let me = this;
      console.log(["调试 positionChangeBase  进行！！"]);
      me.makeStdWHLT(realStyle);
      let cgCol = realStyle.$atCol - item.$atCol,
        cgRow = realStyle.$atRow - item.$atRow,
        cgWidth = realStyle.$nCol - item.$nCol,
        cgHeight = realStyle.$rowH - item.$rowH,
        cgColAbs = Math.abs(cgCol),
        cgRowAbs = Math.abs(cgRow),
        totHorizon = cgColAbs + cgWidth,
        totVertical = cgRowAbs + cgHeight,
        doHorizon = !!totHorizon,
        doVertical = !!totVertical;

      //~ 1 向右/左
      if (doHorizon) {
        let doExpand = totHorizon / cgColAbs === 2,
          to = doExpand
            ? //%% 1 expand下 的左右判断
              totHorizon === cgCol + cgWidth
              ? "right"
              : "left"
            : //%% 2 move 下 的左右判断
            cgColAbs === cgCol
            ? "right"
            : "left",
          //(1) 一直向右
          moveHorizon = me.tryMoveItem(
            item,
            to,
            false,
            cgColAbs,
            false,
            doExpand
          );
        //(2) 失败，邻居或者边界
        if (!moveHorizon.success) {
          let lastMove = moveHorizon.movePlan,
            neighbours = lastMove.neighbours;

          //++ 1 针对剩余方向上的判断：
          if (["left", "right"].indexOf(toward) > -1 && !lastMove.finishStep) {
            return;
          }

          //#1 如果遇到邻居，那么 两者进行上下判别
          if (neighbours.length) {
            //#1-1 左右取第一个即上面那个
            let nb = neighbours[0],
              nbA = nb.height * me.lineA;
            nbA = nbA < me.rowHeight ? me.rowHeight : nbA;
            let nbATop = nbA + nb.top,
              belowNbA = realStyle.top >= nbATop;
            //@@ 1 下面往下
            if (belowNbA) {
              //~~ 1 下面邻居 向下 插入元素高度
              me.tryMoveItemNeighbours(nb, "down", true, item.$rowH, true);
              //~~ 1-2 自己的下面邻居也同样
              me.tryMoveItemNeighbours(item, "down", true, item.$rowH, true);
              //~~ 2 top位置赋值
              item.$atRow = nb.$atRow + nb.$rowH;
              me.useCells(item);
              //~~ 3 因为只对部分位移做了处理，所以继续
              me.positionChangeBase(item, realStyle, to);
              return;
            }
            //@@ 2 整个邻居往下
            else {
              //~~ 1 先确定是在其上
              let tryUp = item.$atRow - nb.$atRow + item.$rowH;
              //~~ 2 再往下移动(往往多移动了)
              me.tryMoveItem(nb, "down", true, item.$rowH, true);
              //~~ 3 往上try
              me.tryMoveItem(item, "up", false, tryUp);
              me.positionChangeBase(item, realStyle, to);
              return;
            }
          } //上为非success
          //# 2 遇到边界的失败，仍然可以在上下范围判断
        }
      }
      //~ 2 向下/上 只有在向右成功 或 边界失败可执行
      if (doVertical) {
        let doExpand = totVertical / cgRowAbs === 2,
          to = doExpand
            ? //%% 1 expand下 的上下判断
              totVertical === cgRow + cgHeight
              ? "down"
              : "up"
            : //%% 2 move 下 的上下判断
            cgRowAbs === cgRow
            ? "down"
            : "up",
          //(1) 一直向上下
          moveVertical = me.tryMoveItem(
            item,
            to,
            false,
            cgRowAbs,
            to === "down",
            doExpand
          );
        //(2) 失败，邻居或者边界
        if (!moveVertical.success) {
          //# 1 上下的邻居，都比较，选取首先低于的
          let lastMove = moveVertical.movePlan,
            neighbours = lastMove.neighbours.concat([]);

          //#1 如果遇到邻居，那么 两者进行上下判别
          if (neighbours.length) {
            neighbours.sort((n1, n2) => {
              let div = n1.height - n2.height;
              return div;
            });
            let nb = neighbours[0],
              nbA = nb.height * me.lineA;
            nbA = nbA < me.rowHeight ? me.rowHeight : nbA;
            let nbATop = nbA + nb.top,
              belowNbA = realStyle.top >= nbATop;
            //# 2 如果是向上 且高于nb -> 与 最小的交换位置
            if (to === "up" && !belowNbA) {
              //~~ 1 item free
              me.freeCells(item);
              //~~ 2 上的向下item rowH
              me.tryMoveItem(nb, "down", true, item.$rowH, true);
              //~~ 3 然后再探究向上！
              me.tryMoveItem(item, "up", false, nb.$rowH);
            }
            //# 3 如果是向下
            else if (to === "down" && belowNbA) {
              //~~ 0 item让出
              me.freeCells(item);
              //~~ 1 首先是nb先试着向上
              me.tryMoveItem(nb, "up", false, item.$rowH);
              //~~ 2 再是item在nb移动后基础上向下
              let tryDown = nb.$atRow + nb.$rowH - item.$atRow;
              me.tryMoveItem(item, "down", true, tryDown, true);
            }
          } // len
          //#4 未遇到就顺利结束！
        }
      }
    },
    positionChangeAtomic(item, realStyle) {
      let me = this;
      me.positionChangeBase(item, realStyle);
      me.deGapSpaces("up");
      me.setStdLayout(me.items);
    },
    sizeChange(item) {}
  },
  created() {
    let me = this;
    me.AbsStep1InitLayout();
  }
};
</script>

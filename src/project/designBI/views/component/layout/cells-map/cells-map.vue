<template>
  <div class="d-cells-map">
    <div class="contentArea">
      <div
        class="oneRow"
        v-for="(row, rowNum) in map"
        :key="rowNum"
        :data-row="rowNum"
        :style="{
          height: rows[rowNum].height.toFixed(2) + '%',
          top: rows[rowNum].top.toFixed(2) + '%'
        }"
      >
        <div
          class="oneCell"
          v-for="(cell, colNum) in row"
          :key="colNum"
          :data-cell="colNum + ',' + rowNum"
          :style="{
            width: cols[colNum].width.toFixed(2) + '%',
            left: cols[colNum].left.toFixed(2) + '%'
          }"
        >
          <slot :name="colNum + ',' + rowNum"></slot>
        </div>
      </div>
    </div>

    <template v-if="showHandle">
      <!-- 线条式 -->
      <div class="linesArea">
        <div class="linesArea-horizontal">
          <DividLine
            v-for="n in rows.length - 1"
            :key="n"
            :at="[null, n]"
            shape="horizontal"
            :style="{
              top:
                'calc(' +
                rows[n].top.toFixed(2) +
                '%' +
                ' - ' +
                w_line / 2 +
                'px)',
              height: w_line + 'px'
            }"
            @dividHover="dividHoverHandler"
            @positionChange="positionChangeFn"
            @positionChangeBegin="positionChangeBeginFn"
            @positionChangeEnd="positionChangeEndFn"
          ></DividLine>
        </div>
        <div class="linesArea-vertical">
          <DividLine
            v-for="n in cols.length - 1"
            :key="n"
            :at="[n, null]"
            :style="{
              left:
                'calc(' +
                cols[n].left.toFixed(2) +
                '%' +
                ' - ' +
                w_line / 2 +
                'px)',
              width: w_line + 'px'
            }"
            @dividHover="dividHoverHandler"
            @positionChange="positionChangeFn"
            @positionChangeBegin="positionChangeBeginFn"
            @positionChangeEnd="positionChangeEndFn"
          ></DividLine>
        </div>
      </div>
      <!-- 点式 -->
      <div class="dotsArea">
        <template v-for="y in rows.length">
          <template v-for="x in cols.length">
            <DividLine
              v-if="!(y === rows.length || x === cols.length)"
              :key="x + ',' + y"
              :at="[x, y]"
              shape="dot"
              :style="{
                top:
                  'calc(' +
                  rows[y].top.toFixed(2) +
                  '%' +
                  ' - ' +
                  w_dot / 2 +
                  'px)',
                left:
                  'calc(' +
                  cols[x].left.toFixed(2) +
                  '%' +
                  ' - ' +
                  w_dot / 2 +
                  'px)',
                width: w_dot + 'px',
                height: w_dot + 'px'
              }"
              @dividHover="dividHoverHandler"
              @positionChange="positionChangeFn"
              @positionChangeBegin="positionChangeBeginFn"
              @positionChangeEnd="positionChangeEndFn"
            >
            </DividLine>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import $ from "jquery";
import DividLine from "./divid-line";

export default {
  name: "d-cells-map",
  components: {
    DividLine
  },
  props: {
    //【~ 1】水平格子数量
    x: {
      type: Number,
      default: 1
    },
    //【~ 2】垂直格子数量
    y: {
      type: Number,
      default: 1
    },
    //## 2 模式2 宽高给定
    xs: {
      type: Array,
      default: null
    },
    ys: {
      type: Array,
      default: null
    },
    showHandle: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      map: [],
      rows: [], //记录行信息
      cols: [], //记录列信息

      //拖动事件
      drag: {},

      //固定
      w_line: 4,
      w_dot: 6,
      queryFlag: "d-cells-map",

      //yw交互变量
      ywMap: []
    };
  },
  computed: {
    cellsMap() {
      let me = this,
        cellsMap = [],
        map = me.map;
      tool.each(map, function(row) {
        let row_dom = [];
        tool.each(row, function(cell) {
          let dom = $(me.$el).find(
            "[data-cell='" + cell.x + "," + cell.y + "']"
          );

          let cell_dom = tool.applyIf(
            {
              dom: dom
            },
            cell
          );
          row_dom.push(cell_dom);
        });
        cellsMap.push(row_dom);
      });
      return cellsMap;
    }
    // cellsMap_vertical() {
    //   let me = this,
    //     cellsMap = me.cellsMap,
    //     map = me.initCellsMap(cellsMap.length, cellsMap[0].length);
    //   tool.each(cellsMap, function(row) {
    //     tool.each(row, function(cell) {
    //       map[cell.x][cell.y] = cell;
    //     });
    //   });
    //   return map;
    // }
  },
  methods: {
    initMap(colNum, rowNum) {
      let map = [];
      for (let i = 0; i < rowNum; ++i) {
        let row = [];
        for (let j = 0; j < colNum; ++j) {
          let cell = {
            x: j,
            y: i
          };
          row.push(cell);
        }
        map.push(row);
      }
      return map;
    },
    initRows(count) {
      let rows = [],
        height = 99.99 / count;
      for (let i = 0; i < count; ++i) {
        let top = i * height;
        rows.push({
          rowNum: i,
          top: top,
          height: height
        });
      }
      return rows;
    },
    initCols(count) {
      let cols = [],
        width = 99.99 / count;
      for (let i = 0; i < count; ++i) {
        let left = i * width;
        cols.push({
          colNum: i,
          left: left,
          width: width
        });
      }
      return cols;
    },
    dividHoverHandler(vNode, shape) {
      let me = this;
      // if (shape === "vertical") {
      //   vNode.mapStyle = {};
      // } else if (shape === "horizontal") {
      // } else if (shape === "dot") {
      // }
    },
    positionChangeBeginFn(shape, at) {
      let me = this,
        drag = me.drag;
      drag.shape = shape;
      drag.at = at;

      //console.log(["改变检查！"]);

      let x = at[0],
        y = at[1];
      if (x !== null) {
        let leftCol = me.cols[x - 1],
          rightCol = me.cols[x];
        drag.leftCol = leftCol;
        drag.rightCol = rightCol;
        drag.x = rightCol.left;
        drag.x_min = -leftCol.width;
        drag.x_max = rightCol.width;
      }
      if (y !== null) {
        let topRow = me.rows[y - 1],
          bottomRow = me.rows[y];
        drag.topRow = topRow;
        drag.bottomRow = bottomRow;
        drag.y = bottomRow.top;
        drag.y_min = -topRow.height;
        drag.y_max = bottomRow.height;
      }
    },
    positionChangeFn(_cgX, _cgY) {
      let me = this,
        dom = $(me.$el),
        maxW = dom.width(),
        maxH = dom.height(),
        cgX = (_cgX / maxW) * 100,
        cgY = (_cgY / maxH) * 100,
        drag = me.drag;

      if (cgX > drag.x_min && cgX < drag.x_max) {
        if (drag.leftCol) {
          tool.apply(drag.leftCol, {
            width: Math.abs(drag.x_min) + cgX
          });
          tool.apply(drag.rightCol, {
            width: Math.abs(drag.x_max) - cgX,
            left: drag.x + cgX
          });
        }
      }
      if (cgY > drag.y_min && cgY < drag.y_max) {
        if (drag.topRow) {
          tool.apply(drag.topRow, {
            height: Math.abs(drag.y_min) + cgY
          });
          tool.apply(drag.bottomRow, {
            height: Math.abs(drag.y_max) - cgY,
            top: drag.y + cgY
          });
        }
      }
    },
    positionChangeEndFn() {
      let me = this;
      me.drag = {};
    },
    initColsWidth(xs) {
      let me = this,
        totWidth = 0,
        colWidths = [];
      if (!xs || !xs.length) {
        return;
      }

      tool.each(xs, function(width) {
        totWidth += width;
      });
      tool.each(xs, function(width) {
        colWidths.push((width / totWidth) * 100);
      });
      tool.each(me.cols, function(col, i) {
        col.width = colWidths[i];
      });
    },
    initRowsHeight(ys) {
      let me = this,
        totHeight = 0,
        rowHeights = [];
      if (!ys || !ys.length) {
        return;
      }

      tool.each(ys, function(height) {
        totHeight += height;
      });
      tool.each(ys, function(height) {
        rowHeights.push((height / totHeight) * 100);
      });
      tool.each(me.rows, function(row, i) {
        row.height = rowHeights[i];
      });
    }
  },
  created() {
    let me = this,
      xNum = (me.xs && me.xs.length) || me.x,
      yNum = (me.ys && me.ys.length) || me.y;
    me.map = me.initMap(xNum, yNum);
    me.cols = me.initCols(xNum);
    me.rows = me.initRows(yNum);
    //考虑传入具体高宽配置的情况
    me.initColsWidth(me.xs);
    me.initRowsHeight(me.ys);
  }
  // mounted() {
  //   let me = this;
  //   console.log(["加上了", me, me.cellsMap]);
  // }
};
</script>

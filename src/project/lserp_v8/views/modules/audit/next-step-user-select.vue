<template>
  <div class="next-step-user-select">
    <div class="stepArea">
      <div class="stepArea-wrap">
        <div class="resultArea">
          <span class="preText">所选步骤：</span>
          <span class="result">{{ stepResult.key }}</span>
        </div>
        <div class="selectArea">
          <el-table
            ref="stepTable"
            :height="'100%'"
            :data="stepList"
            :row-class-name="stepTable_rowClass"
            @row-click="stepTable_RowClick"
            @select="stepTable_RowCheck"
            @select-all="stepTable_RowCheck"
          >
            <el-table-column type="selection"></el-table-column>
            <el-table-column prop="stepcode" label="步骤编码"></el-table-column>
            <el-table-column prop="stepname" label="步骤名称"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <div class="operArea" v-if="nextoperselect">
      <div class="operArea-wrap">
        <div class="resultArea">
          <span class="preText">所选人员：</span>
          <span class="result">{{ operResult.key }}</span>
        </div>
        <div class="selectArea">
          <el-table
            ref="operTable"
            :height="'100%'"
            :data="operList"
            :row-class-name="operTable_rowClass"
            @row-click="operTable_RowClick"
            @selection-change="operTable_SelChange"
          >
            <el-table-column type="selection"></el-table-column>
            <el-table-column prop="userid" label="用户ID"></el-table-column>
            <el-table-column prop="username" label="用户名"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let Yw;
export default {
  name: "next-step-user-select",

  props: {
    multiaudit: Number,
    nextoperselect: Number,
    nextstepselect: Number,

    //【~ 2】;分隔step步骤列 ，分隔人员
    nextSelectStepCode: String,
    nextSelectStepOper: String,

    //【~ 3】步骤列表 stepcode与 stepname
    stepList: Array,
    operList: Array //userid与username
  },
  data() {
    return {
      selectConfirmFlag: 1, //固定传1

      //引用
      stepTable: null,
      operTable: null,

      //【~ 4】人员选择集合
      stepOper: {},
      nowStep: null,

      //临时
      operSelecting: false
    };
  },
  computed: {
    stepResult() {
      let me = this;
      if (!me.stepTable) {
        return { key: "", val: "" };
      }
      let recs = me.stepTable.selection;

      return {
        val: recs.map(step => step.stepcode).join(";"),
        key: recs.map(step => step.stepname).join(";")
      };
    },
    operResult() {
      let me = this,
        val = [],
        key = [];
      //【# 1】不选择用户时
      if (!me.stepTable || !me.nextoperselect) {
        return { key: "", val: "" };
      }
      let recs = me.stepTable.selection;
      //按照selection的顺序来
      Yw.each(recs, function(rec) {
        let operA = me.stepOper[rec.stepcode],
          operVal = operA.map(op => op.userid).join(","),
          operKey = operA.map(op => op.username).join(",");
        val.push(operVal);
        key.push(operKey);
      });

      return {
        val: val.join(";"),
        key: key.join(";")
      };
    }
  },
  methods: {
    stepTable_RowClick(row) {
      let me = this,
        operA = me.stepOper[row.stepcode];
      //【# 1】不选择用户时
      if (!me.nextoperselect) {
        return;
      }
      //【~ 1】切换目前所选
      me.nowStep = row.stepcode;
      //【~ 2】切换目前人员表选择状态
      me.operTable.clearSelection();
      Yw.each(operA, function(operRow) {
        me.operTable.toggleRowSelection(operRow);
      });
      //console.log(["点击了！", arguments]);
    },
    operTable_RowClick(row) {
      let me = this;
      me.operTable.toggleRowSelection(row);
    },
    //用户表响应变化，因为集合在另一边
    operTable_SelChange(selects) {
      let me = this;
      if (me.multiaudit) {
        me.stepOper[me.nowStep] = selects;
      } else {
        if (selects && selects.length && !me.operSelecting) {
          me.operSelecting = true;
          Yw.each(selects, function(sel) {
            me.operTable.toggleRowSelection(sel);
          });
          let nowSel = selects[selects.length - 1];
          me.operTable.toggleRowSelection(nowSel);
          me.stepOper[me.nowStep] = [nowSel];
          me.operSelecting = false;
        }
      }
    },
    //样式加入
    operTable_rowClass({ row }) {
      let me = this,
        rowCls = "",
        curOperRows = me.stepOper[me.nowStep];

      if (curOperRows && curOperRows.indexOf(row) > -1) {
        rowCls = "active";
      }
      return rowCls;
    },
    stepTable_rowClass({ row }) {
      let me = this,
        rowCls = "";
      if (row.stepcode == me.nowStep) {
        rowCls = "active";
      }
      return rowCls;
    },
    stepTable_RowCheck(selects,row) {
      let me = this;
      if (row) {
        me.stepTable_RowClick(row);
      }
      //0为全选
      if (me.nextstepselect == 0) {
        Yw.each(me.stepList, function(step) {
          if (!selects || selects.indexOf(step) < 0) {
            me.stepTable.toggleRowSelection(step);
          }
        });
      }
    }
  },

  created() {
    let me = this;
    if (!me.stepList || !me.stepList.length) {
      console.error(["未获取到步骤列表！请检查后台"]);
    }
  },

  mounted() {
    Yw = window.Yw;
    let me = this;
    me.stepTable = me.$refs.stepTable;
    me.operTable = me.$refs.operTable;

    //【~ 1】初始化map
    Yw.each(me.stepList, function(step, i) {
      me.$set(me.stepOper, step.stepcode, []);
    });
    me.nowStep = me.stepList[0].stepcode;

    //【~ 2】flag初始化影响
    me.stepTable_RowCheck();

    console.log([
      "vue部件【next-step-user-select】初始化完毕，该部件引用：",
      me
    ]);
  }
};
</script>

<style lang="scss">
.next-step-user-select {
  position: relative;
  height: 420px;
  %innerArea {
    height: 100%;
    padding: 4px 12px;
    display: flex;
    flex-direction: column;

    > .selectArea {
      flex-grow: 1;
      overflow: hidden;
    }
  }
  .stepArea {
    &:not(:only-child) {
      padding-right: 50%;
    }
    height: 100%;
    .stepArea-wrap {
      @extend %innerArea;
    }
  }
  .operArea {
    position: absolute;
    left: 50%;
    top: 0;
    width: 50%;
    height: 100%;

    .operArea-wrap {
      @extend %innerArea;
    }
  }

  .resultArea {
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
    word-wrap: anywhere;
    * {
      font-size: 14px;
      color: #333;
      font-family: "微软雅黑", "Arial";
    }
  }

  .el-table {
    th {
      padding: 7px 0;
    }
    .el-table__body {
      .el-table__row {
        > td {
          padding: 3px 0;
        }
        &.active {
          background: aliceblue;
        }
        &:hover {
          > td {
            background-color: rgba(220, 250, 255, 0.356);
          }
        }
      }
    }
  }
}
.next-step-user-select-wrap {
  > .next-step-user-select {
    height: 100%;
    width: 100%;
  }
}
</style>

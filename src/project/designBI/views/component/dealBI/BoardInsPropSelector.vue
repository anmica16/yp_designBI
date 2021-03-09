<template>
  <div class="BoardInsPropSelector" v-loading="loading">
    <div class="TipArea">
      <div class="leftPart">
        <div class="boardTip">
          <span class="pre">所选绘板：</span>
          <span class="el-icon-data-analysis"></span>
          <span class="text">{{ selBoard ? selBoard.name : "未选择" }}</span>
        </div>

        <div class="itemTip chartTitle" v-if="selItem">
          <span class="pre">所选控件：</span>
          <span class="chartType" :class="{ join: selItem.joinDataIds }">{{
            selItem.joinDataIds ? "关联图表" : "图表"
          }}</span>
          <span class="chartName">{{ selItem.name }}</span>
        </div>

        <div class="dimTip" v-if="selDims.length">
          <span class="pre">所选维度：</span>
          <span class="theDimList">
            <DimTypeTag
              v-for="dim in selDims"
              :key="dim.$id"
              :type="dim.type"
              :name="dim.chineseName || dim.key"
            ></DimTypeTag>
          </span>
        </div>
      </div>

      <div class="fill"></div>

      <div class="rightPart">
        <el-button
          v-if="stepRange.length > 1"
          :disabled="!canBack"
          @click="backStepFn"
          type="primary"
          >上一步</el-button
        >
      </div>
    </div>
    <div
      class="selectArea"
      :style="{
        height: `calc(100% - ${rowCount * 21}px)`
      }"
    >
      <!-- =1= 选择绘板的区域 -->
      <div class="boardSelectArea" v-show="nowStep === 1">
        <boardChoose
          :prePIndex="prePIndex"
          @board-select="boardSelFn"
        ></boardChoose>
      </div>
      <!-- =2= 控件item -->
      <div class="itemSelectArea" v-show="nowStep === 2">
        <el-table
          border
          :data="itemList"
          @row-click="itemSelectFn"
          height="100%"
        >
          <el-table-column label="控件名">
            <span class="infoWrap chartTitle" slot="default" slot-scope="scope">
              <i
                class="icon bi"
                :class="getSelectType(scope.row.chartType).icon"
              ></i>
              <span
                class="chartType"
                :class="{ join: scope.row.joinDataIds }"
                >{{ scope.row.joinDataIds ? "关联图表" : "图表" }}</span
              >
              <span class="chartName">{{ scope.row.name }}</span>
            </span>
          </el-table-column>
        </el-table>
      </div>

      <!-- =3= 维度区域 -->
      <div class="dimSelectArea" v-show="nowStep === 3">
        <el-table
          ref="dimTB"
          border
          @row-click="dimSelectFn"
          @selection-change="dimSelectCgFn"
          height="100%"
          :data="dimList"
        >
          <el-table-column type="selection"></el-table-column>
          <el-table-column label="维度名">
            <span class="infoWrap chartTitle" slot="default" slot-scope="scope">
              <DimTypeTag
                :type="scope.row.type"
                :name="scope.row.chineseName || scope.row.key"
              ></DimTypeTag>
            </span>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { theStore, selectTypes, getSelectType } from "@designBI/store";
import $ from "@/plugins/js/loader";
import boardChoose from "./public/boardChoose";
import Vue from "vue";
import tool from "@/plugins/js/tool";
export default {
  name: "BoardInsPropSelector",
  components: {
    boardChoose
  },
  props: {
    //# 0 都是 data形式的
    prePIndex: String,
    preBoard: Object,
    preItem: Object,
    //# 1 必为连续步骤
    stepRange: {
      type: Array,
      default: () => {
        return [1, 2, 3];
      },
      validator(val) {
        let me = this;
        if (!val.length) {
          return false;
        }
        let lastStep = null,
          valid = true;
        tool.each(val, step => {
          //【=3=】必须为数字
          if (!tool.isNumber(step)) {
            valid = false;
            return false;
          }
          //【=2=】比较
          if (lastStep) {
            if (step - lastStep !== 1) {
              valid = false;
              return false;
            }
          }
          //【=1=】赋值
          lastStep = step;
        });

        return valid;
      }
    }
  },
  data() {
    return {
      queryFlag: "BoardInsPropSelector",

      selBoard: null,
      itemList: [],
      selItem: null,
      dimList: [],
      selDims: [],

      // ++ 1 当前step
      nowStep: 1,
      loading: false
    };
  },
  computed: {
    selectTypes() {
      return selectTypes;
    },
    //++ 2 起始末尾值
    beginStep() {
      return this.stepRange[0];
    },
    endStep() {
      return this.stepRange[this.stepRange.length - 1];
    },
    canBack() {
      let me = this;
      return me.nowStep > me.beginStep;
    },
    rowCount() {
      let me = this,
        tot = 0;
      if (me.selBoard) {
        tot++;
      }
      if (me.selItem) {
        tot++;
      }
      if (me.selDims.length) {
        tot += 2;
      }
      return tot;
    }
  },
  methods: {
    goNextStepFn() {
      let me = this;
      if (me.nowStep < me.endStep) {
        me.nowStep += 1;
      }
    },
    //++ 1 返回上一步
    backStepFn() {
      let me = this;
      if (me.canBack) {
        me.nowStep -= 1;
      }
    },
    boardSelFn(row) {
      let me = this;
      me.selBoard = row;

      //【=3=】重置
      tool.apply(me, {
        itemList: [],
        selItem: null,
        dimList: [],
        selDims: []
      });

      theStore.dispatch("getInstancesFn", row.templateCode).then(items => {
        me.itemList = items.filter(a => {
          return a.useType != 2;
        });
      });
      //console.log(["点击row board", arguments]);

      //【=2=】看是否下一步
      me.goNextStepFn();
    },
    getSelectType(type) {
      return getSelectType(type);
    },
    itemSelectFn(row) {
      let me = this;
      me.selItem = row;

      //【=3=】重置
      tool.apply(me, {
        dimList: [],
        selDims: []
      });

      //维度信息
      //=1= 检查 source有无，无则数据库
      let sourceDim = JSON.parse(row.source);
      if (sourceDim && sourceDim.Dims) {
        me.dimList = sourceDim.Dims;
      } else {
        $.ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.GetLinkData,
            id: row.linkDataId
          }
        }).then(result => {
          let data = result.data;
          if (data && data.length) {
            me.dimList = data[0].dimension;
            tool.isString(me.dimList) && (me.dimList = JSON.parse(me.dimList));
          }
        });
      }

      //【=2=】看是否下一步
      me.goNextStepFn();
    },
    dimSelectFn(row) {
      let me = this;
      me.$refs.dimTB.toggleRowSelection(row);
    },
    dimSelectCgFn(sels) {
      let me = this;
      me.selDims = sels;
    }
  },
  created() {
    let me = this,
      range = me.stepRange;

    //【=4=】检查开始的要求
    let begin = range[0];
    if (begin === 2) {
      if (me.preBoard) {
        me.selBoard = me.preBoard;
      } else {
        console.error([
          "BoardInsPropSelector 步骤起始为2（子控件）时，必须传递绘板参数！"
        ]);
        return;
      }
    } else if (begin === 3) {
      if (me.preItem) {
        me.selItem = me.preItem;
      } else {
        console.error([
          "BoardInsPropSelector 步骤起始为3（维度）时，必须传递子控件参数！"
        ]);
        return;
      }
    }
    //【=5=】然后将起始值赋予当前值
    me.nowStep = me.beginStep;
  }
};
</script>

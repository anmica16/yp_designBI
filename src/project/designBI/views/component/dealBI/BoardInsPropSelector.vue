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
        height: `calc(100% - ${rowCount * 21 + 34}px)`
      }"
    >
      <!-- =1= 选择绘板的区域 -->
      <div class="boardSelectArea" v-show="nowStep === 1">
        <boardChoose
          :boardDataFilter="boardDataFilter"
          :prePIndex="prePIndex"
          @board-select="boardSelFn"
        ></boardChoose>
      </div>
      <!-- =2= 控件item -->
      <div class="itemSelectArea" v-show="nowStep === 2">
        <el-table
          border
          :data="fItemList"
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
                >{{ useTypes[scope.row.useType].name || "未登记类型" }}</span
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
          @select="dimSelectByHandFn"
          height="100%"
          :data="fDimList"
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
import {
  theStore,
  selectTypes,
  getSelectType,
  useTypes
} from "@designBI/store";
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

    start: Number,

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
    },

    //# 2 数据过滤器
    boardDataFilter: Function,
    itemListFilter: Function,
    dimListFilter: Function
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
    useTypes() {
      return useTypes;
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
    },
    //++ 3 过滤数据
    fItemList() {
      let me = this;
      if (tool.isFunction(me.itemListFilter)) {
        return me.itemListFilter(me.itemList);
      } else {
        return me.itemList;
      }
    },
    //++ 3 过滤数据
    fDimList() {
      let me = this;
      if (tool.isFunction(me.dimListFilter)) {
        return me.dimListFilter(me.dimList);
      } else {
        return me.dimList;
      }
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
    boardSelFn(row, _1, _2, _3, ifSilent) {
      let me = this;
      me.selBoard = row;
      //console.log(["boardSelFn多少个参数？", arguments]);

      //++ 1 单独一个的 就直接emit
      if (me.stepRange.length === 1 && me.stepRange[0] === 1 && !ifSilent) {
        me.$emit("board-select", row);
        return;
      }

      //【=3=】重置
      tool.apply(me, {
        itemList: [],
        selItem: null,
        dimList: [],
        selDims: []
      });

      me.loading = true;

      theStore
        .dispatch("getInstancesFn", row.templateCode)
        .then(items => {
          me.loading = false;
          me.itemList = items.filter(a => {
            return a.useType != 2;
          });

          if (!ifSilent) {
            me.$emit("board-select", row);
            //【=2=】看是否下一步
            me.goNextStepFn();
          }
        })
        .catch(r => {
          me.loading = false;
          me.$message.warning("绘板选择失败……");
        });
    },
    getSelectType(type) {
      return getSelectType(type);
    },
    itemSelectFn(row, _1, _2, _3, ifSilent) {
      let me = this;
      me.selItem = row;
      //console.log(["itemSelectFn多少个参数？", arguments]);

      //++ 1 单独一个的 就直接emit
      if (me.stepRange.length === 1 && me.stepRange[0] === 2 && !ifSilent) {
        me.$emit("item-select", row);
        return;
      }

      //++ 2 如果是过滤组件
      if (row.useType == 20) {
        me.$message.info("选择了一个过滤控件！");
        me.$emit("item-select", row);
        return;
      }

      //【=3=】重置
      tool.apply(me, {
        dimList: [],
        selDims: []
      });

      let endFn = function() {
        if (!ifSilent) {
          me.$emit("item-select", row);
          //【=2=】看是否下一步
          me.goNextStepFn();
        }
      };

      //维度信息
      //=1= 检查 source有无，无则数据库
      let sourceDim = JSON.parse(row.source);
      if (sourceDim && sourceDim.Dims) {
        me.dimList = sourceDim.Dims;
        endFn();
      } else {
        me.loading = true;
        $.ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.GetLinkData,
            id: row.linkDataId
          }
        })
          .then(result => {
            me.loading = false;
            let data = result.data;
            if (data && data.length) {
              me.dimList = data[0].dimension;
              tool.isString(me.dimList) &&
                (me.dimList = JSON.parse(me.dimList));
            }
            endFn();
          })
          .catch(r => {
            me.loading = false;
            me.$message.warning("选择子控件失败……");
          });
      }
    },
    //@ 3 再一次进入时的状态预设
    dimPreSelect(_sels) {
      let me = this,
        sels = [];
      //console.log(["外部调用 dimPreSelect", arguments]);
      //【=0=】外部调用时，可能存在把其他的传进来了。
      _sels.forEach(sel => {
        let exist = me.fDimList.find(d => {
          return sel.$id === d.$id;
        });
        if (exist) {
          sels.push(exist);
        }
      });

      //【=2=】这个还没更新，要在出现之后调用
      me.$refs.dimTB.$nextTick(() => {
        sels.forEach(sel => {
          me.$refs.dimTB.toggleRowSelection(sel);
        });
      });

      //【=1=】再整体调用
      me.dimSelectCgFn(sels, true);
    },
    dimSelectFn(row) {
      let me = this;
      me.$refs.dimTB.toggleRowSelection(row);
      me.dimSelectCgFn(me.$refs.dimTB.selection);
    },
    dimSelectByHandFn(sels, _1, _2, ifSilent) {
      let me = this;

      console.log(["dimSelectByHandFn 多少个参数？", arguments]);
      me.dimSelectCgFn(sels, ifSilent);
    },
    dimSelectCgFn(sels, ifSilent) {
      let me = this,
        plusA = [],
        minusA = [];
      //console.log(["dimSelectCgFn多少个参数？", arguments]);

      //me.$refs.dimTB.toggleRowSelection(sels);

      //【=1=】新选择的 如果在 旧的没有，就是新增
      sels.forEach(dim => {
        let already = me.selDims.find(d => {
          return dim.$id === d.$id;
        });
        if (!already) {
          plusA.push(dim);
        }
      });
      //【=2=】旧的 如果在 新选择的没有，就是删减
      me.selDims.forEach(dim => {
        let already = sels.find(d => {
          return dim.$id === d.$id;
        });
        if (!already) {
          minusA.push(dim);
        }
      });

      //【=3=】更换，事件提示 这里别跟着变了
      me.selDims = sels.slice();

      if (!ifSilent) {
        me.$emit("dimension-select", sels, plusA, minusA);
      }
    }
  },
  watch: {
    nowStep(newVal, oldVal) {
      let me = this;
      if (newVal !== oldVal) {
        me.$emit("step-change", newVal);
      }
    }
  },
  created() {
    let me = this,
      range = me.stepRange;

    //【=4=】检查开始的要求
    let begin = me.start || range[0];
    if (range.indexOf(begin) < 0) {
      console.error(["BoardInsPropSelector 给定的起始步骤必须在步骤范围内！"]);
      return;
    }
    if (begin === 2) {
      if (me.preBoard) {
        me.boardSelFn(me.preBoard, null, null, null, true);
      } else {
        console.error([
          "BoardInsPropSelector 步骤起始为2（子控件）时，必须传递绘板参数！"
        ]);
        return;
      }
    } else if (begin === 3) {
      if (me.preItem) {
        me.itemSelectFn(me.preItem, null, null, null, true);
      } else {
        console.error([
          "BoardInsPropSelector 步骤起始为3（维度）时，必须传递子控件参数！"
        ]);
        return;
      }
    }
    //【=5=】然后将起始值赋予当前值
    me.nowStep = begin;
  }
};
</script>

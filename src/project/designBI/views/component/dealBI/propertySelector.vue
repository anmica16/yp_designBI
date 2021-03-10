<template>
  <div class="propertySelector">
    <div class="selectPart">
      <div class="partTitle">步骤一、选择字段范围</div>
      <el-tabs v-model="tabName" type="border-card">
        <!-- ~ 1 优先组件选择 -->
        <el-tab-pane label="按组件选择" name="BIList">
          <BoardInsPropSelector
            ref="insSelector"
            :stepRange="[1, 2, 3]"
            :start="2"
            :prePIndex="EditNode.nowBoard.recordData.pIndex"
            :preBoard="EditNode.nowBoard.recordData"
            :itemListFilter="itemListFilter"
            :dimListFilter="dimListFilter"
            @dimension-select="dimSelFn"
            @step-change="stepChangeFn"
          ></BoardInsPropSelector>
        </el-tab-pane>

        <el-tab-pane label="按表选择" name="dataTree">
          <!-- ~ 2 表选择靠后dataId选择 -->
          <dataPropCoat
            :candyMaster="candyMaster"
            :dimListFilter="dimListFilter"
          ></dataPropCoat>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 右侧 -->
    <div class="showPart">
      <div class="theCoat">
        <div class="partTitle">步骤二、选择过滤字段</div>
        <CoatingDim ref="propCoat" :candyMaster="candyMaster"></CoatingDim>
      </div>

      <div class="confirmArea">
        <div class="partTitle">步骤三、确认组件</div>
        <div class="conditionCmp">
          <div
            ref="conditionCmp"
            :properties="selProps"
            :newCondition="newCondition"
            :Entity="Entity"
            :is="xtype"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import dataSelectorMixin from "./dataSelectorMixin";

import { CandyMaster } from "@designBI/views/component/dropCandy";
import Vue from "vue";
const CandyMasterCtor = Vue.extend(CandyMaster);
import CandyDimTag from "@designBI/views/component/dropCandy/CandyDimTag";
import CoatingDim from "@designBI/views/component/dropCandy/CoatingDim";

import dataPropCoat from "./public/dataPropCoat";
import BoardInsPropSelector from "@designBI/views/component/dealBI/BoardInsPropSelector.vue";

export default {
  name: "propertySelector",
  mixins: [dataSelectorMixin],
  components: {
    CoatingDim,
    CandyDimTag,
    dataPropCoat,
    BoardInsPropSelector
  },
  props: {
    xtype: {
      type: String,
      required: true
    },
    newCondition: {
      type: Boolean,
      default() {
        return false;
      }
    },
    Entity: {
      type: Object,
      required: true
    },
    EditNode: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      queryFlag: "propertySelector",

      selectProps: [],
      tabName: "BIList",
      chartDetail: null,
      //# 1 ref失灵
      propCoat: null,
      conditionCmp: null
    };
  },
  computed: {
    candyMaster() {
      return new CandyMasterCtor();
    },
    selProps() {
      let me = this,
        props = [];

      if (me.propCoat) {
        props = me.propCoat.candies;
      }

      return props;
    },
    dimType() {
      let me = this,
        matchR = /^cond-([\w]*)-/,
        m = matchR.exec(me.xtype),
        mType = (m && m[1]) || "",
        inStr = ["number", "string", "date"],
        type = "";
      switch (mType) {
        case "number":
          type = "number";
          break;
        case "text":
          type = "string";
          break;
        case "date":
          type = "date";
          break;
        default:
          type = mType;
          break;
      }
      return type;
    },
    canSelDim() {
      let me = this,
        inStr = ["number", "string", "date"],
        type = me.dimType;
      return inStr.indexOf(type) > -1;
    }
  },
  methods: {
    dimSelFn(selDims, plusA, minusA) {
      let me = this;
      plusA.forEach(dim => {
        me.propCoat.candyAddSimple({ Dim: dim });
      });
      minusA.forEach(dim => {
        me.propCoat.candyLeave({ Dim: dim });
      });
    },
    stepChangeFn(nowStep) {
      let me = this;
      if (nowStep === 3) {
        me.$refs.insSelector.dimPreSelect(
          me.propCoat.candies.map(c => {
            let tc = tool.apply({}, c);
            delete tc.parentCoating;
            return tc;
          })
        );
      }
    },
    //# 1 条件通用，排除条件控件本身
    itemListFilter(itemList) {
      let me = this,
        condR = /^cond-/;
      return itemList.filter(item => {
        return !condR.test(item.xtype);
      });
    },
    //# 2 维度 根据xtype 第二段 来给
    dimListFilter(dimList) {
      let me = this,
        type = me.dimType;

      if (me.canSelDim) {
        return dimList.filter(d => {
          return d.type == type;
        });
      } else {
        return dimList;
      }
    }
  },
  mounted() {
    let me = this;

    me.propCoat = me.$refs.propCoat;
    me.conditionCmp = me.$refs.conditionCmp;
  }
};
</script>

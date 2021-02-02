<template>
  <div class="oneTabBody">
    <!-- ~ 3 内部 -->
    <!-- ~~ 1 维度指标 -->
    <div class="dimensionArea">
      <!-- # 1 表信息 切换 -->
      <div class="fileName">
        <span>{{ sumData && sumData.fileName }}</span>
        <i class="icon el-icon-document-copy bi bi-change"></i>
      </div>
      <!-- # 2 字段搜索 -->
      <div class="searchDim">
        <el-input
          placeholder="搜索字段"
          prefix-icon="el-icon-search"
          v-model="queryDim"
        ></el-input>
        <i class="icon el-icon-plus"></i>
      </div>
      <!-- # 3 维度 -->
      <div class="dimenArea">
        <div class="title">维度</div>
        <Scrollbar class="body">
          <!-- 【update】拖拽 -->
          <CandyDimTag
            class="edit"
            v-for="dim in dimAndIndex.Dims"
            :key="dim.$id"
            :Dim="dim"
            :candyMaster="candyMaster"
          ></CandyDimTag>
        </Scrollbar>
      </div>
      <!-- # 4 指标 -->
      <div class="indexArea">
        <div class="title">指标</div>
        <Scrollbar class="body">
          <!-- 【update】拖拽 -->
          <CandyDimTag
            class="edit"
            v-for="dim in dimAndIndex.Indices"
            :key="dim.$id"
            :Dim="dim"
            :candyMaster="candyMaster"
          ></CandyDimTag>
        </Scrollbar>
      </div>
    </div>
    <!-- ~~ 2 类型属性样式 -->
    <div class="typeMakeArea">
      <!-- # 1 标题 -->
      <div class="nameArea">
        <div class="title">
          <span class="pre">标题</span>
          <span class="nameOk">
            显示
            <el-checkbox v-model="checkName"></el-checkbox>
          </span>
        </div>
        <div class="name">
          <el-input v-model="tempName"></el-input>
        </div>
      </div>
      <!-- # 2 图表类型 -->
      <div class="typeArea">
        <div class="title">图表类型</div>
        <!-- update -->
        <div class="selectArea">
          <template v-for="type in selectTypes">
            <div
              :key="type.type"
              class="typeWrap"
              :class="{
                select: type === selectType,
                hover: type === hoverType
              }"
              @mouseenter="mouseenterFn(type)"
              @mouseleave="mouseleaveFn(type)"
              @click="selectTypeFn(type)"
            >
              <i :class="['icon', 'bi', type.icon]"></i>
            </div>
          </template>
        </div>
        <div class="desp">{{ theDesp }}</div>
        <div class="nowType">当前类型：{{ selectType && selectType.name }}</div>
      </div>
      <!-- # 3 属性样式 -->
      <el-tabs class="cssArea">
        <el-tab-pane label="表格属性"></el-tab-pane>
        <el-tab-pane label="组件样式"></el-tab-pane>
      </el-tabs>
      <!-- # 4 过滤 -->
      <div class="filterArea">
        <div class="title">结果过滤器</div>
        <div class="filters"></div>
      </div>
    </div>
    <!-- ~~ 3 拖拽xy结果视图 -->
    <div class="visualArea">
      <!-- # 1 xy -->
      <div class="dropArea">
        <div class="oneDim">
          <div class="dimType">行维度</div>
          <div class="dimsHere">
            <CoatingDim
              style="height: 30px;"
              :candyMaster="candyMaster"
              ref="Dims"
              :receiveCheck="receiveCheckDims"
            >
              <span class="noTip">请拖入左侧维度</span>
            </CoatingDim>
          </div>
        </div>

        <div class="oneDim">
          <div class="dimType">列指标</div>
          <div class="dimsHere">
            <CoatingDim
              style="height: 30px;"
              :candyMaster="candyMaster"
              ref="Indices"
              :receiveCheck="receiveCheckIndices"
            >
              <span class="noTip">请拖入左侧指标</span>
            </CoatingDim>
          </div>
        </div>
      </div>
      <!-- # 2 结果 -->
      <div class="visualStage">
        <!-- ~~ 1 chart -->
        <div class="chartArea">
          <BIBase
            ref="chart"
            :Entity="Instance"
            :EditNode="EditNode"
            :nowBoard="nowBoard"
            v-if="sumData"
          ></BIBase>
        </div>
        <div class="bottom">
          <el-checkbox v-model="checkAllData">查看所有数据</el-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CandyMaster } from "@designBI/views/component/dropCandy";
import Vue from "vue";
const CandyMasterCtor = Vue.extend(CandyMaster);
import { Instance } from "@designBI/views/mixins/Entity";

import CandyDimTag from "@designBI/views/component/dropCandy/CandyDimTag";
import CoatingDim from "@designBI/views/component/dropCandy/CoatingDim";
import tool from "@/plugins/js/tool";

const selectTypes = [
  //~ 1 table表
  {
    type: "table-mingxi",
    icon: "bi-table-mingxi",
    name: "明细表",
    desp: ""
  },
  {
    type: "table",
    icon: "bi-table",
    name: "分组表",
    desp: ""
  },
  // {
  //   type: "table-cross",
  //   icon: "bi-table-cross",
  //   name: "交叉表",
  //   desp: ""
  // },
  //~ 2 柱状图
  {
    type: "bar-divid",
    icon: "bi-bar-divid",
    name: "分区柱状图",
    desp: "建议至少1个维度，至少1个指标"
  },
  {
    type: "bar-stack",
    icon: "bi-bar-stack",
    name: "堆积柱形图",
    desp: "建议至少1个维度，至少2个指标"
  },
  {
    type: "bar",
    icon: "bi-bar",
    name: "多系列柱形图",
    desp: "建议至少1个维度，至少2个指标"
  },
  {
    type: "bar-bardiagram",
    icon: "bi-bardiagram",
    name: "对比柱状图",
    desp: "建议1个维度，2个指标"
  },
  {
    type: "bar-pubu",
    icon: "bi-pubutu",
    name: "瀑布图",
    desp: "建议至少1个维度，2个指标"
  },
  //~ 3 折线图
  {
    type: "line-divid",
    icon: "bi-line-divid",
    name: "分区折线图",
    desp: "建议至少1个维度，至少1个指标"
  },
  {
    type: "line",
    icon: "bi-zhexiantu",
    name: "多系列折线图",
    desp: "建议至少1个维度，至少2个指标"
  },
  {
    type: "line-radio",
    icon: "bi-leidatu",
    name: "折线雷达图",
    desp: "建议至少1个维度，至少1个指标"
  },
  {
    type: "line-range",
    icon: "bi-range",
    name: "范围面积图",
    desp: "建议至少1个维度，2个指标"
  },
  //~ 4 散点
  {
    type: "scatter",
    icon: "bi-sandian",
    name: "散点图",
    desp: "建议至少1个维度，至少1个指标"
  },
  //~ 5 饼图
  {
    type: "pie",
    icon: "bi-pie",
    name: "饼图",
    desp: "建议1个维度，1个指标"
  },
  {
    type: "pie-meigui",
    icon: "bi-meiguitu",
    name: "玫瑰图",
    desp: "建议1个维度，2个指标"
  },
  //~ 6 漏斗
  {
    type: "funnel",
    icon: "bi-loudoutu",
    name: "漏斗图",
    desp: "建议1个维度，1个指标"
  },
  //~ 7 仪表盘
  {
    type: "dashboard",
    icon: "bi-yibiaopan",
    name: "仪表盘",
    desp: "建议0个维度，1个指标"
  }
];

export default {
  name: "OneItemEdit",
  components: {
    CoatingDim,
    CandyDimTag
  },
  mixins: [Instance],
  props: {
    sumData: {
      type: Object
    }
  },
  data() {
    return {
      //# 1 小字段
      queryDim: "",
      checkName: true,
      tempName: "",
      checkAllData: false,
      //# 2 拖拽管理器
      candyMaster: null,
      //# 3 选择类型
      hoverType: null,
      selectType: null
    };
  },
  computed: {
    selectTypes() {
      return selectTypes;
    },
    //【update】改变的？
    dimAndIndex() {
      let me = this,
        sumData = me.sumData,
        Dims = [],
        Indices = [];
      if (sumData && sumData.dimension) {
        sumData.dimension.forEach(_dim => {
          let dim = tool.apply({}, _dim);
          if (dim.type === "number") {
            Indices.push(dim);
          } else if (["date", "string"].indexOf(dim.type) > -1) {
            Dims.push(dim);
          }
        });
      }
      return { Dims, Indices };
    },
    //# 3 表有关
    Dims() {
      let me = this,
        result = [],
        dimsR = me.$refs.Dims;
      if (dimsR) {
        result = dimsR.candies;
      }
      return result;
    },
    Indices() {
      let me = this,
        result = [],
        idxR = me.$refs.Indices;
      if (idxR) {
        result = idxR.candies;
      }
      return result;
    },
    theDesp() {
      let me = this,
        theType = me.hoverType || me.selectType;
      if (!theType) {
        return "";
      }
      return theType.name + (theType.desp ? `:${theType.desp}` : "");
    }
  },
  methods: {
    getPureDim(d) {
      let d2 = tool.apply({}, d);
      delete d2.parentCoating;
      return d2;
    },
    // 初始化用？
    getPropDim(d) {
      let at = this.sumData.dimension.find(a => {
          return a.$id === d.$id;
        }),
        r = {};
      if (at) {
        r = tool.apply({}, at);
      }
      return r;
    },
    initDims() {
      //# 2 来自ins的数据
      let me = this;
      let cfg = me.Instance.getData("config_more");
      //console.log(["查看如何添加到candy"]);
      if (cfg) {
        cfg.Dims &&
          (me.$refs.Dims.candies = cfg.Dims.map(d => {
            let d2 = me.getPropDim(d);
            d2.parentCoating = me.$refs.Dims;
            return d2;
          }));
        cfg.Indices &&
          (me.$refs.Indices.candies = cfg.Indices.map(d => {
            let d2 = me.getPropDim(d);
            d2.parentCoating = me.$refs.Indices;
            return d2;
          }));
      }
    },
    //@ 1 选择BI类型
    selectTypeFn(type) {
      let me = this;
      me.selectType = type;
      me.Instance.setData({
        chartType: type.type
      });
      me.Instance.save();
    },
    mouseenterFn(type) {
      this.hoverType = type;
    },
    mouseleaveFn() {
      this.hoverType = null;
    },
    getType(typeStr) {
      return this.selectTypes.find(a => {
        return a.type === typeStr;
      });
    },
    //~~ 2 看是否可加入
    receiveCheckDims(candy) {
      let me = this,
        cDim = candy.Dim;
      return ["number", "date", "string"].indexOf(cDim.type) > -1;
    },
    receiveCheckIndices(candy) {
      let me = this,
        cDim = candy.Dim;
      return ["number"].indexOf(cDim.type) > -1;
    }
  },
  created() {
    let me = this;
    me.candyMaster = new CandyMasterCtor();
    //# 1 只有可能是
    me.candyMaster.$on("dropEnd", () => {
      //save一次
      console.log(["赋值保存一次", me.candyMaster]);
      me.Instance.setData({
        config_more: {
          Dims: me.Dims.map(me.getPureDim),
          Indices: me.Indices.map(me.getPureDim)
        }
      });
      me.Instance.save();
      me.$refs.chart.refreshSource();
    });
  },
  watch: {
    "sumData.dimension": function(newVal) {
      let me = this;
      if (newVal && !me.$initDims) {
        me.$initDims = true;
        me.initDims();
      }
    },
    "sumData.name": function(newVal) {
      if (!this.$sumData_name && newVal) {
        this.$sumData_name = true;
        this.tempName = newVal;
      }
    },
    "Instance.recordData.chartType": function(val) {
      if (
        !this.selectType ||
        (this.selectType && val !== this.selectType.type)
      ) {
        let theType = this.getType(val);
        this.selectType = theType;
      }
    }
  }
};
</script>

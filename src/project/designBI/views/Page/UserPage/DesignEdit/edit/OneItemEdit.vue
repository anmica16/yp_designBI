<template>
  <div class="oneTabBody">
    <!-- ~ 3 内部 -->
    <!-- ~~ 1 维度指标 -->
    <div class="dimensionArea">
      <!-- # 1 表信息 切换 -->
      <div class="pre fileName">
        <span>{{ sumData && sumData.baseData && sumData.baseData.name }}</span>
        <i class="icon el-icon-document-copy"></i>
      </div>
      <!-- # 2 字段搜索 -->
      <div class="pre fileName">
        <el-input
          placeholder="搜索字段"
          prefix-icon="el-icon-search"
          v-model="queryDim"
        ></el-input>
        <i class="icon el-icon-document-copy"></i>
      </div>
      <!-- # 3 维度 -->
      <div class="dimenArea">
        <div class="title">维度</div>
        <Scrollbar class="body">
          <!-- 【update】拖拽 -->
          <CandyDimTag
            v-for="dim in dimAndIndex.Dims"
            :key="dim.key"
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
            v-for="dim in dimAndIndex.Indices"
            :key="dim.key"
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
          <template v-for="(type, i) in selectTypes">
            <el-link
              :class="{ active: type === chartType }"
              :key="i"
              @click="selectTypeFn(type)"
            >
              {{ type }}
            </el-link>
          </template>
        </div>
        <div class="desp"></div>
        <div class="nowType">{{ chartType }}</div>
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

import CandyDimTag from "./CandyDimTag";
import CoatingDim from "./CoatingDim";
import tool from "@/plugins/js/tool";

const selectTypes = ["table", "line"];

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
      candyMaster: null
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
      if (sumData) {
        sumData.dimension.forEach(dim => {
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
    }
  },
  methods: {
    getPureDim(d) {
      let d2 = tool.apply({}, d);
      delete d2.parentCoating;
      return d2;
    },
    getPropDim(d) {
      let at = this.sumData.dimension.find(a => {
        return a.$id === d.$id;
      });
      return at;
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
      me.Instance.setData({
        chartType: type
      });
      me.Instance.save();
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
    }
  }
};
</script>

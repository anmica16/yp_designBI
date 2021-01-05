<template>
  <div class="oneTabBody">
    <!-- ~ 3 内部 -->
    <!-- ~~ 1 维度指标 -->
    <div class="dimensionArea">
      <!-- # 1 表信息 切换 -->
      <div class="pre fileName">
        <span>{{ sumData && sumData.baseData.name }}</span>
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
        <ScrollBar class="body">
          <!-- 【update】拖拽 -->
          <CandyDimTag
            v-for="dim in dimAndIndex.Dims"
            :key="dim.key"
            :Dim="dim"
            :candyMaster="candyMaster"
          ></CandyDimTag>
        </ScrollBar>
      </div>
      <!-- # 4 指标 -->
      <div class="indexArea">
        <div class="title">指标</div>
        <ScrollBar class="body">
          <!-- 【update】拖拽 -->
          <CandyDimTag
            v-for="dim in dimAndIndex.Indices"
            :key="dim.key"
            :Dim="dim"
            :candyMaster="candyMaster"
          ></CandyDimTag>
        </ScrollBar>
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
        <div class="selectArea"></div>
        <div class="desp"></div>
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
            <CoatingDim :candyMaster="candyMaster">
              <span class="noTip">请拖入左侧字段</span>
            </CoatingDim>
          </div>
        </div>
      </div>
      <!-- # 2 结果 -->
      <div class="visualStage">
        <!-- ~~ 1 chart -->
        <div class="chartArea">
          <!-- <AoaChart
                ref="chart"
                v-if="SummaryData"
                :SummaryData="SummaryData"
                :Dims="Dims"
                :Indices="Indices"
              ></AoaChart> -->
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

import CandyDimTag from "./CandyDimTag";
import CoatingDim from "./CoatingDim";

export default {
  name: "OneItemEdit",
  components: {
    CoatingDim,
    CandyDimTag
  },
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
    }
  },
  methods: {},
  created() {
    let me = this;
    me.candyMaster = new CandyMasterCtor();
  }
};
</script>

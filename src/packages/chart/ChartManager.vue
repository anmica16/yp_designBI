<template>
  <div
    class="ChartManager"
    ref="chart"
    :is="chartType"
    :type="type"
    :SummaryData="SummaryData"
    :Dims="Dims"
    :Indices="Indices"
  ></div>
</template>

<script>
import tool from "@/plugins/js/tool";
const chartTypes = ["line", "bar", "pie"];

export default {
  name: "ChartManager",
  props: {
    //----------
    //  中转站
    //-----------
    //## 1 可变，外部筛选导致的数据变化
    SummaryData: {
      type: Object,
      required: true
    },
    //## 2 图表类型，通过左上角来进行切换，这个作为一个管理中转站进行管理
    type: {
      type: String,
      default: "line",
      validator(val) {
        return chartTypes.indexOf(val) > -1;
      }
    },
    //~ 1 都是一组数据
    // - 1 维度
    //## 3 拖拽过来选择的维度【x轴】类目
    Dims: {
      type: Array
    },
    // - 2 指标
    //## 4 拖拽过来选择的指标【y轴】类目的维度值
    Indices: {
      type: Array
    },
    //## 5 单独设置的表格风格
    theme: {
      type: String
    }
  },
  computed: {
    chartType() {
      let me = this;
      return "chart-" + me.type;
    }
  },
  methods: {
    resize() {
      let me = this,
        chart = me.$refs.chart;
      if (chart && tool.isFunction(chart.resize)) {
        chart.resize();
      }
    }
  }
};
</script>

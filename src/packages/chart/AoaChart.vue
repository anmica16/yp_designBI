<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
</template>

<script>
let echarts = require("echarts");
import tool from "@/plugins/js/tool";

export default {
  name: "AoaChart",
  props: {
    SummaryData: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      default: "line"
    },
    //~ 1 都是一组数据
    // - 1 维度
    Dims: {
      type: Array
    },
    // - 2 指标
    Indices: {
      type: Array
    },
    theme: {
      type: String
    }
  },
  data() {
    return {
      chart: null
    };
  },
  computed: {
    dimension() {
      let me = this,
        dimens = [],
        dims = me.SummaryData.dimension;
      dims.forEach(dim => {
        let cDim = tool.apply({}, dim, {
          //【update】name换为中文 可设定？
          name: dim.key,
          jsType: dim.type,
          type: me.getAxisType(dim.type)
        });
        dimens.push(cDim);
      });
      return dimens;
    },
    aoaData() {
      let me = this;
      return me.SummaryData.aoa;
    },
    xAxis() {
      let x = { type: "category" };
      if (this.Dims && this.Dims.length) {
        let cDim = this.getAxisDim(this.Dims[0]);
        cDim && (x = cDim);
      }
      return x;
    },
    yAxis() {
      return {}; //this.Indices;
    },
    series() {
      let me = this,
        series = [];
      me.Indices.forEach(index => {
        let s = {
          type: me.type,
          name: index.key,
          encode: {
            x: me.xAxis.key || 0,
            y: index.key
          }
        };
        series.push(s);
      });
      return series;
    },
    option() {
      let me = this,
        option = {
          //# 2 小组件
          legend: {
            data: me.aoaData[0]
          },
          tooltip: {},

          //# 1 核心部分
          dataset: {
            source: me.aoaData
          },
          xAxis: me.xAxis,
          yAxis: me.yAxis,
          series: me.series
        };

      return option;
    }
  },
  methods: {
    getAxisType(type) {
      switch (type) {
        default:
        case "string":
          return "category";
        case "date":
          return "time";
        case "number":
          return "value";
      }
    },
    getChartDimensionType(type) {
      switch (type) {
        default:
        case "string":
          return "ordinal";
        case "date":
          return "time";
        case "number":
          return "number";
      }
    },
    getAxisDim(dim) {
      let at = this.dimension.findIndex(cDim => {
        return cDim.key === dim.key;
      });
      if (at > -1) {
        return this.dimension[at];
      } else {
        return null;
      }
    },
    resize() {
      let me = this;
      if (me.chart) {
        me.chart.resize();
      }
    }
  },
  mounted() {
    let me = this;
    // if (me.theme) {
    //   me.chart = echarts.init(me.$refs.box, me.theme);
    // } else {
    //   me.chart = echarts.init(me.$refs.box, null);
    // }
    if (me.theme) {
      me.chart = echarts.init(me.$refs.box, me.theme, { renderer: "svg" });
    } else {
      me.chart = echarts.init(me.$refs.box, null, { renderer: "svg" });
    }
    me.$nextTick(() => {
      me.chart.setOption(me.option);
    });
    console.log(["创建好的？", me.chart, me]);
  }
};
</script>

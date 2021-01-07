let echarts = require("echarts");
export default {
  data() {
    //%% 5 type下自属配置
    return {
      chart: null
    };
  },
  computed: {
    echarts() {
      return echarts;
    },
    //%% 1 各type所需--类目（维度）
    xAxis() {
      let x = { type: "category" };
      if (this.Dims && this.Dims.length) {
        let cDim = this.getAxisDim(this.Dims[0]);
        cDim && (x = cDim);
      }
      return x;
    },
    //%% 2 各type所需--类目值（指标）
    yAxis() {
      return {}; //this.Indices;
    },
    //%% 3 各type--option 中组合基本序列
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
    //%% 4 各type--option组合
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
    resize() {
      let me = this;
      if (me.chart) {
        me.chart.resize();
      }
    }
  },
  mounted() {
    let me = this;
    if (me.theme) {
      me.chart = me.echarts.init(me.$refs.box, me.theme, { renderer: "svg" });
    } else {
      me.chart = me.echarts.init(me.$refs.box, null, { renderer: "svg" });
    }
    me.$nextTick(() => {
      me.chart.setOption(me.option);
    });
    console.log(["创建好的？", me.chart, me]);
  }
};

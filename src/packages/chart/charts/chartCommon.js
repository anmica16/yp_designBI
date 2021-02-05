import tool from "@/plugins/js/tool";
import chartBase from "../chartBase";

let echarts = require("echarts");
export default {
  mixins: [chartBase],
  props: {
    useSvg: {
      type: Boolean,
      default: false
    }
  },
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
    themeColors() {
      return [
        "#5470c6",
        "#91cc75",
        "#fac858",
        "#ee6666",
        "#73c0de",
        "#3ba272",
        "#fc8452",
        "#9a60b4",
        "#ea7ccc"
      ];
    },
    seriesType() {
      return this.chartType;
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
        let name =
            me._joinTables && me._joinTables.length ? index.tName : index.key,
          s = {
            type: me.seriesType,
            name: name,
            encode: {
              x: me.Dims.length ? me.Dims[0].realKey : 0,
              y: name
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
    },
    setOption(cfg) {
      let me = this;
      me.chart.setOption(tool.apply({}, me.option, cfg));
      me.$emit("setOption");
    },
    targetRecordDims(clickParams) {
      let me = this,
        rec = clickParams.value,
        Dims = me.Dims;

      me.selectOneRecord(rec, Dims);
    }
  },
  // watch: {
  //   option(newVal, oldVal) {
  //     if (newVal) {
  //       this.setOption();
  //     }
  //   }
  // },
  mounted() {
    let me = this;
    if (me.theme) {
      me.chart = me.echarts.init(me.$refs.box, me.theme, {
        renderer: me.useSvg ? "svg" : "canvas"
      });
    } else {
      me.chart = me.echarts.init(me.$refs.box, null, {
        renderer: me.useSvg ? "svg" : "canvas"
      });
    }
    me.$on("refreshSource", () => {
      //console.log(["这里没处理号？"]);
      me.setOption();
      if (!me.$chartEvent) {
        me.$chartEvent = true;
        me.chart.on("click", function(params) {
          console.log(["chart点击事件", params, arguments, me]);
          me.targetRecordDims(params);
        });
      }
    });
    // me.$nextTick(() => {
    // });
    //console.log(["创建好的？", me.chart, me]);
  }
};

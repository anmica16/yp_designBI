import tool from "@/plugins/js/tool";
import chartBase from "../chartBase";

let echarts = require("echarts");
export default {
  mixins: [chartBase],
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
        let name =
            me._joinTables && me._joinTables.length ? index.tName : index.key,
          s = {
            type: me.type,
            name: name,
            encode: {
              x: me.xAxis.key || 0,
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
        edit = me.EditNode,
        value = clickParams.value,
        withJts = me._joinTables && me._joinTables.length,
        Dims = me.Dims;

      Dims.forEach(d => {
        //~~ 1 record
        let dataId = d.dataId;
        if (!edit.selectMap[dataId]) {
          me.$set(edit.selectMap, dataId, {});
        }
        let record = edit.selectMap[dataId];

        let key = withJts ? d.tName : d.key,
          val = value[key];
        if (!tool.isNull(val)) {
          //~~ 2 有值的维度，放入对应dataId的rec去
          me.$set(
            edit.selectMap,
            dataId,
            tool.apply({}, record, {
              [d.key]: val
            })
          );
        }
      });
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
      me.chart = me.echarts.init(me.$refs.box, me.theme, { renderer: "svg" });
    } else {
      me.chart = me.echarts.init(me.$refs.box, null, { renderer: "svg" });
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

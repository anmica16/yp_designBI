<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
</template>

<script>
import tool from "@/plugins/js/tool";
import chartCommon from "./chartCommon";
export default {
  name: "chart-line-radio",
  mixins: [chartCommon],
  computed: {
    $indicator() {
      let me = this,
        r = [];
      if (me.Dims && me.Dims.length) {
        let dim = me.Dims[0];
        me.keySheet.forEach(rec => {
          let at = r.findIndex(d => {
            return d.name == rec[dim.realKey];
          });

          at < 0 &&
            r.push({
              name: rec[dim.realKey]
              //【update】假设自动计算最大值
            });
        });
      }
      return r;
    },

    series() {
      let me = this,
        data = [];
      me.Indices &&
        me.Indices.forEach((index, i) => {
          let key = index.realKey,
            s = {
              name: key,
              value: me.getDimColData(key)
            };
          data.push(s);
        });
      return [
        {
          name: me.name,
          type: "radar",
          data
        }
      ];
    },

    option() {
      let me = this,
        option = {
          //# 2 小组件
          legend: {
            data: me.Indices.map(index => {
              return index.realKey;
            })
          },
          tooltip: {},

          //# 1 核心部分
          radar: {
            indicator: me.$indicator
          },
          dataset: {
            source: me.keySheet
          },
          series: me.series
        };

      return option;
    }
  },
  methods: {
    getDimColData(dimKey) {
      let me = this,
        r = [];
      if (me.keySheet && me.keySheet.length) {
        me.keySheet.forEach(rec => {
          r.push(rec[dimKey]);
        });
      }
      return r;
    }
  }
};
</script>

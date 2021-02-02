<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
</template>

<script>
import chartCommon from "./chartCommon";
export default {
  name: "chart-dashboard",
  mixins: [chartCommon],
  computed: {
    series() {
      let me = this,
        data = [];
      //# 1 数据
      if (me.Indices && me.Indices.length) {
        let index = me.Indices[0],
          dimKey = me.Dims && me.Dims.length && me.Dims[0].realKey;
        me.keySheet.forEach((rec, i) => {
          let theName = dimKey
              ? rec[dimKey]
              : me.keySheet.length == 1
              ? index.realKey
              : `数据${i}`,
            x = 0,
            y = 50,
            y2 = y + 13;
          if (me.keySheet.length == 2) {
            x = i == 1 ? 25 : -25;
          } else if (me.keySheet.length > 2) {
            let orderX = i % 3,
              orderY = Math.floor(i / 3);
            x = 33.33 * orderX - 40;
            y = 50 + 24 * orderY;
            y2 = y + 13;
          }

          data.push({
            name: theName,
            value: rec[index.realKey],
            title: {
              offsetCenter: [`${x}%`, `${y}%`]
            },
            detail: {
              offsetCenter: [`${x}%`, `${y2}%`]
            }
          });
        });
      }
      //# 2 一个dashboard的配置
      return [
        {
          name: me.name,
          type: "gauge",
          data,
          anchor: {
            show: true,
            showAbove: true,
            size: 18,
            itemStyle: {
              color: "#FAC858"
            }
          },
          pointer: {
            icon:
              "path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z",
            width: 8,
            length: "80%",
            offsetCenter: [0, "8%"]
          },

          progress: {
            show: true,
            overlap: true,
            roundCap: true
          },
          axisLine: {
            roundCap: true
          },
          detail: {
            width: 36,
            height: 10,
            fontSize: 13,
            color: "#fff",
            backgroundColor: "auto",
            borderRadius: 3,
            formatter: "{value}%"
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ];
    },
    option_dashboard() {
      let me = this,
        option = {
          //# 2 小组件
          legend: { type: "scroll" },
          tooltip: {},

          //# 1 核心部分
          series: me.series
        };

      return option;
    },
    option() {
      return this.option_dashboard;
    }
  }
};
</script>

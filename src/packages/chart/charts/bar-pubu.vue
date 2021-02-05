<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
</template>

<script>
import tool from "@/plugins/js/tool";
//import chartCommon from "./chartCommon";
import barD from "./bar-divid";
export default {
  name: "chart-bar-pubu",
  extends: barD,
  computed: {
    series() {
      let me = this,
        series = [];
      //指标一定是数字！
      me.Indices.forEach((index, i) => {
        //# 1 瀑布图，将一个序列分成增减+辅助的三部分。
        let baseA = me.keySheet.map(rec => {
            return rec[index.realKey];
          }),
          assisA = [0].concat(baseA.slice(0, baseA.length - 1)),
          plusA = [],
          minusA = [];
        console.log(["瀑布图制作part1"]);
        assisA.forEach((assisC, i) => {
          let baseC = baseA[i],
            frontDiv = baseC - assisC;
          if (frontDiv >= 0) {
            plusA.push(frontDiv);
            minusA.push("-");
          } else {
            plusA.push("-");
            minusA.push(frontDiv);
          }
        });

        //# 2 构成3个序列
        let totName = `total_${index.realKey}`,
          assisS = {
            name: `${index.realKey}_辅助`,
            type: me.seriesType,
            stack: totName,
            itemStyle: {
              barBorderColor: "rgba(0,0,0,0)",
              color: "rgba(0,0,0,0)"
            },
            emphasis: {
              itemStyle: {
                barBorderColor: "rgba(0,0,0,0)",
                color: "rgba(0,0,0,0)"
              }
            },
            data: assisA,
            xAxisIndex: i,
            yAxisIndex: i
          },
          plusS = {
            name: `${index.realKey}_增`,
            type: me.seriesType,
            stack: totName,
            label: {
              show: true,
              position: "top"
            },
            data: plusA,
            xAxisIndex: i,
            yAxisIndex: i
          },
          minusS = {
            name: `${index.realKey}_减`,
            type: me.seriesType,
            stack: totName,
            label: {
              show: true,
              position: "bottom"
            },
            data: minusA,
            xAxisIndex: i,
            yAxisIndex: i
          };

        series.push(assisS);
        series.push(plusS);
        series.push(minusS);
      });
      return series;
    },

    //%% 4 各type--option组合
    option() {
      let me = this,
        option = {
          //# 2 小组件
          legend: {
            data: me.series.map(index => {
              return index.name;
            })
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          grid: me.grid,

          //# 1 核心部分
          dataset: {
            source: me.keySheet
          },
          xAxis: me.xAxis,
          yAxis: me.yAxis,
          series: me.series
        };

      return option;
    }
  }
};
</script>

<template>
  <div class="echartsBoxWrap">
    <div
      v-show="hasDimension"
      class="echartsBox"
      ref="box"
      style="width: 100%; height: 100%;"
    ></div>

    <div v-show="!hasDimension" class="noDimensionTip">
      <div class="back"></div>
      <div class="text">请先进入修改界面添加维度指标</div>
    </div>
  </div>
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
          assisInA = [],
          plusA = [],
          minusA = [];
        //console.log(["瀑布图制作part1"]);
        assisA.forEach((assisC, i) => {
          let baseC = baseA[i],
            _div = baseC - assisC,
            _assisInC = assisC + _div,
            assisInC = parseFloat(_assisInC.toFixed(2)),
            frontDiv = parseFloat(_div.toFixed(2));
          if (frontDiv >= 0) {
            plusA.push(frontDiv);
            minusA.push("-");
            assisInA.push(assisC);
          } else {
            plusA.push("-");
            minusA.push(-frontDiv);
            assisInA.push(parseFloat(assisInC));
          }
        });

        //# 2 构成3个序列
        let totName = `total_${index.realKey}`,
          assisS = {
            //name: `${index.realKey}_辅助`,
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
            data: assisInA,
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
              position: "bottom",
              formatter: "-{c}"
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
            },
            formatter: function(params) {
              //console.log(["看一个 formatter的参数", arguments]);
              let tar = null,
                assisS = params[0],
                result = assisS.value;
              if (params[1].value !== "-") {
                tar = params[1];
                result = result + tar.value;
              } else {
                tar = params[2];
              }
              return (
                tar.name +
                "<br/>" +
                `终值：${parseFloat(result.toFixed(2))}` +
                "<br/>" +
                `<span style="background: ${tar.color};width: 8px; height: 8px; border-radius: 10px;display: inline-block;margin: 0 5px;"></span>` +
                tar.seriesName +
                " : " +
                tar.value
              );
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

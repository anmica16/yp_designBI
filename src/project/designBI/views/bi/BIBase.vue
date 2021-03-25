<template>
  <div class="BIBase" v-loading="ajaxLoading">
    <div class="chartTitle">
      <span
        class="chartType"
        :class="[`type${useType}`, { join: useType == 11 }]"
        >{{ useTypes[useType].name || "未注册控件" }}</span
      >
      <span class="chartName">{{ name }}</span>
    </div>
    <div class="chartBody">
      <div
        ref="chart"
        :is="chartTypeStr"
        :Entity="Instance"
        :EditNode="EditNode"
        :nowBoard="nowBoard"
        @click.native.stop
        @mousedown.native.stop
        @ajaxLoading="ajaxLoadingFn"
      ></div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import { Instance } from "../mixins/Entity";
import $ from "jquery";
import { useTypes } from "@designBI/store";

//【1】要求必有 数据
export default {
  name: "BIBase",
  mixins: [Instance],
  data() {
    return {
      ajaxLoading: false
    };
  },
  computed: {
    //……1 这里的chartType是放在 Instance里面的
    chartTypeStr() {
      //console.log(["chartType被吃了？"]);
      return "chart-" + this.chartType;
    },
    useTypes() {
      return useTypes;
    }
  },
  methods: {
    resize() {
      let me = this,
        chart = me.$refs.chart;
      if (chart && tool.isFunction(chart.resize)) {
        chart.resize();
      }
    },
    refreshSource() {
      this.$refs.chart.refreshSource();
    },
    ajaxLoadingFn(isLoading) {
      this.ajaxLoading = isLoading;
    }
  },
  mounted() {
    let me = this,
      resizeFn = tool.throttle(me.resize, 100);
    me.$on("bubble-resize", () => {
      //console.log(["咋就触发bubble-resize了呢？"]);
      me.resize();
    });
    $(window).on(`resize.${tool.uniqueStr()}`, () => {
      resizeFn();
    });
  }
};
</script>

<style lang="scss">
.BIBase {
  height: 100%;
  background: white;
  $h_title: 28px;
  > .chartTitle {
    height: $h_title;
    box-sizing: border-box;
    padding: 1px 8px;
  }
  > .chartBody {
    height: calc(100% - #{$h_title});
  }
}
</style>

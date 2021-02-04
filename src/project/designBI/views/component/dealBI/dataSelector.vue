<template>
  <div class="dataSelector">
    <div class="leftTree">
      <IndexTree
        ref="tree"
        class="dataTree"
        :records="records"
        valid="exist"
        @node-click="nodeClickFn"
      >
      </IndexTree>
    </div>
    <div class="rightTable" v-loading="DetailDataLoading">
      <template v-if="!nowFileRec">
        <div class="fileNotSelectTip">
          <div class="back"></div>
          <div class="text">请从左侧选择表</div>
        </div>
      </template>
      <!-- ~ 4 先写在这里 再独立 -->
      <template v-else-if="DetailData">
        <DimTable
          ref="resultTable"
          :data="DetailData.dataTable"
          :dimension="totDims"
        ></DimTable>
      </template>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import dataSelectorMixin from "./dataSelectorMixin";
//import SimpleCheckData from "../../Page/UserPage/DesignCenter/newData/SimpleCheckData";
export default {
  name: "dataSelector",
  // components: {
  //   SimpleCheckData
  // },
  mixins: [dataSelectorMixin],
  data() {
    return {
      queryFlag: "dataSelector"
    };
  },
  computed: {
    dimension() {
      if (this.DetailData && this.DetailData.dimension) {
        return tool.parse(this.DetailData.dimension);
      } else {
        return [];
      }
    },
    totDims() {
      let me = this,
        tot = me.dimension.map(d => {
          let fd = tool.apply({}, d, {
            formatter: row => {
              //这里温和点，只有key
              let val = row[d.key];
              if (d.type === "number") {
                return tool.fmtNumber(val);
              } else {
                return val;
              }
            }
          });
          return fd;
        });
      return tot;
    }
  }
};
</script>

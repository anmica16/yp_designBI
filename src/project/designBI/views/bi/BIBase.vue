<template>
  <div class="BIBase">
    <div class="title">BIBase</div>
    <div class="chartBody">
      <AoaChart
        v-if="SummaryData"
        :SummaryData="SummaryData"
        :Dims="Dims"
        :Indices="Indices"
      ></AoaChart>
    </div>
  </div>
</template>

<script>
import { Instance } from "../mixins/Entity";

//【1】要求必有 数据
export default {
  name: "BIBase",
  mixins: [Instance],
  data() {
    return {
      SummaryData: null
    };
  },
  computed: {
    dimension() {
      return this.SummaryData && this.SummaryData.dimension;
    },
    Dims() {
      let me = this,
        dims = [];
      if (me.dimension) {
        dims.push(me.dimension[0]);
      }
      return dims;
    },
    Indices() {
      let me = this,
        dims = [];
      if (me.dimension) {
        dims = me.dimension.slice(1);
      }
      return dims;
    }
  },
  mounted() {
    let me = this,
      dataId = me.recordData.linkDataId;
    //~ 1 数据
    me.EditNode.getLinkData(dataId).then(sumData => {
      if (sumData) {
        me.SummaryData = sumData;
      }
    });
  }
};
</script>

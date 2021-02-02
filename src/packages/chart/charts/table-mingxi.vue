<template>
  <div class="chart-table">
    <DimTable ref="table" :data="requestData" :dimension="totDims"></DimTable>
  </div>
</template>

<script>
import chartBase from "../chartBase";
export default {
  name: "chart-table-mingxi",
  mixins: [chartBase],
  data() {
    return {
      type: "detail"
    };
  },
  computed: {
    totDims() {
      let me = this;
      return me.Dims.concat(me.Indices);
    }
  }
};
</script>

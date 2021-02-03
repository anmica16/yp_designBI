<template>
  <div class="chart-table">
    <DimTable
      ref="table"
      :data="requestData || []"
      :dimension="totDims"
      :rowClickFn="rowClickFn"
    ></DimTable>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
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
      let me = this,
        tot = me.Dims.concat(me.Indices).map(d => {
          let fd = tool.apply({}, d, {
            formatter: row => {
              let val = row[d.realKey];
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
  },
  methods: {
    rowClickFn(record, clickInfo) {
      let me = this;
      me.selectOneRecord(record, me.totDims);
    }
  }
};
</script>

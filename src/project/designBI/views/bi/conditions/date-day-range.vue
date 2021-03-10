<template>
  <div class="cond-base cond-date-day-range">
    <div class="cond-title">日期区间</div>
    <div class="cond-body" @mousedown.stop>
      <el-date-picker
        ref="date"
        v-model="selDate"
        type="daterange"
        :editable="false"
        range-separator="至"
        start-placeholde="开始日期"
        end-placeholde="结束日期"
        @created="assisBlurFn"
        @blur="blurBase"
      ></el-date-picker>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import year from "./date-year";
export default {
  name: "cond-date-day-range",
  extends: year,
  computed: {
    conditionResult() {
      let me = this,
        conds = [],
        selDate = me.selDate;
      if (selDate && selDate.length) {
        let start = selDate[0],
          end = selDate[1];
        conds.push({
          $id: me.condId + "_1",
          type: "gteq",
          value: `'${tool.Date.format(start, "yyyy-MM-dd")}'`
        });
        conds.push({
          $id: me.condId + "_2",
          type: "lteq",
          value: `'${tool.Date.format(end, "yyyy-MM-dd")}'`
        });
      }

      return conds;
    }
  }
};
</script>

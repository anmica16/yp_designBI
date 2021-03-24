<template>
  <div class="cond-base cond-date-month">
    <div class="cond-title">年月</div>
    <div class="cond-body" @mousedown.stop>
      <el-date-picker
        ref="date"
        v-model="selDate"
        type="month"
        :editable="false"
        placeholder="选择年月"
        @created="assisBlurFn"
        @blur="blurBase"
      ></el-date-picker>
      <el-select v-model="compare">
        <el-option
          v-for="c in compares"
          :key="c.value"
          :value="c.value"
          :label="c.label"
        ></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import year from "./date-year";
export default {
  name: "cond-date-month",
  extends: year,
  computed: {
    conditionResult() {
      let me = this,
        conds = [];
      if (me.selDate) {
        let dateStr = tool.Date.format(me.selDate, "yyyy-MM-dd");
        if (me.compare === "now") {
          conds.push({
            $id: me.condId,
            type: "like-date",
            value: `'${tool.Date.format(me.selDate, "yyyy-MM")}%'`
          });
        } else if (me.compare === "before") {
          conds.push({
            $id: me.condId,
            type: "lt",
            value: `'${dateStr}'`
          });
        } else if (me.compare === "after") {
          conds.push({
            $id: me.condId,
            type: "gteq",
            value: `'${dateStr}'`
          });
        }
      }
      return conds;
    },
    singleValue() {
      return this.selDate ? tool.Date.format(this.selDate, "yyyy-MM-dd") : "";
    }
  }
};
</script>

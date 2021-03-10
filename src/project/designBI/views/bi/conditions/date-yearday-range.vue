<template>
  <div class="cond-base cond-yearday-range">
    <div class="cond-title">年月区间</div>
    <div class="cond-body" @mousedown.stop>
      <el-date-picker
        ref="date"
        v-model="selDate"
        type="monthrange"
        :editable="false"
        range-separator="至"
        start-placeholde="开始月份"
        end-placeholde="结束月份"
        @created="assisBlurFn"
        @blur="blurBase"
      ></el-date-picker>
    </div>
  </div>
</template>

<script>
import range from "./date-day-range";
export default {
  name: "cond-yearday-range",
  extends: range
};
</script>

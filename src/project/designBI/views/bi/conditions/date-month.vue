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
        value-format="yyyy-MM"
        @created="assisBlurFn"
        @blur="blurBase"
      ></el-date-picker>
    </div>
  </div>
</template>

<script>
import year from "./date-year";
export default {
  name: "cond-date-month",
  extends: year
};
</script>

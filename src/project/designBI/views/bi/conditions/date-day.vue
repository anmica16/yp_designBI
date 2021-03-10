<template>
  <div class="cond-base cond-date-day">
    <div class="cond-title">日期</div>
    <div class="cond-body" @mousedown.stop>
      <el-date-picker
        ref="date"
        v-model="selDate"
        type="date"
        :editable="false"
        placeholder="选择日期"
        value-format="yyyy-MM-dd"
        @created="assisBlurFn"
        @blur="blurBase"
      ></el-date-picker>
    </div>
  </div>
</template>

<script>
import year from "./date-year";
export default {
  name: "cond-date-day",
  extends: year
};
</script>

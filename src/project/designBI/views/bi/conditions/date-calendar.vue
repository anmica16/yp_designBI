<template>
  <div class="cond-base cond-date-calendar">
    <div class="cond-title">数值区间</div>
    <div class="cond-body" @mousedown.stop></div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import Vue from "vue";
import mixin from "./mixin";
export default {
  name: "cond-date-calendar",
  mixins: [mixin],
  data() {
    return {};
  },
  computed: {
    conditionResult() {
      let me = this,
        conds = [];
      conds.push({
        $id: me.condId + "_1",
        type: me.leftType,
        value: me.leftValue
      });
      conds.push({
        $id: me.condId + "_2",
        type: me.rightType,
        value: me.rightValue
      });
      return conds;
    }
  }
};
</script>

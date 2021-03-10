<template>
  <div class="cond-base cond-date-year">
    <div class="cond-title">年份</div>
    <div class="cond-body" @mousedown.stop>
      <el-date-picker
        ref="date"
        v-model="selDate"
        type="year"
        :editable="false"
        placeholder="选择年份"
        value-format="yyyy"
        @created="assisBlurFn"
        @blur="blurBase"
      ></el-date-picker>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import Vue from "vue";
import mixin from "./mixin";
import $ from "jquery";
export default {
  name: "cond-date-year",
  mixins: [mixin],
  data() {
    return {
      selDate: ""
    };
  },
  computed: {
    conditionResult() {
      let me = this,
        conds = [];
      if (me.selDate) {
        conds.push({
          $id: me.condId,
          type: "like-date",
          value: `'${me.selDate}%'`
        });
      }
      return conds;
    }
  },
  methods: {
    assisBlurFn() {
      let me = this,
        date = me.$refs.date,
        picker = date.picker;
      me.assisBlurBase([date.$el, picker.$el, date.handleClose]);
    }
  }
};
</script>

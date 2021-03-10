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
import Vue from "vue";
import mixin from "./mixin";
import $ from "jquery";
export default {
  name: "cond-date-year",
  mixins: [mixin],
  data() {
    return {
      selDate: "",
      compare: "now"
    };
  },
  computed: {
    compares() {
      return [
        {
          value: "before",
          label: "截止"
        },
        {
          value: "now",
          label: "当期"
        },
        {
          value: "after",
          label: "起始"
        }
      ];
    },
    conditionResult() {
      let me = this,
        conds = [];
      if (me.selDate) {
        if (me.compare === "now") {
          conds.push({
            $id: me.condId,
            type: "like-date",
            value: `'${me.selDate}%'`
          });
        } else if (me.compare === "before") {
          conds.push({
            $id: me.condId,
            type: "lt",
            value: `'${me.selDate}'`
          });
        } else if (me.compare === "after") {
          conds.push({
            $id: me.condId,
            type: "gteq",
            value: `'${me.selDate}'`
          });
        }
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

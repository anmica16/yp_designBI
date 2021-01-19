<template>
  <div class="cond-base cond-number-divid">
    <div class="cond-title">数值区间</div>
    <div class="cond-body">
      <el-input v-model="leftValue" placeholder="无限制"></el-input>
      <el-select :class="leftType" v-model="leftType">
        <el-option v-for="op in leftTypes" :key="op.type" :value="op.type">
          <span class="text"
            ><span :class="'bi ' + op.icon"></span>{{ `（${op.name}）` }}</span
          >
        </el-option>
      </el-select>
      <span class="midValue">值</span>
      <el-select :class="rightType" v-model="rightType">
        <el-option v-for="op in rightTypes" :key="op.type" :value="op.type">
          <span class="text"
            ><span :class="'bi ' + op.icon"></span>{{ `（${op.name}）` }}</span
          >
        </el-option>
      </el-select>
      <el-input v-model="rightValue" placeholder="无限制"></el-input>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import Vue from "vue";
import mixin from "./mixin";
const less = [
  {
    type: "lt",
    icon: "bi-lt",
    name: "小于"
  },
  {
    type: "lteq",
    icon: "bi-lteq",
    name: "小于等于"
  }
];
const greater = [
  {
    type: "gt",
    icon: "bi-gt",
    name: "大于"
  },
  {
    type: "gteq",
    icon: "bi-gteq",
    name: "大于等于"
  }
];
export default {
  name: "cond-number-divid",
  mixins: [mixin],
  props: {
    numberOptions: Object
  },
  data() {
    return {
      leftType: null,
      rightType: null,
      leftValue: null,
      rightValue: null
    };
  },
  computed: {
    leftTypes() {
      return less;
    },
    rightTypes() {
      return greater;
    },
    conditionResult() {
      let me = this,
        conds = [];
      if (tool.isNumber(parseFloat(me.leftValue))) {
        conds.push({
          type: me.leftType,
          property: me.property,
          value: me.leftValue
        });
      }
      if (tool.isNumber(parseFloat(me.rightValue))) {
        conds.push({
          type: me.rightType,
          property: me.property,
          value: me.rightValue
        });
      }
      return conds;
    }
  },
  watch: {
    conditionResult(conds) {
      let me = this,
        dataId = me.dataId,
        edit = me.EditNode;
      if (conds && conds.length && dataId && edit) {
        //# 1 这里触发 改变对应的视图控件
        Vue.set(edit.conditionMap, dataId, conds);
      }
      //# 2 同时改变ins的 值
      me.Instance.setData({
        propsData: {
          numberOptions: {
            leftType: me.leftType,
            rightType: me.rightType,
            leftValue: me.leftValue,
            rightValue: me.rightValue
          }
        }
      });
      me.Instance.save();
    }
  },
  created() {
    let me = this,
      ops = me.numberOptions;
    me.leftType = ops.leftType || less[0].type;
    me.rightType = ops.rightType || greater[0].type;
    me.leftValue = ops.leftValue || null;
    me.rightValue = ops.rightValue || null;
  }
};
</script>

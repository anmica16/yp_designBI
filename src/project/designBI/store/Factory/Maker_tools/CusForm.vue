<template>
  <el-form :model="form" :rules="rules" ref="form">
    <template v-for="item in formItems">
      <el-form-item :label="item.name" :key="item.$key" :prop="item.$key">
        <CusFormItem
          :level="level"
          :item="item"
          :form="form"
          :originForm="originForm"
          :Entity="Instance"
        ></CusFormItem>
      </el-form-item>
    </template>
    <slot></slot>
  </el-form>
</template>

<script>
import { Base } from "@designBI/views/mixins/Entity";
import tool from "@/plugins/js/tool";
import CusFormItem from "./CusFormItem";
export default {
  name: "CusForm",
  mixins: [Base],
  components: {
    CusFormItem
  },
  props: {
    level: {
      type: Number,
      default: 0
    },
    //# 1-2 顶层form
    originForm: {
      type: Object,
      required: true
    },
    //# 1 该form 的model
    form: {
      type: Object,
      required: true
    },
    //# 3 该form的 items，由$jsonFields 简单push而来
    formItems: {
      type: Array,
      required: true,
      validator(val) {
        return val.length;
      }
    }
  },
  // data() {
  //   return {
  //     //# 2 rules由items自行生成
  //     rules: {},
  //   };
  // },
  computed: {
    //【update】这里应该没问题 rules可确定
    rules() {
      let me = this,
        rules = {};
      tool.each(me.formItems, item => {
        if (item.rules) {
          me.$set(rules, item.$key, item.rules);
        }
      });
      return rules;
    }
  }
};
</script>

<style></style>

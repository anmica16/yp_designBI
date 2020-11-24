<template>
  <div class="Maker_DrawingBoard">
    <div class="formArea">
      <el-form :model="form" :rules="rules" ref="theForm" label-width="80px">
        <template v-for="item in formItems">
          <el-form-item :label="item.name" :key="item.$key" :prop="item.$key">
            <el-input
              :is="item.xtype || 'el-input'"
              :placeholder="item.placeholder"
              :readOnly="item.readOnly"
              :disabled="item.disabled"
              v-model="form[item.$key]"
            ></el-input>
          </el-form-item>
        </template>
        <el-form-item>
          <el-button type="primary" @click="submitForm" class="saveBtn">{{
            isAdd ? "确认创建" : "保存修改"
          }}</el-button>
          <el-button @click="resetForm">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import DrawingBoard from "../Entity/DrawingBoard";
export default {
  name: "Maker_DrawingBoard",
  props: {
    record: Object,
    isAdd: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      board: null,
      formItems: [],
      form: {},
      rules: {}
    };
  },
  computed: {},
  methods: {
    initFormItems() {
      let me = this,
        items = [];
      if (!me.board) {
        return;
      }
      let recordData = me.board.recordData,
        baseCfg = me.board.baseCfg;
      tool.each(baseCfg, (key, val) => {
        //#3 自身tag配置
        items.push(tool.apply({ $key: key }, val));
        //#1 form值
        me.$set(me.form, key, recordData[key]);
        //#2 规则设定
        if (val.rules) {
          me.$set(me.rules, key, val.rules);
        }
      });
      me.formItems = items;

      return items;
    },
    submitForm() {
      let me = this;
      me.$refs.theForm.validate(function(valid) {
        //console.log(["创建是否同通过？", arguments]);
        if (valid) {
          me.board.setData(me.form);
          me.setForm(me.board.recordData);
          me.$emit("submitForm", me.board.recordData, me);
        } else {
          //console.log("error submit!!");
          return false;
        }
      });
    },
    setForm(vals) {
      let me = this;
      tool.each(me.form, key => {
        if (vals[key]) {
          me.form[key] = vals[key];
        }
      });
    },
    resetForm() {
      this.$refs.theForm.resetFields();
    }
  },
  mounted() {
    let me = this;
    console.log(["开始探究初始过程", me]);
    //~ 1 board初始
    me.board = new DrawingBoard(me.record);
    //~ 2 子项按配置加入
    me.initFormItems();
  }
};
</script>

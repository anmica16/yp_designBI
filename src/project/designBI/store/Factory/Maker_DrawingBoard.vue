<template>
  <div class="Maker_DrawingBoard">
    <div class="formArea" v-if="board">
      <CusForm
        :form="form"
        :formItems="formItems"
        :originForm="form"
        :Entity="board"
        class="innerForm"
        ref="theForm"
      >
        <el-form-item>
          <el-button type="primary" @click="submitForm" class="saveBtn">{{
            isAdd ? "确认创建" : "保存修改"
          }}</el-button>
          <el-button @click="resetForm">恢复默认</el-button>
        </el-form-item>
      </CusForm>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import DrawingBoard from "../Entity/DrawingBoard";
//import CusForm from './Maker_tools/CusForm';
export default {
  name: "Maker_DrawingBoard",
  // components: {
  //   CusForm
  // },
  props: {
    //可以是 实体 也可以是 rec，也可无
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
      form: {}
      //【update】基于此，需新建一个cusForm
      //rules: {},
    };
  },
  //computed: {},
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
        if (val.hidden) {
          return;
        }
        //#3 自身tag配置
        //【update】无须$key设定
        items.push(val);
        //#1 form值
        //me.$set(me.form, key, recordData[key]);
        //#2 规则设定
        // if (val.rules) {
        //   me.$set(me.rules, key, val.rules);
        // }
      });
      me.formItems = items;

      return items;
    },
    //#core 1 对一个Board实体进行确认，然后放入store，且emit该board
    submitForm() {
      let me = this;
      me.$refs.theForm.$refs.form.validate(function(valid) {
        //console.log(["创建是否同通过？", arguments]);
        if (valid) {
          me.board.setData(me.form);
          me.setForm(me.board.recordData);
          me.board
            .save()
            .then(function() {
              console.log(["成功 board.save()", arguments]);
              me.$emit("submitForm", me.board, me);
            })
            .catch(result => {
              console.log(["失败 board.save()", arguments]);
            });
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
      this.$refs.theForm.$refs.form.resetFields();
    }
  },
  mounted() {
    let me = this;
    console.log(["开始探究初始过程", me]);
    //~ 1 board初始
    if (me.record) {
      if (me.record instanceof DrawingBoard) {
        me.board = me.record;
      } else if (me.record.templateCode) {
        let theBoard = me.$store.getters.getBoard(me.record.templateCode);
        if (theBoard) {
          me.board = theBoard;
        }
      }
    }
    //~ 1.2 未找到才新建
    if (!me.board) {
      me.board = new DrawingBoard(me.record);
    }
    //~ 2 子项按配置加入
    me.initFormItems();
  }
};
</script>

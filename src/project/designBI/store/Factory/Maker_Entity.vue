<template>
  <div class="Maker_Entity">
    <div class="formArea" v-if="Instance">
      <CusForm
        :form="form"
        :formItems="formItems"
        :originForm="form"
        :Entity="Instance"
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
import { Base } from "@designBI/views/mixins/Entity";
//import DesignItemInstance from '@designBI/store/Entity/DesignItemInstance';
export default {
  name: "Maker_Entity",
  mixins: [Base],
  props: {
    //传进来的 实体类型 指明
    EntityClass: {
      type: Function,
      required: true
    },
    Entity: {
      type: Object,
      required: false
      // default() {
      //   return {};
      // }
    },
    newSave: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formItems: [],
      form: {}
    };
  },
  computed: {
    //传入的是否是
    isAdd() {
      return this.Entity instanceof this.EntityClass;
    }
  },
  methods: {
    initFormItems() {
      let me = this,
        items = [];
      if (!me.Instance) {
        return;
      }
      let baseCfg = me.Instance.baseCfg;
      tool.each(baseCfg, (key, val) => {
        if (val.hidden) {
          return;
        }
        items.push(val);
      });
      me.formItems = items;

      return items;
    },
    //#core 1 对一个Board实体进行确认，然后放入store，且emit该board
    submitForm() {
      let me = this;
      me.$refs.theForm.$refs.form.validate(function(valid) {
        console.log(["创建是否同通过？", arguments]);
        if (valid) {
          me.Instance.setData(me.form);
          //me.setForm(me.Instance.recordData);
          if (me.newSave) {
            me.Instance.save()
              .then(function() {
                console.log(["成功 Instance.save()", arguments]);
                me.$emit("submitForm", me.Instance, me);
              })
              .catch(result => {
                console.log(["失败 Instance.save()", arguments]);
              });
          } else {
            me.$emit("submitForm", me.Instance, me);
          }
        } else {
          //console.log("error submit!!");
          return false;
        }
      });
    },
    // setForm(vals) {
    //   let me = this;
    //   tool.each(me.form, key => {
    //     if (vals[key]) {
    //       me.form[key] = vals[key];
    //     }
    //   });
    // },
    resetForm() {
      this.$refs.theForm.$refs.form.resetFields();
    }
  },
  created() {
    //console.log(["执行created Maker_Entity start"]);
    let me = this;

    if (!me.Instance) {
      me.Instance = new me.EntityClass(me.Entity);
    }

    me.initFormItems();

    //console.log(["执行created Maker_Entity end"]);
  }
};
</script>

<style></style>

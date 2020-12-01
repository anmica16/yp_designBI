<template>
  <div class="CusFormItem-wrap">
    <template v-if="$jsonFields.length">
      <div class="jsonFields-wrap">
        <fieldset>
          <legend>{{ propKey }}</legend>
          <!--【update】用model代替的form 传入不一定对。 这里model可能不太对，看看能对应上不 -->
          <CusForm
            :level="level + 1"
            :form="modelVal"
            :formItems="$jsonFields"
            :originForm="originForm"
            :Entity="Instance"
            class="innerForm"
          >
            <!-- <el-form-item
              v-for="field in $jsonFields"
              :key="field.item.$key"
              :label="field.item.name"
              :prop="field.item.$key"
            >
              <CusFormItem v-bind="field"> </CusFormItem>
            </el-form-item> -->
          </CusForm>
        </fieldset>
      </div>
    </template>
    <template v-else>
      <el-input
        v-if="inputXtype === 'el-input'"
        :placeholder="item.placeholder"
        :readOnly="item.readOnly"
        :disabled="item.disabled"
        v-model="modelVal"
      ></el-input>
      <el-select
        ref="select"
        v-if="inputXtype === 'select_table'"
        v-model="modelVal"
      >
        <el-table :data="select_table_data" @row-click="handleRowClick">
          <el-table-column
            v-for="col in select_table_columns"
            :key="col.prop"
            v-bind="col"
          ></el-table-column>
        </el-table>
      </el-select>
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import { Base } from "@designBI/views/mixins/Entity";
import tool from "@/plugins/js/tool";
//import CusForm from "./CusForm.vue";
//----------
// 通过 propArray取 Entity的 值，保存到form对象上，然后保存时，返回到Entity上
export default {
  name: "CusFormItem",
  mixins: [Base],
  // components: {
  //   CusForm
  // },
  props: {
    //# 0 由form指定的 当前深入层次
    level: {
      type: Number,
      required: true
    },
    //# 1 输入控件 基本配置
    item: {
      //+ 1 有些可能是 string【update】已解决，待验证
      type: Object,
      required: true
    },
    //# 2-2 顶层form
    originForm: {
      type: Object,
      required: true
    },
    //# 2 form 存值对象 临时储存
    form: {
      type: Object,
      required: true
    },
    //# 3 实体 载入载体 【强调】
    Entity: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      modelVal: null
    };
  },
  computed: {
    //# 4 取值字段集合 层层深入
    //【update 29-1】换到 item之中 测试
    propsArray() {
      return this.item.propsArray;
    },

    //--------
    // select_table型应该传进来的2个
    //【update】 放在item之中
    select_table_data() {
      return this.item.select_table_data;
    },
    select_table_columns() {
      return this.item.select_table_columns;
    },
    type() {
      return this.item.type;
    },
    //属性名
    propKey() {
      return this.propsArray[this.propsArray.length - 1];
    },
    //子属性加入
    $jsonFields() {
      let me = this,
        fileds = [];
      if (me.item.$jsonFields) {
        tool.each(me.item.$jsonFields, (key, val) => {
          if (val.hidden) {
            return;
          }
          // val.$key = key;
          // let filed = {
          //   item: val,
          //   form: me.form,
          //   Entity: me.Instance,
          //   propsArray: me.propsArray.concat([key]),
          // };
          //【update】简单的放入即可
          fileds.push(val);
        });
      }
      return fileds;
    },
    inputXtype() {
      let me = this,
        theXtype = "el-input",
        type = me.type;

      switch (type) {
        default:
        case "text":
        case "password":
          theXtype = "el-input";
          break;
        case "select_table":
          theXtype = "select_table";
          break;
      }

      return theXtype;
    }
  },
  methods: {
    getModelVal() {
      return this.loadContextByProp(this.form, this.propsArray);
    },
    loadContextByProp(sourceObj, originPropsArray) {
      if (
        !tool.isObject(sourceObj) ||
        !originPropsArray ||
        !originPropsArray.length
      ) {
        console.log(["调试loadContextByProp传参数错误"]);
        throw "loadContextByProp传参数错误";
      }
      //# 0 避免源 propsArray被剥削
      let propsArray = tool.clone(originPropsArray);
      let me = this,
        prop = propsArray.splice(0, 1),
        deepObj = sourceObj[prop];

      //# 1 还存在剩余深入prop的时候，那么必须为obj
      if (propsArray.length) {
        //# 2 有值但不为对象
        if (!tool.isNull(deepObj) && !tool.isObject(deepObj)) {
          throw `试图在非对象上深入取值：${(deepObj, prop)}`;
        }
        //# 2.2 无值 便赋对象的值
        if (tool.isNull(deepObj)) {
          Vue.set(sourceObj, prop, {});
        }
      } else {
        //# 3 当前即为值，但如果为null，那么赋予默认值""作为响应式基础
        if (tool.isNull(deepObj)) {
          Vue.set(sourceObj, prop, "");
        }
      }
      //# 4 可能仍为对象，那么继续深入，自我调用
      deepObj = sourceObj[prop];

      if (propsArray.length > 0) {
        return me.loadContextByProp(deepObj, propsArray);
      } else {
        return deepObj;
      }
    },
    handleRowClick() {
      console.log(["row 点击了！", arguments]);
      //【update】需要将值正常赋予
      this.$refs.select.handleBlur();
    }
  },
  watch: {
    //# 3 将值反应到 form上去
    //【update】尚不确定 originForm是否连带ok
    modelVal(newVal) {
      this.$set(this.form, this.item.$key, newVal);
    }
  },
  created() {
    let me = this;
    console.log(["model有些是 {}的会报错？"]);
    //#1 深入初始 form值，有 set get的
    let modelVal = me.getModelVal();
    if (me.$jsonFields.length && tool.isObject(modelVal)) {
      console.log(["应该不会是对象！", modelVal, me.item.propsArray]);
    }
    // if (me.$jsonFields.length) {
    //   //#2【update】从"" 到 {} 这个会纳入 响应中去吗
    //   modelVal = {};
    // }
    //#3 赋值过来【update】form的有关能正确反应吗？
    modelVal = me.loadContextByProp(me.Instance.recordData, me.propsArray);
    if (me.$jsonFields.length && tool.isObject(modelVal)) {
      console.log(["应该是对象！", modelVal, me.item.propsArray]);
    }
    me.modelVal = modelVal;
  }
};
</script>

<style></style>

<template>
  <div class="CusFormItem-wrap">
    <el-input
      v-if="xtype === 'el-input'"
      :placeholder="item.placeholder"
      :readOnly="item.readOnly"
      :disabled="item.disabled"
      v-model="form[item.$key]"
    ></el-input>
  </div>
</template>

<script>
export default {
  name: "CusFormItem",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    type() {
      return this.item.type;
    },
    xtype() {
      let me = this,
        theXtype = "el-input",
        type = me.type;

      switch (type) {
        case "text":
        case "password":
          theXtype = "el-input";
          break;
        default:
          break;
      }

      return theXtype;
    }
  }
};
</script>

<style></style>

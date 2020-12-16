<template>
  <div class="test" @mousedown.stop="testFn">
    <div class="first">测试vue组件</div>
    <div>{{ pro1 }}</div>
    <div v-if="slot1" id="slot1">{{ slot1 }}</div>
    <div v-if="slot2" id="slot2">{{ slot2 }}</div>
    <div v-if="slot3" id="slot3">{{ slot3 }}</div>
  </div>
</template>

<script>
export default {
  name: "Simple",
  props: {
    source: {
      type: Object
    },
    pro1: String
  },
  computed: {
    slot1() {
      return this.source && this.source.slot1;
    },
    slot2() {
      return this.source && this.source.slot2;
    },
    slot3() {
      return this.source && this.source.slot3;
    }
  },
  methods: {
    testFn() {
      let me = this;
      console.log(["走的 testFn"]);
      me.$parent.$emit("select");
    }
  }
};
</script>

<style></style>

<template>
  <div class="d-one-cell" :class="{ added: added }" style="position: relative;">
    <div
      v-show="!added"
      class="tipLayer"
      style="position: absolute; top:0; left:0;"
    >
      <span class="icon fa fa-plus"></span>
    </div>

    <div ref="inner" class="showContent">
      <!-- <div ref="inner" class="showContent-inner"></div> -->
    </div>
  </div>
</template>

<script>
/* eslint-disable no-undef */
export default {
  name: "d-one-cell",
  data() {
    return {
      added: false
    };
  },
  methods: {
    changeAdded() {
      this.added = !this.added;
    },
    containerAfterAdd() {
      console.log(["添加！", arguments]);
      this.added = true;
    },
    containerItemRemove() {
      console.log(["移除！", arguments]);
      this.added = false;
    }
  },
  mounted() {
    var me = this;

    me.$on("containerAfterAdd", function() {
      me.containerAfterAdd.apply(me, arguments);
    });

    me.$on("containerItemRemove", function() {
      me.containerItemRemove.apply(me, arguments);
    });
  }
};
</script>

<template>
  <div class="NewDataPage"></div>
</template>

<script>
export default {
  name: "NewDataPage",
  data() {
    return {
      //@ 1 基本
      id: null,
      pIndex: null,
      index: null,
      //@ 2 工具
      X: null
      //@ 3 其他
    };
  },
  methods: {
    //~ 2 保存后就取消该 id的 readyAdd状态
    submitFn() {},
    //~ 3 取消则直接删除该record
    cancelFn() {}
  },
  created() {
    let me = this,
      route = me.$route;
    //~ 1 引入插件
    import(
      /* webpackChunkName: "bi-center-data" */
      "xlsx"
    ).then(function(mod) {
      console.log(["加载xlsx完毕", arguments, me]);
      me.X = mod;
      me.$store.state.progress && (me.$store.state.progress = 100);
    });
    //~ 2 参数读取
    me.id = route.query.id;
    me.pIndex = route.query.pIndex;
    me.index = route.query.index;
  }
};
</script>

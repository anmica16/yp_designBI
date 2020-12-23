<template>
  <div class="NewDataPage">
    <div class="headBar">
      <div class="dataName">
        <span class="pre">表名</span>
        <el-input v-model="name" placeholder="请输入表名"></el-input>
      </div>
      <div class="fill"></div>
      <div class="yesno">
        <el-button ref="cancel" type="info" :disabled="!canCancel"
          >取消</el-button
        >
        <el-button
          ref="submit"
          :type="canSubmit ? 'primary' : ''"
          :disabled="!canSubmit"
          >确定</el-button
        >
      </div>
    </div>
    <div class="operateBody">
      <div class="leftArea">
        <!-- ~ 1 上传信息、操作 -->
        <div class="topMain">
          <div class="updInfo">
            <span class="pre">上传信息：</span>
            <span class="fileName"></span>
          </div>
          <dir class="fill"></dir>
          <div class="operArea">
            <el-button type="primary" v-if="!workBook">上传数据</el-button>

            <el-button type="primary" v-if="workBook">追加上传</el-button>

            <el-button type="primary" v-if="workBook">重新上传</el-button>
          </div>
        </div>
        <div class="bodyInfo">
          <div class="tipText">
            <template v-if="!workBook">
              <div class="text1">要求：</div>
              <div class="text1">1.支持格式：xls、csv、xlsx；</div>
              <div class="text1">
                2.只读取第一个sheet的数据，请确保从第一个单元格开始没有：复杂函数或者VBA编程等；
              </div>
              <div class="text1">
                3.第一行为字段名，第二行开始为字段的值，请确保第一行没有合并单元格；
              </div>
            </template>
            <template v-else>
              <div class="group1">
                <div class="text2">
                  追加上传：只需上传新增的Excel数据，把新上传的Excel数据增添到原数据后，忽略新增字段
                </div>
                <div class="text2">重新上传：全部替换为新上传的Excel</div>
              </div>
              <div class="text1">预览区域只列出前100行数据；</div>
              <div class="text1">第一行为字段名，第二行开始为字段的值</div>
            </template>
          </div>
          <template v-if="workBook">
            <div class="fieldType"></div>
          </template>
        </div>
      </div>
      <div class="rightArea">
        <template v-if="workBook">
          <div></div>
        </template>
        <div v-else class="noTip">
          <div class="back"></div>
          <div class="text">请先上传Excel数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewDataPage",
  props: {
    //@ 1 基本
    id: {
      type: String,
      required: true
    },
    pIndex: {
      type: String,
      required: true
    },
    index: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      //@ 2 工具
      X: null,
      //@ 3 其他
      name: "",
      canSubmit: false,
      canCancel: true,
      //@ 4 上传读取的数据
      workBook: null
    };
  },
  methods: {
    //~ 2 保存后就取消该 id的 readyAdd状态
    submitFn() {},
    //~ 3 取消则直接删除该record
    cancelFn() {}
  },
  created() {
    let me = this;
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
    // me.id = route.query.id;
    // me.pIndex = route.query.pIndex;
    // me.index = route.query.index;
  }
};
</script>

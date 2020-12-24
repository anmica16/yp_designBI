<template>
  <div class="NewDataPage">
    <div class="headBar">
      <div class="dataName">
        <span class="pre">表名</span>
        <el-input v-model="name" placeholder="请输入表名"></el-input>
      </div>
      <div class="fill"></div>
      <div class="yesno">
        <el-button
          ref="cancel"
          type="info"
          :disabled="!canCancel"
          @click="cancelFn"
          >取消</el-button
        >
        <el-button
          ref="submit"
          :type="canSubmit ? 'primary' : ''"
          :disabled="!canSubmit"
          @click="submitFn"
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
        <div
          class="bodyInfo"
          @dragover.stop.prevent="leftDragOverFn"
          @dragleave="leftDragLeaveFn"
          @drop.stop.prevent="leftDrogFn"
        >
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
          <!-- ~ 1  -->
          <template v-if="workBook">
            <div class="fieldType"></div>
          </template>
          <!-- ~ 2 覆盖全部body的 drop层 -->
          <div
            v-show="leftDragOver"
            class="dragTip"
            :class="{ newUpd: !workBook }"
          >
            <div class="icon"></div>
            <div class="text">{{ leftDragText }}</div>
          </div>
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
import $ from "@/plugins/js/loader";
import Vue from "vue";
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
      leftDragOver: false,
      //@ 4 上传读取的数据
      reading: false,
      workBook: null
    };
  },
  computed: {
    rABS() {
      return (
        typeof FileReader !== "undefined" &&
        (FileReader.prototype || {}).readAsBinaryString
      );
    },
    leftDragText() {
      return this.workBook
        ? "拖拽表格到此处以上传"
        : "拖拽表格到此处以重新上传";
    }
  },
  methods: {
    backPage() {
      this.$router.push({});
    },
    //~ 2 保存后就取消该 id的 readyAdd状态
    submitFn() {
      let me = this;
      console.log(["尝试提交", me]);
    },
    //~ 3 取消则直接删除该record
    cancelFn() {
      let me = this;
      //# 1 删除
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.Delete,
        data: {
          table: "data",
          ids: JSON.stringify([me.id])
        }
      }).catch(r => {});
      //# 2 返回
      me.backPage();
    },
    //~ 5 核心 读取文件，返回res的 wb
    dealFile(files) {
      let me = this,
        X = me.X,
        rABS = me.rABS;
      me.reading = true;
      return new Promise((res, rej) => {
        var f = files[0];
        //【update】看能不能自动转换？ie9
        var reader = new FileReader();
        //# 1 经过时间处理
        reader.onload = function(e) {
          me.leftDragOver = false;
          var data = e.target.result;
          if (!rABS) data = new Uint8Array(data);
          //# 2 获取
          let wb = X.read(data, { type: rABS ? "binary" : "array" });
          me.reading = false;
          console.log(["读取完毕", wb]);
          res(wb);
        };
        if (rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
      });
    },
    //~ 4 drop相关
    leftDragOverFn(e) {
      let me = this;
      me.leftDragOver = true;
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    },
    leftDragLeaveFn(e) {
      let me = this;
      me.leftDragOver = false;
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
    },
    leftDrogFn(e) {
      let me = this;
      //# 1 左侧重新上传
      if (me.workBook) {
        // 待补充 删除
      }
      //# 2 赋值
      me.dealFile(e.dataTransfer.files).then(wb => {
        me.workBook = wb;
      });
    }
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

<template>
  <div class="AttachBoard" v-if="isAdd || (!isAdd && board)">
    <el-link :underline="false" v-if="isAdd" class="addTip" @click="createBoard"
      ><i class="el-icon-brush"></i><span class="text">新增绘板</span></el-link
    >
    <div v-else class="BoardPost">
      <router-link
        :to="{
          name: 'DesignEdit',
          params: { templateCode: recordData.templateCode }
        }"
      >
        绘板：{{ recordData.name }}；描述：{{ recordData.desp }}；绘板ID：{{
          recordData.templateCode
        }}</router-link
      >
      <el-button @click="deleteBoard">删除</el-button>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import tool from "@/plugins/js/tool";
import $ from "jquery";
import DrawingBoard from "@designBI/store/Entity/DrawingBoard";
export default {
  name: "AttachBoard",
  props: {
    Entity: DrawingBoard,
    isAdd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      board: null,
      boardMaker: null,
      showMaker: false
    };
  },
  computed: {
    recordData() {
      return this.board && this.board.recordData;
    }
  },
  methods: {
    createBoard() {
      let me = this;
      if (me.boardMaker) {
        me.boardMaker.showMaker = true;
        return;
      }
      //if (!me.boardMaker) {
      let cfg = {
        name: "DrawingBoardCg",
        template: `<Window ref='win' title="新建绘板">
            <Maker_Entity 
            :newSave="true"
            :EntityClass="DrawingBoard"
            @submitForm="submitForm"></Maker_Entity>
          </Window>`,
        data() {
          return {
            DrawingBoard,
            showMaker: true,
            isAdd: true
          };
        },
        methods: {
          //【update】成功之后，是否去除掉？似乎不影响
          submitForm(board, maker) {
            //console.log(["通过？", this, arguments]);
            //me.board = board;
            //me.recordData = recordData;
            this.showMaker = false;
            me.boardMaker = false;
          }
        }
      };
      //【update】可行！
      let VerbWin = Vue.extend(cfg);
      me.boardMaker = Vue.$windowManager.add(VerbWin);
      // me.boardMaker = new Vue({
      //   components: {
      //     VerbWin
      //   },
      //   template: `<VerbWin></VerbWin>`
      // });
      // let id = tool.uniqueStr(),
      //   addDiv = $(`<div id="${id}"></div>`);
      // $("body").append(addDiv);
      // me.boardMaker.$mount(addDiv[0]);
      //}
      //me.showMaker = true;
    },
    deleteBoard() {
      let me = this;
      me.$msgbox({
        type: "warning",
        title: "确认",
        message: "真的要删除该绘板吗？",
        showCancelButton: true
      })
        .then(() => {
          me.board.delete().then(() => {
            me.board = null;
          });
        })
        .catch(() => {});
    }
  },
  created() {
    let me = this;
    if (me.Entity) {
      me.board = me.Entity;
    }
  }
};
</script>

<style></style>

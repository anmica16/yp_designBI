<template>
  <div class="AttachBoard">
    <div v-if="!recordData" class="addTip" @click="createBoard">新增绘板</div>
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
    </div>
  </div>
</template>

<script>
//import Maker_DrawingBoard from "@designBI/store/Factory/Maker_DrawingBoard.vue";
import Vue from "vue";
import tool from "@/plugins/js/tool";
import $ from "jquery";
import DrawingBoard from "@designBI/store/Entity/DrawingBoard";
export default {
  name: "AttachBoard",
  // components: {
  //   Maker_DrawingBoard
  // },
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
      if (me.board || me.boardMaker) {
        return;
      }
      //if (!me.boardMaker) {
      let cfg = {
        name: "DrawingBoardCg",
        template: `<Window title="新建绘板" v-show="showMaker">
            <Maker_Entity 
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
            me.board = board;
            //me.recordData = recordData;
            this.showMaker = false;
            me.boardMaker = false;
          }
        }
      };
      //【update】可行！
      let VerbWin = Vue.extend(cfg);
      Vue.$windowManager.add(VerbWin);
      me.boardMaker = true;
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
    }
  }
  // watch: {
  //   showMaker(newVal) {
  //     this.boardMaker.showMaker = newVal;
  //   }
  // }
};
</script>

<style></style>

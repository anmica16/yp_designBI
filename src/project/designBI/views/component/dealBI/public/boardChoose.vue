<template>
  <div class="boardChoose">
    <!-- =1= 选择提示 -->
    <div class="boardTip">
      <span class="preT">当前文件夹：</span>
      <span class="tipT">{{ (nowFolder && nowFolder.name) || "根目录" }}</span>
      <span v-if="nowFolder">
        <span class="preT preT2">树节点：</span>
        <span class="tipT">{{ nowFolder.index }}</span>
      </span>

      <el-button
        size="mini"
        :title="!nowFolder ? '已是根目录' : '返回上一级文件夹'"
        type="primary"
        icon="bi bi-undo"
        :disabled="!nowFolder"
        @click="backParentFolderFn"
      ></el-button>
    </div>
    <!-- =2= 表选择 -->
    <div class="selectArea">
      <el-table
        v-loading="boardsLoading"
        :data="boardDatasPager"
        @row-click="rowClickFn"
      >
        <el-table-column width="36">
          <template slot="default" slot-scope="scope">
            <span
              class="iconWrap"
              :class="scope.row.isFolder ? 'folder' : 'board'"
            >
              <i
                class="icon"
                :class="
                  scope.row.isFolder
                    ? 'el-icon-folder'
                    : 'el-icon-data-analysis'
                "
              ></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="desp" label="备注"></el-table-column>
        <el-table-column prop="editTime" label="创建时间"></el-table-column>
      </el-table>
      <Pager ref="pager" :total="fBoardDatas.length" :page-size="15"></Pager>
    </div>
  </div>
</template>

<script>
import { theStore } from "@designBI/store";
import tool from "@/plugins/js/tool";
export default {
  name: "boardChoose",
  props: {
    prePIndex: String,
    //# 2 数据过滤器
    boardDataFilter: Function
  },
  data() {
    return {
      nowFolder: null,
      boardDatas: [],
      boardsLoading: false
    };
  },
  computed: {
    nowPIndex() {
      let me = this;
      return me.nowFolder ? me.nowFolder.index : "";
    },
    fBoardDatas() {
      let me = this;
      if (tool.isFunction(me.boardDataFilter)) {
        return me.boardDataFilter(me.boardDatas);
      } else {
        return me.boardDatas;
      }
    },
    boardDatasPager() {
      let me = this,
        datas = me.fBoardDatas,
        pager = me.$refs.pager;
      if (pager) {
        return datas.slice(pager.start, pager.end);
      } else {
        return datas;
      }
    }
  },
  methods: {
    //+ 3 文件夹模式的获取列表
    getBoardList() {
      let me = this;
      me.boardsLoading = true;
      theStore
        .dispatch("getBoardList", me.nowPIndex)
        .then(boards => {
          me.boardDatas = boards;
        })
        .finally(() => {
          me.boardsLoading = false;
        });
    },
    getNowFolder(pIndex) {
      let me = this;
      return new Promise((res, rej) => {
        theStore
          .dispatch("getNowBoard", { index: pIndex })
          .then(board => {
            if (board && board.recordData.isFolder) {
              me.nowFolder = board.recordData;
              res();
              return;
            }
            rej();
          })
          .catch(r => {
            rej(r);
          });
      });
    },
    backParentFolderFn() {
      let me = this,
        folderPIndex = me.nowFolder.pIndex;
      if (!folderPIndex) {
        me.nowFolder = null;
        return;
      }
      me.getNowFolder(folderPIndex);
    },
    rowClickFn(row, col) {
      let me = this;
      me.$emit("row-click", row, col, me);

      if (row.isFolder) {
        me.nowFolder = row;
      } else {
        me.$emit("board-select", row, col, me);
      }
    }
  },
  watch: {
    nowPIndex(newVal, oldVal) {
      let me = this;
      if (newVal != oldVal) {
        me.getBoardList();
      }
    }
  },
  created() {
    let me = this;
    if (me.prePIndex) {
      me.getNowFolder(me.prePIndex).then(() => {
        me.getBoardList();
      });
    } else {
      me.getBoardList();
    }
  }
};
</script>

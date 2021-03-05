<template>
  <div class="DesignCenter">
    <div class="topH">
      <div class="centerHeadWrap">
        <div class="leftIcon">
          <i class="el-icon-s-promotion"></i>
        </div>
        <div class="app-title">
          <h1 class="app-title-text">朗速BI商业设计</h1>
        </div>
        <dir class="rightItems">
          <div class="oneItem group">
            <el-link
              title="前往团队设置页"
              @click="goGroupPageFn"
              :underline="false"
            >
              <i class="el-icon-connection"></i
              ><span class="text">{{ pageGroupName || "尚无" }}</span></el-link
            >
            <el-dropdown
              v-show="dropDownGroups.length"
              @menu-item-click="changeGroupFn"
              trigger="click"
            >
              <el-button
                size="mini"
                type="primary"
                title="切换团队"
                icon="el-icon-caret-bottom"
              ></el-button>
              <el-dropdown-menu class="groupMenu" slot="dropdown">
                <template v-for="oneGroup in dropDownGroups">
                  <el-dropdown-item :command="oneGroup" :key="oneGroup.id">{{
                    oneGroup.name
                  }}</el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <!-- <div class="oneItem star">
            <i class="el-icon-star-off"></i>
          </div> -->
          <msgBtn></msgBtn>
          <userBtn class="oneItem" :userRankStr="loginUserRankStr"> </userBtn>
        </dir>
      </div>
    </div>
    <div class="theBody">
      <el-tabs
        :value="nowMain"
        class="centerBody"
        tab-position="left"
        @tab-click="tabChangeFn"
      >
        <el-tab-pane name="DesignCenter">
          <div slot="label" class="item">
            <div class="boardsList">
              <div class="icon"><i class="el-icon-data-line"></i></div>
              <div class="text">绘板</div>
            </div>
          </div>

          <div class="BoardsList-inner">
            <div class="topArea">
              <div class="leftPart">
                <!-- 新增用 -->
                <!-- <AttachBoard :isAdd="true"></AttachBoard> -->

                <el-link
                  :underline="false"
                  class="addTip"
                  @click="(dialogBoard = true), (folderMode = false)"
                  ><i class="icon el-icon-brush"></i
                  ><span class="text">新增绘板</span>
                </el-link>

                <el-link
                  :underline="false"
                  class="addTip"
                  @click="(dialogBoard = true), (folderMode = true)"
                  ><i class="icon el-icon-s-cooperation"></i
                  ><span class="text">新增文件夹</span>
                </el-link>

                <span class="nowFolderTip">
                  <span class="preT">当前文件夹：</span>
                  <span class="tipT">{{
                    (nowFolder && nowFolder.name) || "根目录"
                  }}</span>
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
                </span>

                <el-dialog
                  :append-to-body="true"
                  class="newBoardDialog"
                  :title="`新增${folderMode ? '绘板文件夹' : '绘板'}`"
                  :before-close="boardLogClear"
                  :visible.sync="dialogBoard"
                >
                  <el-form
                    ref="newBoardForm"
                    :model="dialogBoardForm"
                    :rules="dialogBoardRules"
                    label-width="120px"
                  >
                    <el-form-item
                      :label="`绘板${folderMode ? '文件夹' : ''}名`"
                      prop="name"
                    >
                      <el-input
                        v-model="dialogBoardForm.name"
                        :placeholder="
                          `请输入绘板${folderMode ? '文件夹' : ''}名称`
                        "
                        autocomplete="off"
                      ></el-input>
                    </el-form-item>
                    <el-form-item label="备注说明" prop="desp">
                      <el-input
                        v-model="dialogBoardForm.desp"
                        placeholder="可做一些备注说明"
                        autocomplete="off"
                      ></el-input>
                    </el-form-item>
                  </el-form>
                  <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogBoard = false">取 消</el-button>
                    <el-button
                      v-loading="dialogBoardLoading"
                      type="primary"
                      @click="createBoard"
                      >确 定</el-button
                    >
                  </div>
                </el-dialog>
              </div>
              <div class="rightPart"></div>
            </div>
            <div class="bodyArea">
              <el-table
                v-loading="boardsLoading"
                height="100%"
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
                <el-table-column>
                  <template #default="scope">
                    <el-link @click.stop="deleteBoard(scope)">删除</el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="editTime"
                  label="创建时间"
                ></el-table-column>
              </el-table>
              <Pager
                ref="pager"
                :total="boardDatas.length"
                :page-size="15"
              ></Pager>
            </div>
          </div>
          <!-- <template v-for="board in boards">
            <AttachBoard :key="board.templateMap" :Entity="board"></AttachBoard>
          </template> -->
        </el-tab-pane>
        <!-- <el-tab-pane name="DesignCenter-menu">
          <div slot="label" class="item">
            <div class="menu">
              <div class="icon"><i class="el-icon-s-unfold"></i></div>
              <div class="text">目录</div>
            </div>
          </div>
          <router-view name="menu"></router-view>
        </el-tab-pane> -->
        <el-tab-pane name="DesignCenter-data">
          <div slot="label" class="item">
            <div class="data">
              <div class="icon"><i class="el-icon-s-data"></i></div>
              <div class="text">数据预备</div>
            </div>
          </div>
          <router-view name="data"></router-view>
        </el-tab-pane>
      </el-tabs>
      <!-- 
      <div class="boardArea"></div> -->
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import DrawingBoard from "@designBI/store/Entity/DrawingBoard";
import $ from "jquery";
import loader from "@/plugins/js/loader";
import Vue from "vue";
import LoginUser from "@designBI/views/mixins/LoginUser";
import userBtn from "@designBI/views/Page/PublicItem/userBtn.vue";
import msgBtn from "@designBI/views/Page/PublicItem/msgBtn.vue";
//import AttachBoard from "./AttachBoard";
export default {
  name: "DesignCenter",
  components: {
    userBtn,
    msgBtn
  },
  mixins: [LoginUser],
  data() {
    return {
      windowMap: {},
      nowMain: "board",
      //# 1 新绘板
      dialogBoard: false,
      dialogBoardLoading: false,
      dialogBoardForm: {
        name: "",
        desp: ""
      },
      //# 2 新绘板 文件夹模式
      folderMode: false,
      nowFolder: null
      //# 3 文件夹模式 列表加载
      // boardsLoading: false,
      // boardDatas: []
    };
  },
  computed: {
    boardsLoading() {
      let me = this;
      return me.$store.state.getBoardsInDBLoading;
    },
    boards() {
      let me = this,
        list = [],
        map = this.$store.state.templateMap;
      tool.each(map, (key, val) => {
        if (
          val.board &&
          val.board.recordData.pIndex == me.nowPIndex &&
          (val.board.recordData.ownerGroup == me.pageGroupId ||
            val.board.recordData.ownerGroup == -1)
        ) {
          list.push(val.board);
        }
      });
      list.sort((a, b) => {
        let d1 = tool.Date.toDateTime(a.getData("editTime")),
          d2 = tool.Date.toDateTime(b.getData("editTime"));
        return d1 && d2 && d1 < d2;
      });
      return list;
    },
    boardDatas() {
      let me = this,
        boards = me.boards,
        list = [];
      boards.forEach(item => {
        list.push(item.parser.recordData);
      });

      return list;
    },
    nowPIndex() {
      let me = this;
      return me.nowFolder ? me.nowFolder.index : "";
    },
    boardDatasPager() {
      let me = this,
        datas = me.boardDatas,
        pager = me.$refs.pager;
      if (pager) {
        return datas.slice(pager.start, pager.end);
      } else {
        return datas;
      }
    },
    editLocBase() {
      let me = this,
        loc = window.location,
        editLoc = loc.pathname + "#/user/" + me.$route.params.id + "/edit/";
      return editLoc;
    },
    //# 2 文件夹模式提示
    dialogBoardRules() {
      let me = this;
      return {
        name: [
          {
            required: true,
            message: `请输入绘板${me.folderMode ? "文件夹" : ""}名称`,
            trigger: "blur"
          }
        ]
      };
    },
    //# 3 group下拉列表剔除当前的。
    dropDownGroups() {
      let me = this,
        nowGroup = me.pageGroup;
      return nowGroup
        ? me.pageGroups.filter(g => {
            return g.id != nowGroup.id;
          })
        : me.pageGroups;
    }
  },
  methods: {
    rowClickFn(row) {
      let me = this,
        map = me.windowMap,
        tempCode = row.templateCode;
      if (row.isFolder) {
        me.nowFolder = row;
      } else {
        //【update】以后注意 session
        if (!map[tempCode] || !map[tempCode].window.location.pathname) {
          let toLoc = me.editLocBase + tempCode,
            newWin = window.open(toLoc);
          map[tempCode] = newWin;
        } else {
          map[tempCode].window.location.reload();
        }
      }
    },
    deleteBoard(scope) {
      let me = this;
      me.$msgbox({
        type: "warning",
        title: "确认",
        message: "真的要删除该绘板吗？",
        showCancelButton: true
      })
        .then(() => {
          console.log(["删除时的确认", scope, scope.row]);
          let board = me.$store.getters.getBoard(scope.row.templateCode);
          board.delete();
        })
        .catch(() => {});
    },
    tabChangeFn(pane, e) {
      let me = this,
        route = me.$route,
        router = me.$router,
        toName = pane.name;
      if (route.name !== toName) {
        router.push({ name: toName });
      }
    },
    //+ 2 文件夹式绘板模式
    boardLogClear(done) {
      let me = this;

      tool.apply(me.dialogBoardForm, {
        name: "",
        desp: ""
      });

      done();
    },
    createBoard() {
      let me = this,
        newBoardForm = me.$refs.newBoardForm;
      newBoardForm.validate(ifPass => {
        if (ifPass) {
          let formCfg = me.dialogBoardForm,
            board = new DrawingBoard({
              //=1= 文件夹模式所需
              isFolder: me.folderMode,
              pIndex: me.nowPIndex,
              createTime: tool.now(),
              createOperId: me.loginUser.userCode,
              ownerGroup: me.pageGroupId
            });
          board.setData(formCfg);
          me.dialogBoardLoading = true;
          board
            .save()
            .then(function() {
              me.$message.success("成功新建绘板");
              me.dialogBoard = false;
              me.dialogBoardLoading = false;
            })
            .catch(r => {
              me.$message.success("新建绘板失败");
              me.dialogBoardLoading = false;
            });
        }
      });
    },
    //+ 3 文件夹模式的获取列表
    getBoardList() {
      let me = this;
      me.$store.dispatch("getBoardsInDB", me.nowPIndex);
    },
    backParentFolderFn() {
      let me = this,
        folderPIndex = me.nowFolder.pIndex;
      if (!folderPIndex) {
        me.nowFolder = null;
        return;
      }
      me.$store.dispatch("getNowBoard", { index: folderPIndex }).then(board => {
        if (board) {
          me.nowFolder = board.recordData;
        }
      });
    },
    //+ 5 前往团队页
    goGroupPageFn() {
      let me = this;
      me.$router.push({ name: "Group" });
    },
    //+ 6 切换团队
    changeGroupFn(group) {
      let me = this;
      if (group.id) {
        me.$router.push({
          name: "DesignCenter",
          params: {
            groupId: group.id
          }
        });
      }
    }
  },
  watch: {
    nowPIndex(newVal, oldVal) {
      let me = this;
      if (newVal != oldVal) {
        me.getBoardList();
      }
    },
    pageGroupId(newVal, oldVal) {
      let me = this;
      if (newVal && newVal != oldVal) {
        me.getBoardList();
      }
    }
  },
  created() {
    let me = this,
      reg = new RegExp("^(DesignCenter-[^-]+)(-.*)?"),
      name = me.$route.name,
      result = reg.exec(name);
    if (result) {
      me.nowMain = result[1];
    } else {
      me.nowMain = "DesignCenter";
    }
    //# 4 标题名改变
    let theTitle = me.$store.state.centerTitle;
    $("title").html(`${theTitle}`);

    //# 5 启动时，获取一次列表
    if (me.pageGroupId) {
      me.getBoardList();
    }
  }
};
</script>

<template>
  <div class="CenterMenu">
    <div class="leftPart">
      <div class="newItemArea">
        <el-button
          size="small"
          type="success"
          class="addTip"
          @click="(dialogMenu = true), (folderMode = false)"
          icon="icon el-icon-brush"
          >新增图表</el-button
        >

        <el-button
          size="small"
          type="warning"
          class="addTip"
          @click="(dialogMenu = true), (folderMode = true)"
          icon="icon el-icon-s-cooperation"
          >新增文件夹</el-button
        >

        <el-dialog
          :append-to-body="true"
          class="newBoardDialog menu"
          :before-close="menuLogClear"
          :visible.sync="dialogMenu"
        >
          <span class="theTitle" slot="title">
            <span class="main">{{
              `新增${folderMode ? "图表文件夹" : "图表"}`
            }}</span>
            <span v-if="!folderMode" class="sub"
              >(用于查看、分享的绘板，不可编辑)</span
            >
          </span>
          <el-form
            ref="newMenuForm"
            :model="dialogMenuForm"
            :rules="dialogMenuRules"
            label-width="120px"
          >
            <el-form-item
              :label="`图表${folderMode ? '文件夹' : ''}名`"
              prop="name"
            >
              <el-input
                v-model="dialogMenuForm.name"
                :placeholder="`请输入图表${folderMode ? '文件夹' : ''}名称`"
                autocomplete="off"
              ></el-input>
            </el-form-item>

            <template v-if="!folderMode">
              <el-form-item label="目标图表" prop="boardId">
                <el-input
                  v-model="dialogMenuSelBoardName"
                  :readonly="true"
                  placeholder="请选择目标图表"
                  autocomplete="off"
                  @focus="selectTargetBoardShow = true"
                ></el-input>
                <el-button
                  size="mini"
                  type="primary"
                  @click="selectTargetBoardShow = true"
                  icon="el-icon-picture"
                  >选择</el-button
                >

                <el-dialog
                  :append-to-body="true"
                  :destroy-on-close="true"
                  class="selectTargetBoard"
                  title="选择目标图表"
                  :visible.sync="selectTargetBoardShow"
                >
                  <BoardInsPropSelector
                    ref="insSelector"
                    :stepRange="[1]"
                    @board-select="boardSelFn"
                  ></BoardInsPropSelector>
                </el-dialog>
              </el-form-item>

              <el-form-item label="图表权限" prop="rank">
                <el-select v-model="dialogMenuForm.rank" placeholder="请选择">
                  <el-option
                    v-for="item in ranks"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </template>

            <el-form-item label="备注说明" prop="desp">
              <el-input
                v-model="dialogMenuForm.desp"
                placeholder="可做一些备注说明"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogMenu = false">取 消</el-button>
            <el-button
              v-loading="dialogMenuLoading"
              type="primary"
              @click="createMenu"
              >确 定</el-button
            >
          </div>
        </el-dialog>
      </div>
      <el-tabs :value="leftAt">
        <el-tab-pane label="目录" name="list" v-loading="menuItemListLoading">
          <!-- ~ 3 树结构 -->
          <IndexTree
            ref="tree"
            class="dataTree"
            :records="menuItemList"
            @node-click="nodeClickFn"
          >
          </IndexTree>
        </el-tab-pane>

        <!-- <el-tab-pane label="收藏" name="likeList"></el-tab-pane> -->
      </el-tabs>
    </div>

    <!-- 【2】右侧图表展示 tabs -->
    <div class="rightPart" :class="{ isFull }">
      <el-tabs
        v-model="nowOpenCode"
        type="card"
        @tab-remove="openRemoveFn"
        @tab-click="openTabClickFn"
      >
        <el-tab-pane :closable="false" key="main" name="main">
          <span slot="label" class="tabName">
            <el-dropdown trigger="click" placement="bottom">
              <el-button
                size="mini"
                class="clickIcon"
                icon="el-icon-arrow-down"
              ></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  icon="el-icon-refresh-right"
                  @click.native="openRefreshFn({ linkCode: 'main' })"
                  >刷新</el-dropdown-item
                >
                <el-dropdown-item
                  icon="el-icon-share"
                  command="share"
                  @click.native="openShareFn({ linkCode: 'main' })"
                  >分享</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>

            <span class="el-icon-s-home" title="主页"> </span>
          </span>
          <BoardView
            ref="mainView"
            v-if="loginUserMainPageCode"
            :theLinkCode="loginUserMainPageCode"
          ></BoardView>

          <div v-else class="notSetMainTip">尚未设置主页</div>
        </el-tab-pane>

        <el-tab-pane
          v-for="oneItem in openList"
          :key="oneItem.linkCode"
          :name="oneItem.linkCode"
          :label="oneItem.name"
          :closable="true"
        >
          <span slot="label" class="tabName">
            <el-dropdown trigger="click" placement="bottom">
              <el-button
                size="mini"
                class="clickIcon"
                icon="el-icon-arrow-down"
              ></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  icon="el-icon-refresh-right"
                  @click.native="openRefreshFn(oneItem)"
                  >刷新</el-dropdown-item
                >
                <el-dropdown-item
                  icon="el-icon-share"
                  command="share"
                  @click.native="openShareFn(oneItem)"
                  >分享</el-dropdown-item
                >
                <el-dropdown-item
                  v-if="loginUserMainPageCode == oneItem.linkCode"
                  icon="el-icon-circle-check"
                  >已设为主页</el-dropdown-item
                >
                <el-dropdown-item
                  v-else
                  icon="el-icon-s-flag"
                  command="setMain"
                  @click.native="openSetMainFn(oneItem)"
                  >设为主页</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>

            <span class="hoverTab">{{ oneItem.name }}</span>
          </span>

          <BoardView
            :ref="`b_${oneItem.linkCode}`"
            :theLinkCode="oneItem.linkCode"
          ></BoardView>
        </el-tab-pane>
      </el-tabs>

      <!-- 2-2 全屏按钮 -->
      <el-button
        class="toolArea"
        :class="isFull ? 'el-icon-crop' : 'el-icon-full-screen'"
        :title="isFull ? '退出全屏' : '进入全屏'"
        size="mini"
        @click="fullFn"
      ></el-button>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
import tool from "@/plugins/js/tool";
import LoginUser from "@designBI/views/mixins/LoginUser";

import BoardInsPropSelector from "@designBI/views/component/dealBI/BoardInsPropSelector.vue";
import BoardView from "@designBI/views/Page/PubPage/BoardView.vue";
import FullScreen from "@/plugins/js/FullScreen";

export default {
  name: "CenterMenu",
  mixins: [LoginUser],
  components: {
    BoardInsPropSelector,
    BoardView
  },
  data() {
    return {
      leftAt: "list",
      //~ 1 创建窗口
      dialogMenu: false,
      dialogMenuLoading: false,
      dialogMenuForm: {
        name: "",
        desp: "",
        boardId: "",
        rank: "40"
      },
      dialogMenuSelBoard: null,
      dialogMenuSelBoardName: "",

      folderMode: false,
      nowFolder: null,
      //nowItem: null,

      //~ 2 选择图表
      selectTargetBoardShow: false,

      //~ 3 列表
      menuItemList: [],
      menuItemListLoading: false,

      //~ 4 展示图表
      openList: [],
      nowOpenCode: "main",
      isFull: false
    };
  },
  computed: {
    //# 2 文件夹模式提示
    dialogMenuRules() {
      let me = this,
        rules = {
          name: [
            {
              required: true,
              message: `请输入图表${me.folderMode ? "文件夹" : ""}名称`,
              trigger: "blur"
            }
          ]
        };
      if (!me.folderMode) {
        tool.apply(rules, {
          boardId: [
            {
              required: true,
              message: "请选择作为图表内容的目标图表！",
              trigger: "blur"
            }
          ]
        });
      }
      return rules;
    },
    nowPIndex() {
      let me = this;
      return me.nowFolder ? me.nowFolder.index : "";
    },
    ranks() {
      return [
        {
          value: "30",
          label: "仅限团队"
        },
        {
          value: "40",
          label: "所有人(包含游客)"
        }
      ];
    },
    FullScreen() {
      return FullScreen;
    }
  },
  methods: {
    getRankStr(rank) {
      let me = this,
        theRank = me.ranks.find(r => {
          return r.value == rank;
        });
      return theRank ? theRank.label : "";
    },
    //# 1 文件夹式图表模式
    menuLogClear(done) {
      let me = this;
      tool.apply(me.dialogMenuForm, {
        name: "",
        desp: "",
        boardId: "",
        rank: "40"
      });
      me.dialogMenuSelBoard = null;
      me.dialogMenuSelBoardName = "";

      done();
    },
    boardSelFn(boardData) {
      let me = this;
      me.dialogMenuForm.boardId = boardData.templateCode;
      me.dialogMenuSelBoard = boardData;
      me.dialogMenuSelBoardName = boardData.name;

      me.selectTargetBoardShow = false;
    },
    //# 2 新建
    createMenu() {
      let me = this,
        newMenuForm = me.$refs.newMenuForm;
      newMenuForm.validate(ifPass => {
        if (ifPass) {
          let formCfg = me.dialogMenuForm,
            menuItem = tool.apply({}, formCfg, {
              //=1= 文件夹模式所需
              isFolder: me.folderMode,
              pIndex: me.nowPIndex,
              createTime: tool.now(),
              createOperId: me.loginUser.userCode,
              ownerGroup: me.pageGroupId
            });
          if (me.folderMode) {
            delete menuItem.boardId;
            delete menuItem.rank;
          } else {
            menuItem.linkCode = tool.uniqueStr();
          }
          me.dialogMenuLoading = true;
          loader
            .ajax({
              url: Vue.Api.designBI,
              data: {
                method: Vue.Api.designBI.AddNewTreeItem,
                table: "menu",
                records: JSON.stringify([menuItem])
              }
            })
            .then(function() {
              me.$message.success(
                `成功新建${me.folderMode ? "图表文件夹" : "图表"}`
              );
              me.dialogMenu = false;
              me.dialogMenuLoading = false;

              //【=2=】 然后刷新一下列表
              me.refreshMenuItemList().then(r => {
                if (!menuItem.isFolder) {
                  let rec = me.menuItemList.find(i => {
                    return i.linkCode == menuItem.linkCode;
                  });
                  if (rec) {
                    me.nodeClickFn(rec);
                  }
                }
              });
            })
            .catch(r => {
              me.$message.success(
                `新建${me.folderMode ? "图表文件夹" : "图表"}失败`
              );
              me.dialogMenuLoading = false;
            });
        }
      });
    },
    //# 3 获取列表
    refreshMenuItemList() {
      let me = this;

      return new Promise((res, rej) => {
        me.menuItemListLoading = true;
        loader
          .ajax({
            url: Vue.Api.designBI,
            method: Vue.Api.designBI.GetMenuItems,
            data: {
              groupId: me.pageGroupId
            }
          })
          .then(result => {
            me.menuItemListLoading = false;
            let recs = result.data;
            me.menuItemList = recs;
            res(result);
          })
          .catch(r => {
            me.menuItemListLoading = false;
            Vue.$message.error("获取图表列表失败……");
            rej(r);
          });
      });
    },
    //# 4 选择了一个node
    nodeClickFn(rec, nodeData, node) {
      let me = this;
      //return new Promise((res, rej) => {
      //~ 1 有子集
      if (rec.isFolder) {
        me.nowFolder = rec;
        //res(false);
      } else {
        let at = me.openList.find(op => {
          return op.linkCode == rec.linkCode;
        });
        if (!at) {
          me.openList.push(rec);
          me.nowOpenCode = rec.linkCode;
        }

        if (rec.$parent) {
          me.nowFolder = rec.$parent;
        } else {
          //~ 2 可能是根的 file选中，那么就无选中父节点了。
          me.nowFolder = null;
        }
        //~ 3 选中的 fileRec要进行DetailData获取
        // me.getDetailData(rec)
        //   .then(r => {
        //     res(r);
        //   })
        //   .catch(r => {
        //     rej(r);
        //   });
      }
      //});
    },
    //# 5 关闭一个时
    openRemoveFn(removeCode) {
      let me = this,
        at = me.openList.findIndex(op => {
          return op.linkCode == removeCode;
        });
      if (at > -1) {
        me.openList.splice(at, 1);
        me.nowOpenCode = me.openList.length
          ? me.openList[me.openList.length - 1].linkCode
          : "main";
      }
    },
    getViewNode(linkCode) {
      let me = this,
        ref = null;
      if (linkCode == "main") {
        ref = me.$refs.mainView;
      } else {
        let bRefStr = `b_${linkCode}`;
        ref = me.$refs[bRefStr];
        ref = tool.isArray(ref) ? ref[0] : ref;
      }
      return ref;
    },
    resizeView(linkCode) {
      let me = this,
        ref = me.getViewNode(linkCode);
      if (ref) {
        me.$nextTick(() => {
          ref.checkParentSize();
        });
      }
    },
    openTabClickFn(theTab) {
      // let me = this,
      //   linkCode = theTab.name;
    },
    //# 6 全屏
    fullFn() {
      let me = this;
      if (me.FullScreen.isFullScreen()) {
        me.FullScreen.exitScreen();
        me.isFull = false;
      } else {
        me.FullScreen.fullScreen();
        me.isFull = true;
      }
    },
    //# 7 打开的操作
    //~~~ 1 刷新
    openRefreshFn(menuItem) {
      let me = this,
        ref = me.getViewNode(menuItem.linkCode);
      ref.refreshData();
    },
    //~~~ 2 链接
    openShareFn(menuItem) {
      let me = this,
        h = me.$createElement,
        ref = me.getViewNode(menuItem.linkCode),
        url = ref.linkUrl,
        tempMsg = Vue.extend({
          template: `
          <div class="urlTip">
            <div class="rank">
              <span class="pre">权限：</span>
              <span class="text">{{ rankStr }}</span>
            </div>
            <div class="urlRow">
              <span class="pre">链接：</span>
              <el-input class="urlText" readonly v-model="theUrl"></el-input>
            </div>
          </div>`,
          props: {
            rankStr: String,
            theUrl: String
          }
        });
      me.$msgbox({
        type: "info",
        title: "图表分享链接",
        customClass: "urlTipMsg",
        message: h(tempMsg, {
          key: tool.uniqueStr(),
          props: {
            rankStr: me.getRankStr(ref.nowMenuItem.rank),
            theUrl: url
          }
        })
      }).catch(r => {});
    },
    //~~~ 3 设为主页
    openSetMainFn(menuItem) {
      let me = this,
        linkCode = menuItem.linkCode;
      loader
        .ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.UpdateUserMainPageCode,
            mainPageCode: linkCode
          }
        })
        .then(result => {
          me.$message.success("设置主页成功！");
          let user = result.data;
          me.$store.dispatch("loginIn", user);
        })
        .catch(r => {
          me.$message.success("设置主页时服务器出现了一些问题……");
        });
    }
  },
  watch: {
    nowOpenCode(newVal, oldVal) {
      let me = this;
      if (newVal != oldVal && newVal) {
        me.resizeView(newVal);
      }
    }
  },
  created() {
    let me = this;
    me.refreshMenuItemList();
  }
};
</script>

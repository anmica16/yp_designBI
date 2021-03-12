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
          :title="`新增${folderMode ? '图表文件夹' : '图表'}`"
          :before-close="menuLogClear"
          :visible.sync="dialogMenu"
        >
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
              <el-form-item label="目标绘板" prop="boardId">
                <el-input
                  v-model="dialogMenuSelBoardName"
                  :readonly="true"
                  placeholder="请选择目标绘板"
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
                  title="选择目标绘板"
                  :visible.sync="selectTargetBoardShow"
                >
                  <BoardInsPropSelector
                    ref="insSelector"
                    :stepRange="[1]"
                    :prePIndex="nowPIndex"
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
        <el-tab-pane label="收藏" name="likeList"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 【2】右侧图表展示 tabs -->
    <div class="rightPart">
      <el-tabs
        v-model="openMainCode"
        type="card"
        editable
        @tab-remove="openRemoveFn"
        @tab-click="openTabClickFn"
      >
        <el-tab-pane :closable="false" key="main" name="main">
          <span slot="label" class="el-icon-s-home" title="主页"> </span>
          <BoardView
            v-if="userMainPageCode"
            :theLinkCode="userMainPageCode"
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
          <span slot="label" class="hoverTab">{{ oneItem.name }}</span>
          <BoardView :theLinkCode="oneItem.linkCode"></BoardView>
        </el-tab-pane>
      </el-tabs>
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
        rank: "20"
      },
      dialogMenuSelBoard: null,
      dialogMenuSelBoardName: "",

      folderMode: false,
      nowFolder: null,
      nowItem: null,

      //~ 2 选择绘板
      selectTargetBoardShow: false,

      //~ 3 列表
      menuItemList: [],
      menuItemListLoading: false,

      //~ 4 展示图表
      openList: [],
      openMainCode: "main"
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
              message: `请输入绘板${me.folderMode ? "文件夹" : ""}名称`,
              trigger: "blur"
            }
          ]
        };
      if (!me.folderMode) {
        tool.apply(rules, {
          boardId: [
            {
              required: true,
              message: "请选择作为图表内容的目标绘板！",
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
          value: "10",
          label: "仅限团队"
        },
        {
          value: "20",
          label: "所有人(包含游客)"
        }
      ];
    }
  },
  methods: {
    //# 1 文件夹式绘板模式
    menuLogClear(done) {
      let me = this;
      tool.apply(me.dialogMenuForm, {
        name: "",
        desp: "",
        boardId: "",
        rank: "20"
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
              me.refreshMenuItemList();
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
            method: Vue.Api.designBI.GetMenuItems
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
        me.nowItem = rec;
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
      let me = this;
    },
    openTabClickFn(theTab) {
      let me = this;
    }
  },
  created() {
    let me = this;
    me.refreshMenuItemList();
  }
};
</script>

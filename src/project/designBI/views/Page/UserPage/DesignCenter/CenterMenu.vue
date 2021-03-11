<template>
  <div class="CenterMenu">
    <div class="leftPart">
      <div class="newItemArea">
        <el-link
          :underline="false"
          class="addTip"
          @click="(dialogMenu = true), (folderMode = false)"
          ><i class="icon el-icon-brush"></i><span class="text">新增图表</span>
        </el-link>

        <el-link
          :underline="false"
          class="addTip"
          @click="(dialogMenu = true), (folderMode = true)"
          ><i class="icon el-icon-s-cooperation"></i
          ><span class="text">新增文件夹</span>
        </el-link>

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
                  v-model="dialogMenuForm.boardId"
                  :readonly="true"
                  placeholder="请选择目标绘板"
                  autocomplete="off"
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
        <el-tab-pane label="目录" name="list"></el-tab-pane>
        <el-tab-pane label="收藏" name="likeList"></el-tab-pane>
      </el-tabs>
    </div>
    <div class="rightPart"></div>
  </div>
</template>

<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
import tool from "@/plugins/js/tool";
import LoginUser from "@designBI/views/mixins/LoginUser";
export default {
  name: "CenterMenu",
  mixins: [LoginUser],
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
      folderMode: false,
      nowFolder: null,

      //~ 2 选择绘板
      selectTargetBoardShow: false
    };
  },
  computed: {
    //# 2 文件夹模式提示
    dialogMenuRules() {
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

      done();
    },
    boardSelFn(boardData) {
      let me = this;
      me.dialogMenuForm.boardId = boardData.id;
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
            })
            .catch(r => {
              me.$message.success(
                `新建${me.folderMode ? "图表文件夹" : "图表"}失败`
              );
              me.dialogMenuLoading = false;
            });
        }
      });
    }
  }
};
</script>

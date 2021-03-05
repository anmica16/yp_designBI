<template>
  <div class="OneGroup">
    <div class="groupInfoArea">
      <div class="leftArea">一些信息</div>
      <div class="rightArea">
        <el-button type="success" @click="goCenterPageFn"
          >进入<span class="groupName">{{ Group.name }}</span
          >的团队中心</el-button
        >
      </div>
    </div>
    <div class="memberArea" v-loading="userListLoading">
      <div class="inviteUserArea">
        <el-button
          class="inviteBtn"
          icon="el-icon-user-solid"
          title="邀请成员"
          @click="showDialogFn"
          >添加成员</el-button
        >
        <el-dialog
          title="邀请成员"
          :visible.sync="inviteDialog"
          :append-to-body="true"
          @closed="reInitInviteDialogFn"
          :destroy-on-close="true"
        >
          <div class="rankSelect">
            <div class="rankTitle">步骤一：选择权限类型</div>
            <div class="rankeRadio">
              <el-radio-group v-model="inviteRank">
                <div class="oneRank">
                  <el-radio label="10"
                    >管理员<span class="rankDesp"
                      >创建、删除绘板|编辑绘板|管理团队成员</span
                    ></el-radio
                  >
                </div>
                <div class="oneRank">
                  <el-radio label="20"
                    >编辑者<span class="rankDesp">编辑绘板</span></el-radio
                  >
                </div>
                <div class="oneRank">
                  <el-radio label="30"
                    >查看者<span class="rankDesp">查看绘板</span></el-radio
                  >
                </div>
              </el-radio-group>
            </div>
          </div>

          <div class="userSelect">
            <div class="userTitle">步骤二：选择邀请用户</div>
            <div class="userFind">
              <el-select
                v-model="inviteUser"
                multiple
                placeholder="输入用户登录名以搜索"
                filterable
                remote
                :remote-method="inviteUserFindFn"
                :loading="inviteUserFinding"
              >
                <el-option
                  v-for="oneUser in inviteUserFinds"
                  :key="oneUser.userCode"
                  :label="oneUser.nickName || `用户${oneUser.userCode}`"
                  :value="oneUser.userCode"
                ></el-option>
              </el-select>
            </div>
          </div>

          <div class="btnArea">
            <el-button type="primary" @click="confirmInviteFn"
              >确认邀请</el-button
            >
          </div>
        </el-dialog>
      </div>

      <el-table class="memberListTable" :data="userList">
        <el-table-column width="40">
          <template slot-scope="scope">
            <span class="nameIcon">{{
              scope.row.$name[scope.row.$name.length - 1]
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="成员" width="150">
          <template slot-scope="scope">
            <div class="nameRow">
              {{ scope.row.$name }}
            </div>
            <div class="nameCodeRow">
              {{ scope.row.userCode }}
            </div>
          </template>
        </el-table-column>

        <el-table-column width="120" label="最后操作">
          <template slot-scope="scope">
            <span class="lastDate">{{ scope.row.$lastOpTime }}</span>
          </template>
        </el-table-column>

        <el-table-column width="80" label="邀请人">
          <template slot-scope="scope">
            <span class="fromUser">{{
              scope.row.$fromUserName ? scope.row.$fromUserName : "创建人"
            }}</span>
          </template>
        </el-table-column>

        <el-table-column width="80" label="权限">
          <template slot-scope="scope">
            <span class="userRank">{{
              getLoginUserRankStr(scope.row.userRank)
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
import tool from "@/plugins/js/tool";
import LoginUser from "@designBI/views/mixins/LoginUser";
export default {
  name: "OneGroup",
  mixins: [LoginUser],
  props: {
    Group: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      userList: [],
      userListLoading: false,

      //~ 2 邀请窗口
      inviteDialog: false,
      inviteRank: "20",
      //inviteUserQuery: "",
      inviteUserFinds: [],
      inviteUser: [],
      inviteUserFinding: false,
      //~ 2.2 消息
      inviteMsgSending: false
    };
  },
  computed: {
    groupId() {
      return this.Group.id;
    }
  },
  methods: {
    // 1 获取用户列表
    getGroupUserList() {
      let me = this;
      me.userListLoading = true;
      loader
        .ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.GetGroupUserList,
            groupId: me.groupId
          }
        })
        .then(result => {
          //【=1=】返回的是用户详情列表
          me.userList = result.data.map(rec => {
            rec.$name = rec.nickName || `用户${rec.userCode}`;
            rec.$fromUserName = rec.fromUser
              ? rec.fromUserName || `用户${rec.fromUser}`
              : "";

            //~~ 2 时间
            let lastT = new Date(rec.lastOpTime),
              now = new Date(),
              sameYear = lastT.getFullYear() == now.getFullYear();
            rec.$lastOpTime = tool.Date.format(
              lastT,
              sameYear ? "MM月dd日" : "yyyy年MM月dd日"
            );

            return rec;
          });

          me.userListLoading = false;
        })
        .catch(r => {
          me.userListLoading = false;
        });
    },
    // 2 进入设计中心
    goCenterPageFn() {
      let me = this;
      me.$router.push({
        name: "DesignCenter",
        params: {
          groupId: me.Group.id
        }
      });
    },
    showDialogFn() {
      let me = this;
      me.inviteDialog = true;
    },
    // 3 搜索方法
    inviteUserFindFn(query) {
      let me = this;
      if (query) {
        me.inviteUserFinding = true;
        loader
          .ajax({
            url: Vue.Api.designBI,
            data: {
              method: Vue.Api.designBI.GetInviteUserList,
              query: query
            }
          })
          .then(result => {
            let data = result.data;
            me.inviteUserFinds = data
              .filter(d => {
                return d.userCode != me.loginUserCode;
              })
              .map(d => {
                d.$name = d.nickName || `用户${d.userCode}`;
                return d;
              });
            me.inviteUserFinding = false;
          })
          .catch(r => {
            me.$message.warning("请求用户列表时服务器出现了一些错误……");
            me.inviteUserFinding = false;
          });
      }
    },
    reInitInviteDialogFn() {
      let me = this;
      me.inviteRank = "20";
      me.inviteUserFinds = [];
      me.inviteUser = [];
    },
    // 4 确认邀请
    confirmInviteFn() {
      let me = this;

      if (!me.inviteUser.length) {
        me.$message.warning("请添加至少一名邀请成员！");
        return;
      }

      me.$msgbox({
        type: "success",
        title: "确认邀请",
        showCancelButton: true,
        message: [
          "确认邀请",
          me.inviteUser.join("、"),
          "至【",
          me.Group.name,
          "】团队中吗？"
        ].join("")
      })
        .then(() => {
          //【=2=】这里就可以发“邀请”信息到所选择的用户中去了！
          me.inviteMsgSending = true;
          me.$store
            .dispatch("sendMessage", {
              type: Vue.Api.Message.inviteMember,
              message: `${me.loginUserName}邀请你加入【${
                me.Group.name
              }】团队，加入后权限：${me.getLoginUserRankStr(me.inviteRank)}`,

              targetUsers: me.inviteUser,

              fromUser: me.loginUserCode,
              fromGroup: me.Group.id,

              needReply: true,
              sendParams: {
                userRank: me.inviteRank,
                fromUserName: me.loginUserName,
                fromGroupName: me.Group.name
              }
            })
            .then(result => {
              me.$message.success("发送邀请成功！");
              me.inviteMsgSending = false;
              me.inviteDialog = false;
            })
            .catch(r => {
              me.inviteMsgSending = false;
            });
        })
        .catch(() => {});
    }
  }
  // created() {
  //   let me = this;
  //   me.getGroupUserList();
  // }
};
</script>

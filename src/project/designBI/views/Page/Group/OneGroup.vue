<template>
  <div class="OneGroup">
    <div class="groupInfoArea">
      <div class="iconArea">
        <div class="theIcon">
          <span class="icon el-icon-s-promotion"></span>
        </div>
        <div class="setDefault" v-loading="setDefaultLoading">
          <el-button
            v-if="defaultGroupId != groupId"
            icon="el-icon-thumb"
            size="mini"
            type="primary"
            @click="setDefaultFn"
            >设为默认</el-button
          >
          <span v-else>已设为默认</span>
        </div>
      </div>

      <div class="theInfo">
        <h1>{{ Group.name }}</h1>
        <div class="infoRow">
          <span class="pre">创建人：</span>
          <span class="text">{{ Group.createUser }}</span>
        </div>
        <div class="infoRow">
          <span class="pre">创建时间：</span>
          <span class="text">{{ Group.joinTime }}</span>
        </div>
        <div class="infoRow total">
          <span class="text">共{{ userList.length }}人</span>
        </div>
      </div>

      <div class="operUserArea">
        <el-dropdown trigger="click" placement="bottom-start">
          <el-link title="用户的团队设置" :underline="false">
            <i class="icon el-icon-s-tools"></i>
            <span class="text">设置</span>
          </el-link>
          <el-dropdown-menu slot="dropdown">
            <template v-if="Group.userRank == '1'">
              <el-dropdown-item @click="GroupUserCgGroupNameFn"
                >更改团队名称</el-dropdown-item
              >
              <el-dropdown-item @click="GroupUserCgOwnerFn"
                >移交团队</el-dropdown-item
              >
              <el-dropdown-item @click="GroupUserDismissFn"
                >解散团队</el-dropdown-item
              >
            </template>
            <template v-else>
              <el-dropdown-item @click="GroupUserLeaveFn"
                >退出团队</el-dropdown-item
              >
            </template>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <div class="fill"></div>

      <div class="rightArea">
        <div class="infoRow">
          <span class="pre">我的权限：</span>
          <span class="text">{{ getLoginUserRankStr(Group.userRank) }}</span>
        </div>
        <el-button type="success" @click="goCenterPageFn">
          <div class="groupName">{{ Group.name }}</div>
          <div>进入团队中心</div>
        </el-button>
      </div>
    </div>
    <div class="memberArea" v-loading="userListLoading">
      <div class="inviteUserArea">
        <div class="fill"></div>
        <el-button
          class="inviteBtn"
          v-if="canEdit"
          icon="el-icon-user-solid"
          title="邀请成员"
          type="primary"
          size="small"
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

      <div class="memberListWrap">
        <el-table
          class="memberListTable"
          :class="{ canEdit }"
          :data="pUserList"
          @row-click="memberSetStartFn"
        >
          <el-table-column label="成员">
            <template slot-scope="scope">
              <div class="memberInfo">
                <div
                  class="nameIcon"
                  :class="getTagColorClass(scope.row.userCode)"
                >
                  {{ scope.row.$name[scope.row.$name.length - 1] }}
                </div>
                <div class="nameInfo">
                  <div class="row1">
                    {{ scope.row.$name
                    }}<span
                      class="meTip"
                      v-if="scope.row.userCode == loginUserCode"
                      >我</span
                    >
                  </div>
                  <div class="row2">{{ scope.row.userCode }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="最后操作">
            <template slot-scope="scope">
              <span class="lastDate">{{ scope.row.$lastOpTime }}</span>
            </template>
          </el-table-column>

          <el-table-column width="120" label="邀请人">
            <template slot-scope="scope">
              <span class="fromUser">{{
                scope.row.$fromUserName ? scope.row.$fromUserName : "创建人"
              }}</span>
            </template>
          </el-table-column>

          <el-table-column width="120" label="权限">
            <template slot-scope="scope">
              <span class="userRank">{{
                getLoginUserRankStr(scope.row.userRank)
              }}</span>
            </template>
          </el-table-column>

          <el-table-column width="40">
            <span class="setIcon el-icon-setting"></span>
          </el-table-column>
        </el-table>

        <el-dialog
          class="userManageDialog"
          title="成员管理"
          :visible.sync="userManageShow"
          :append-to-body="true"
          @closed="userManageCloseFn"
          :destroy-on-close="true"
        >
          <div class="userManageDialogInner" v-if="userManageTarget">
            <div class="memberInfo">
              <div
                class="nameIcon"
                :class="getTagColorClass(userManageTarget.userCode)"
              >
                {{ userManageTarget.$name[userManageTarget.$name.length - 1] }}
              </div>
              <div class="nameInfo">
                <div class="row1">{{ userManageTarget.$name }}</div>
                <div class="row2">{{ userManageTarget.userCode }}</div>
              </div>
            </div>
            <div class="memberChangeArea">
              <div class="oneOption">
                <dir class="optionName">
                  <span class="icon el-icon-medal"></span>
                  <span class="text">成员权限</span>
                </dir>
                <div class="fill"></div>

                <el-select v-model="userManageTarget.userRank">
                  <template v-for="rank in userRankList">
                    <el-option
                      v-show="rank.userRank != '1'"
                      :key="rank.userRank"
                      :label="rank.userRankStr"
                      :value="rank.userRank"
                    ></el-option>
                  </template>
                </el-select>
              </div>
            </div>
            <div class="bottomArea">
              <el-link :underline="false" type="danger" @click="removeUserFn"
                >删除成员</el-link
              >
              <div class="fill"></div>
              <el-button
                size="small"
                type="primary"
                @click="userManageConfirmFn"
                >确定</el-button
              >
            </div>
          </div>
        </el-dialog>

        <Pager
          ref="pager"
          :total="userList.length"
          layout="prev, pager, next, total"
          :hide-on-single-page="false"
          :page-size="10"
        ></Pager>
      </div>
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
      inviteMsgSending: false,
      setDefaultLoading: false,

      pager: null,

      //~ 3 成员管理
      userManageShow: false,
      userManageTarget: null,
      userManageLoading: false
    };
  },
  computed: {
    groupId() {
      return this.Group.id;
    },
    pUserList() {
      let me = this;

      return me.pager ? me.userList.slice(me.pager.start, me.pager.end) : [];
    },
    canEdit() {
      let me = this;
      return parseInt(me.Group.userRank) < 20;
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
    },
    // # 5 设为默认
    setDefaultFn() {
      let me = this;

      me.setDefaultLoading = true;
      loader
        .ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.UpdateUserDefaultGroup,
            groupId: me.groupId
          }
        })
        .then(result => {
          //=1= 返回更新了group的user
          me.$message.success("设置默认成功！");
          me.$store.dispatch("loginIn", result.data);

          me.setDefaultLoading = false;
        })
        .catch(r => {
          me.$message.warning("设置默认时服务器出现了一些问题……");
          me.setDefaultLoading = false;
        });
    },
    //# 6 成员改变窗口
    memberSetStartFn(theUser) {
      let me = this;
      if (!me.canEdit || theUser.userCode == me.loginUserCode) {
        return;
      }
      me.userManageTarget = tool.clone(theUser);
      me.userManageShow = true;
    },
    userManageCloseFn() {
      let me = this;
      me.userManageTarget = null;
      me.getGroupUserList();
    },
    removeUserFn() {
      let me = this;
      me.$msgbox({
        type: "warning",
        title: "移除团队成员",
        showCancelButton: true,
        message: "确认移除该团队成员吗？"
      })
        .then(() => {
          me.userManageLoading = true;
          loader
            .ajax({
              url: Vue.Api.designBI,
              data: {
                method: Vue.Api.designBI.Delete,
                ids: JSON.stringify([me.userManageTarget.id]),
                table: "userInGroup"
              }
            })
            .then(r => {
              me.$message.success("已成功移除该成员");

              //【=2=】追加信息
              //~~~ 1 仅用户获取
              me.$store.dispatch("sendMessage", {
                type: Vue.Api.Message.groupMemberManage,
                message: `${me.loginUserName}(${me.loginUserRankStr})将你从【${me.Group.name}】团队中移出`,

                targetUsers: [me.userManageTarget.userCode],

                fromUser: me.loginUserCode,
                fromGroup: me.Group.id,

                needReply: false,
                sendParams: null
              });

              me.userManageShow = false;
              me.userManageLoading = false;
            })
            .catch(r => {
              me.$message.warning(
                "移除该成员失败，服务器出现了一些问题……" + r.msg
              );
              me.userManageLoading = false;
            });
        })
        .catch(() => {});
    },
    userManageConfirmFn() {
      let me = this;
      me.userManageLoading = true;
      loader
        .ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.AddOrUpd,
            records: JSON.stringify([me.userManageTarget]),
            table: "userInGroup"
          }
        })
        .then(r => {
          me.$message.success("已成功更新该成员团队信息！");

          //【=2=】追加信息
          //~~~ 1 仅用户获取
          me.$store.dispatch("sendMessage", {
            type: Vue.Api.Message.groupMemberManage,
            message: `${me.loginUserName}(${
              me.loginUserRankStr
            })更新了你的团队信息，当前权限为【${me.getLoginUserRankStr(
              me.userManageTarget.userRank
            )}】`,

            targetUsers: [me.userManageTarget.userCode],

            fromUser: me.loginUserCode,
            fromGroup: me.Group.id,

            needReply: false,
            sendParams: null
          });

          me.userManageShow = false;
          me.userManageLoading = false;
        })
        .catch(r => {
          me.$message.warning(
            "更新该成员团队信息失败，服务器出现了一些问题……" + r.msg
          );
          me.userManageLoading = false;
        });
    },
    //# 7 设置的 4个分支方法
    GroupUserCgGroupNameFn() {},
    GroupUserCgOwnerFn() {},
    GroupUserDismissFn() {},
    GroupUserLeaveFn() {}
  },
  mounted() {
    let me = this;
    me.pager = me.$refs.pager;
  }
};
</script>

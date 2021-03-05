<template>
  <div class="pub-msgDisplay">
    <el-table
      height="100%"
      :data="messages"
      :show-header="false"
      v-loading="operating"
      element-loading-text="操作提交中……"
      :highlight-current-row="true"
      :row-class-name="rowClassNameFn"
      @row-click="msgClickFn"
    >
      <el-table-column label="消息" width="260" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <div class="infoRow">
            <i class="newTag" v-if="scope.row.$isNew">new</i>
            <span
              class="oneTag"
              v-for="tag in scope.row.tag"
              :class="getTagClass(tag)"
              :key="tag"
              >{{ tag }}</span
            >
            <span style="margin-left: 10px">{{ scope.row.message }}</span>
          </div>

          <div class="dateRow">
            <span class="date">{{ scope.row.sendTime }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="140">
        <template slot-scope="scope">
          <div
            v-if="getOperateBarType(scope.row.typeCode) == 0"
            class="defaultOper"
          ></div>

          <div
            v-else-if="getOperateBarType(scope.row.typeCode) == 1"
            class="confirmOper"
          >
            <template v-if="scope.row.replyParams">
              <span
                >已{{ scope.row.replyParams.ifConfirm ? "接受" : "拒绝" }}</span
              >
            </template>
            <template v-else>
              <el-button
                size="mini"
                type="primary"
                @click="confirmFn(true, scope.row)"
                >接受</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="confirmFn(false, scope.row)"
                >拒绝</el-button
              >
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
import tool from "@/plugins/js/tool";
import LoginUser from "@designBI/views/mixins/LoginUser";
const typeCodeMap = {
  1: ["10"]
};
export default {
  name: "msgDisplay",
  mixins: [LoginUser],
  props: {
    messages: {
      type: Array,
      required: true
    },
    isNewFn: {
      type: Function
    }
  },
  data() {
    return {
      operating: false
    };
  },
  methods: {
    rowClassNameFn(row) {
      let me = this;
      return row.$isNew ? "isNew" : "";
    },
    getTagClass(tag) {
      let me = this,
        //准备30种颜色
        colorCount = 30,
        charCodeSum = 0;
      if (tool.isString(tag)) {
        for (let i = 0; i < tag.length; ++i) {
          charCodeSum += tag.charCodeAt(i);
        }
      }
      return `tag tag${charCodeSum % colorCount}`;
    },
    //@ 1-1 操作大分类
    getOperateBarType(typeCode) {
      let me = this,
        type = 0;
      tool.each(typeCodeMap, (_type, codes) => {
        if (codes.indexOf(typeCode) > -1) {
          type = _type;
          return false;
        }
      });
      return type;
    },
    //@ 1-2 操作小分类的各个函数
    confirmFn(ifConfirm, theMsg) {
      let me = this,
        replyContent = {
          id: theMsg.id,

          replyTime: tool.now(),
          replyParams: {
            ifConfirm
          },
          endFlag: true
        };
      //前端刷新
      tool.apply(theMsg, replyContent);
      me.$store.state.progress = 10;
      //## 1 回复消息
      loader
        .ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.AddOrUpd,
            table: "message",
            records: JSON.stringify([replyContent])
          }
        })
        .catch(r => {
          me.$message.warning(r.msg);
        })
        .finally(r => {
          me.$store.state.progress += 30;
        });

      //## 2 按照 类型来做 确认 or 拒绝的后续操作
      let afterPros = [];
      //【=1=】邀请加入，接受后加入group
      if (theMsg.typeCode == "10") {
        if (!theMsg.sendParams.userRank) {
          console.error(["该数据缺少权限！"]);
          return;
        }
        if (!ifConfirm) {
          return;
        }
        //~~~ 1 新加一个团队成员
        let newGroupUser = {
          groupId: theMsg.fromGroup,
          userCode: me.loginUserCode,
          fromUser: theMsg.fromUser,
          joinTime: tool.now(),
          userRank: theMsg.sendParams.userRank || "30",
          lastOpTime: tool.now()
        };
        let pro10 = loader.ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.AddOrUpd,
            table: "userInGroup",
            records: JSON.stringify([newGroupUser])
          }
        });
        afterPros.push(pro10);
        pro10.then(result => {
          me.$message.success(`加入成功！`);
        });
        pro10.catch(r => {
          me.$message.warning(r.msg);
        });

        //~~~ 2 新加团队成员的 团队通知
        let pro10Tip = me.$store.dispatch("sendMessage", {
          type: Vue.Api.Message.groupNewMemberNotice,
          message: `${theMsg.sendParams.fromUserName}邀请${
            me.loginUserName
          }加入了【${
            theMsg.sendParams.fromGroupName
          }】团队，权限为：${me.getLoginUserRankStr(
            theMsg.sendParams.userRank
          )}`,

          //targetUsers: me.inviteUser,
          targetGroups: [theMsg.fromGroup],

          fromUser: me.loginUserCode,
          //fromGroup: me.Group.id,

          needReply: false
          // sendParams: {
          //   userRank: me.inviteRank
          // }
        });
        afterPros.push(pro10Tip);

        //~~~ 3 刷新groups
        afterPros.push(me.$store.dispatch("getPageGroups"));
      }

      //## 3 看数量来决定进度条
      if (afterPros.length) {
        afterPros.forEach(pro => {
          pro.finally(r => {
            me.$store.state.progress += 60 / afterPros.length;
          });
        });
      } else {
        me.$store.state.progress += 60;
      }

      //## 4 然后操作完记得刷新
      me.$store.dispatch("refreshMessages");
    },
    //@ 2 点击后标识消息已读
    msgClickFn(theMsg) {
      let me = this;
      if (!theMsg.readFlag) {
        let replyContent = {
          id: theMsg.id,

          readFlag: true
        };
        //前端刷新
        tool.apply(theMsg, replyContent);

        //## 1 消息已读
        loader.ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.AddOrUpd,
            table: "message",
            records: JSON.stringify([replyContent])
          }
        });
      }
    }
  }
};
</script>

<style lang="scss">
.pub-msgDisplay {
  height: 400px;
}
</style>

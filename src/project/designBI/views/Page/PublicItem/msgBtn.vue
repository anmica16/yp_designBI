<template>
  <span class="pub-msgBtn">
    <el-popover trigger="click">
      <el-button
        size="small"
        slot="reference"
        icon="el-icon-message"
        title="消息查看"
        ><span v-show="totNewCount" class="redDot">{{
          totNewCount
        }}</span></el-button
      >
      <el-tabs type="border-card">
        <el-tab-pane>
          <span class="paneLabel" slot="label"
            >个人<span class="redDot" v-show="userNewCount">{{
              userNewCount
            }}</span></span
          >
          <msgDisplay :messages="userMsg"></msgDisplay>
        </el-tab-pane>
        <el-tab-pane v-if="pageGroupId">
          <span class="paneLabel" slot="label"
            >团队<span class="redDot" v-show="groupNewCount">{{
              groupNewCount
            }}</span></span
          >
          <msgDisplay :messages="groupMsg"></msgDisplay>
        </el-tab-pane>
      </el-tabs>
    </el-popover>
  </span>
</template>

<script>
import LoginUser from "@designBI/views/mixins/LoginUser";
import msgDisplay from "./msgDisplay";
import tool from "@/plugins/js/tool";
export default {
  name: "msgBtn",
  mixins: [LoginUser],
  components: {
    msgDisplay
  },
  computed: {
    userMsg() {
      return this.$store.getters.userMsg;
    },
    groupMsg() {
      return this.$store.getters.groupMsg;
    },
    userNewMsgs() {
      return this.userMsg.filter(msg => {
        return msg.$isNew;
      });
    },
    groupNewMsgs() {
      return this.groupMsg.filter(msg => {
        return msg.$isNew;
      });
    },
    userNewCount() {
      return this.userNewMsgs.length;
    },
    groupNewCount() {
      return this.groupNewMsgs.length;
    },
    totNewCount() {
      return this.userNewCount + this.groupNewCount;
    }
  }
};
</script>

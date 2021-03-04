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
          title="邀请新成员"
        ></el-button>
      </div>

      <el-table :data="userList">
        <el-table-column prop="userCode"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
import tool from "@/plugins/js/tool";
export default {
  name: "OneGroup",
  props: {
    Group: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      userList: [],
      userListLoading: false
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
          me.userList = result.data;

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
    }
  }
  // created() {
  //   let me = this;
  //   me.getGroupUserList();
  // }
};
</script>

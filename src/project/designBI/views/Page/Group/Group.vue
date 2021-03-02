<template>
  <div class="GroupPage">
    <div class="groupTitle">
      <span class="pageIcon">
        <i class="el-icon-s-help"></i>
      </span>
      <span class="pageName">团队设置</span>

      <el-button
        size="small"
        icon="el-icon-plus"
        type="primary"
        @click="goNewGroupPageFn"
        >创建新团队</el-button
      >

      <transition>
        <div class="newGroupPage" v-if="atNewGroupPage">
          <div class="topTip">
            <div class="back" @click="backGroupPageFn">
              <span class="el-icon-back"></span>
              <span class="text">创建团队</span>
            </div>

            <div class="centerTip">
              <div class="text">给你的团队取个名字</div>
              <div class="icon">👩‍🏫</div>
            </div>
          </div>
          <div class="bodyArea">
            <div class="formArea">
              <el-input
                v-model="newGroupName"
                placeholder="团队名称"
              ></el-input>
              <el-button type="primary" @click="createNewGroupFn"
                >创建</el-button
              >
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div class="groupBody">
      <div class="leftPart"></div>
      <div class="rightPart">
        <div class="defaultStage"></div>
        <div class="groupStage"></div>
      </div>
    </div>
  </div>
</template>

<script>
import "@designBI/assets/theme/group.scss";
import Vue from "vue";
import loader from "@/plugins/js/loader";
export default {
  name: "Group",
  data() {
    return {
      userGroups: [],
      //~~ 1 团队新建跳转
      atNewGroupPage: false,
      newGroupName: "",
      newGrouping: false
    };
  },
  computed: {
    loginUser() {
      let me = this;
      return me.$store.state.loginUser;
    },
    cUserGroups() {
      let me = this;
      return me.userGroups;
    }
  },
  methods: {
    //@ 1 切换
    goNewGroupPageFn() {
      let me = this;
      me.atNewGroupPage = true;
    },
    backGroupPageFn() {
      let me = this;
      me.atNewGroupPage = false;
      me.newGroupName = "";
    },
    //@ 2 创建团队接口调用
    createNewGroupFn() {
      let me = this,
        user = me.loginUser;
      me.newGrouping = true;
      loader
        .ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.CreateNewGroup,
            groupName: me.newGroupName
          }
        })
        .then(result => {
          //=1= 返回 这个 group和 新的更新了group的user
          me.$message.success("创建新团队成功！");
        })
        .catch(r => {
          me.$message.warning("创建团队时服务器出现了一些问题……");
        });
    }
  }
};
</script>

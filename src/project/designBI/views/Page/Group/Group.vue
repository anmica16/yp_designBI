<template>
  <div class="GroupPage">
    <div class="groupTitle">
      <span class="pageIcon">
        <i class="el-icon-connection"></i>
      </span>
      <span class="pageName">团队设置</span>

      <div class="fill"></div>

      <el-button
        class="newGroupBtn"
        size="small"
        icon="el-icon-plus"
        type="primary"
        @click="goNewGroupPageFn"
        >创建新团队</el-button
      >

      <el-dialog
        class="newGroupPage"
        :append-to-body="true"
        :visible.sync="atNewGroupPage"
        :before-close="backGroupPageFn"
        title="创建团队"
      >
        <div class="topTip">
          <div class="centerTip">
            <div class="text">给你的团队取个名字👩‍🏫</div>
          </div>
        </div>
        <div class="bodyArea">
          <div class="formArea">
            <el-form>
              <el-form-item
                :rules="{
                  required: true,
                  message: '团队名称不能为空',
                  trigger: 'blur'
                }"
              >
                <el-input
                  v-model="newGroupName"
                  placeholder="团队名称"
                ></el-input>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="createNewGroupFn"
                  >创建</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-dialog>

      <msgBtn></msgBtn>
      <userBtn class="oneItem"> </userBtn>
    </div>

    <div class="groupBody" v-loading="userGroupsLoading">
      <div class="leftPart">
        <div class="defaultTab">
          <div
            class="oneTab default"
            :class="{ active: showDefault }"
            @click="changeTab(defaultGroup, true)"
          >
            <span>默认团队：</span>
            <span>{{ defaultGroup ? defaultGroup.name : "尚无" }}</span>
          </div>
        </div>
        <div class="groupTab">
          <template v-for="oneGroup in pPageGroups">
            <div
              :key="oneGroup.id"
              class="oneTab"
              :class="{ active: !showDefault && nowGroup === oneGroup }"
              @click="changeTab(oneGroup)"
            >
              <span class="preOrder">#{{ oneGroup.$order }}</span>
              <span>{{ oneGroup.name }}</span>
            </div>
          </template>
        </div>

        <Pager
          ref="pager"
          small
          :total="pageGroups.length"
          layout="prev, pager, next"
          :hide-on-single-page="false"
          :page-size="10"
        ></Pager>
      </div>
      <div class="rightPart">
        <OneGroup ref="oneGroup" v-if="cNowGroup" :Group="cNowGroup"></OneGroup>
        <div v-else>
          请在左侧选择一个团队
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//import "@designBI/assets/theme/group.scss";
import OneGroup from "./OneGroup";
import Vue from "vue";
import loader from "@/plugins/js/loader";
import LoginUser from "@designBI/views/mixins/LoginUser";
import userBtn from "@designBI/views/Page/PublicItem/userBtn.vue";
import msgBtn from "@designBI/views/Page/PublicItem/msgBtn.vue";
export default {
  name: "Group",
  mixins: [LoginUser],
  components: {
    userBtn,
    msgBtn,
    OneGroup
  },
  data() {
    return {
      //~~ 1 团队新建跳转
      atNewGroupPage: false,
      newGroupName: "",
      newGrouping: false,
      //~~ 2 团队列表
      userGroupsLoading: false,
      //~~ 3 显示默认 ？
      showDefault: true,
      nowGroup: null,

      pager: null
    };
  },
  computed: {
    defaultGroup() {
      let me = this,
        id = me.defaultGroupId;
      if (id) {
        return me.pageGroups.find(group => {
          return group.id === id;
        });
      } else {
        return null;
      }
    },
    cNowGroup() {
      let me = this;
      return me.nowGroup || me.defaultGroup;
    },
    pPageGroups() {
      let me = this;

      return me.pager ? me.pageGroups.slice(me.pager.start, me.pager.end) : [];
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
      let me = this;
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
          //=1= 返回更新了group的user
          me.$message.success("创建新团队成功！");
          me.$store.dispatch("loginIn", result.data);

          //=2= 调用一次团队列表获取
          me.getUserGroupFn();

          me.newGrouping = false;
          //=3= 返回界面
          me.backGroupPageFn();
        })
        .catch(r => {
          me.$message.warning("创建团队时服务器出现了一些问题……");
          me.newGrouping = false;
        });
    },
    //@ 3 获取团队列表
    getUserGroupFn() {
      let me = this;
      me.userGroupsLoading = true;
      me.$store
        .dispatch("getPageGroups", me.loginUserCode)
        .then(() => {
          me.userGroupsLoading = false;
        })
        .catch(r => {
          me.$message.warning("获取团队列表时服务器出现了一些问题……");
          me.userGroupsLoading = false;
        });
    },
    changeTab(aGroup, isDefault) {
      let me = this;
      me.nowGroup = aGroup;
      if (isDefault) {
        me.showDefault = true;
      } else {
        me.showDefault = false;
      }
    }
  },
  watch: {
    cNowGroup(newVal, oldVal) {
      let me = this;
      if (newVal) {
        me.$nextTick(() => {
          //=2= 数据刷新
          me.$refs.oneGroup.getGroupUserList();
        });
      }
    }
  },
  mounted() {
    let me = this;
    //=2= 数据刷新
    if (me.$refs.oneGroup) {
      me.$refs.oneGroup.getGroupUserList();
    }
    me.pager = me.$refs.pager;
  }
};
</script>

<template>
  <div class="BoardView" v-loading="nowMenuItemLoading">
    <div v-if="isBadPage" class="badPageTip">
      <div class="msgText">{{ badMsg }}</div>

      <div v-if="pageStatus == 'groupNeedLogin'">
        <el-link @click="goLoginFn" type="primary">去登陆</el-link>

        <router-link :to="{ name: 'DesignCenter-menu' }">
          <el-link type="success">返回主页</el-link>
        </router-link>
      </div>
    </div>

    <div v-else class="BoardView-inner">
      <!-- <div class="titleArea"></div> -->

      <div class="boardArea">
        <BubbleReadOnly
          ref="bubble"
          v-if="nowBoardRoot"
          :Entity="nowBoardRoot"
          :isRoot="true"
          :nowBoard="nowBoard"
          :EditNode="me"
        ></BubbleReadOnly>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
import tool from "@/plugins/js/tool";
import DesignEdit from "../UserPage/DesignEdit/DesignEdit";

export default {
  name: "BoardView",
  extends: DesignEdit,
  props: {
    theLinkCode: String
  },
  data() {
    return {
      pageStatus: "ok",

      nowMenuItem: null,
      nowMenuItemLoading: false
    };
  },
  computed: {
    isReadonly() {
      return true;
    },
    nowLinkCode() {
      let me = this,
        params = me.$route.params,
        linkCode = params.linkCode;
      return me.theLinkCode || linkCode;
    },
    statusMap() {
      return {
        ok: {
          isBadPage: false
        },
        emptyLinkCode: {
          isBadPage: true,
          message: "未给出图表的链接码！"
        },
        invalidLinkCode: {
          isBadPage: true,
          message: "未找到所给链接码的图表！"
        },
        badServer: {
          isBadPage: true,
          message: "服务器暂时无响应，可刷新页面以重试……"
        },
        groupNeedLogin: {
          isBadPage: true,
          message:
            "该图表权限仅限其团队可见，您尚未登录，请在浏览器中登录后再尝试"
        },
        groupOnly: {
          isBadPage: true,
          message:
            "该图表权限仅限其团队可见，您未加入该图表的团队，无权限查看……"
        }
      };
    },
    isBadPage() {
      let me = this;
      return (
        me.statusMap[me.pageStatus] && me.statusMap[me.pageStatus].isBadPage
      );
    },
    badMsg() {
      let me = this;
      return me.isBadPage ? me.statusMap[me.pageStatus].message || "" : "";
    },
    //# 1 更换为先 通过linkCode 获取 menuItem信息
    nowTemplateCode() {
      let me = this,
        menuItem = me.nowMenuItem;

      //=1= 重置
      me.pageStatus = "ok";
      if (!menuItem) {
        return "";
      }
      let itemRank = menuItem.rank,
        itemGid = menuItem.ownerGroup;
      //【=1=】对item的权限进行验证，如果
      if (itemRank == 40) {
        return menuItem.boardId;
      }
      //【=2=】团队模式的验证
      let user = me.loginUser,
        userGroup = me.getPageGroup(itemGid);
      if (!user) {
        me.pageStatus = "groupNeedLogin";
        return "";
      }
      //有团队，且rank <= 设置的rank
      if (userGroup) {
        let userRank = userGroup["userRank"];
        if (userRank && userRank <= itemRank) {
          return menuItem.boardId;
        }
      } else {
        me.pageStatus = "groupOnly";
        return "";
      }

      return "";
    },
    //# 2 链接
    linkUrl() {
      let me = this,
        loc = window.location,
        finalLoc = loc.origin + loc.pathname + "#/bv/" + me.nowLinkCode;
      return me.nowLinkCode ? finalLoc : "";
    }
  },
  methods: {
    getMenuItemBase() {
      let me = this;
      return new Promise((res, rej) => {
        if (!me.nowLinkCode) {
          me.pageStatus = "emptyLinkCode";
          rej(false);
          return;
        }
        me.nowMenuItemLoading = true;
        loader
          .ajax({
            url: Vue.Api.designBI,
            data: {
              method: Vue.Api.designBI.GetMenuItems,
              linkCode: me.nowLinkCode
            }
          })
          .then(result => {
            me.nowMenuItemLoading = false;
            if (!result.data.length) {
              me.pageStatus = "invalidLinkCode";
              rej(result);
              return;
            }
            me.nowMenuItem = result.data[0];
            res(result);
          })
          .catch(r => {
            me.nowMenuItemLoading = false;
            me.pageStatus = "badServer";
            rej(r);
          });
      });
    },
    getMenuItem() {
      let me = this;
      return me.getMenuItemBase();
    },
    //# 2 大小适配
    checkParentSize() {
      let me = this;
      me.$refs.bubble.checkParentSize();
      let cellBubble = me.down("CellBubble");
      if (cellBubble) {
        cellBubble.mCheckResize();
      }
    },
    //# 3 数据刷新
    refreshData() {
      let me = this;
      me.$refs.bubble.refreshData();
    },
    //# 4 去登录页，然后会返回
    goLoginFn() {
      let me = this;

      me.$store.dispatch("goLogin", me.$route);
    }
  },
  watch: {
    nowLinkCode(newVal, oldVal) {
      let me = this;
      if (newVal != oldVal && newVal) {
        me.getMenuItem();
      }
    },
    badMsg(newVal, oldVal) {
      let me = this;
      if (newVal) {
        me.$message(newVal);
      }
    }
  },
  created() {
    let me = this;
    me.getMenuItem();
  }
};
</script>

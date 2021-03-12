<template>
  <div class="BoardView" v-loading="nowMenuItemLoading">
    <div v-if="isBadPage" class="badPageTip">{{ badMsg }}</div>

    <div v-else class="BoardView-inner">
      <!-- <div class="titleArea"></div> -->

      <div class="boardArea">
        <BubbleReadOnly
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
          isBadPage: false,
          message: "服务器暂时无响应……"
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
      return menuItem ? menuItem.boardId : "";
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
      me.getMenuItemBase();
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

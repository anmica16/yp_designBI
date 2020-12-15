<template>
  <el-popover
    ref="popover"
    placement="top-end"
    trigger="click"
    width="422"
    transition="fade22"
    popper-class="message-pop"
  >
    <el-button slot="reference" class="msgBtn">
      <span class="fa fa-info"></span>
      消息（{{ items.length }}）
      <div v-show="noSeeItems" class="count">
        {{ noSeeItems }}
      </div>
    </el-button>
    <div class="bar-wrap">
      <div class="bar-header">
        <el-input
          class="searchInput"
          v-model="search"
          placeholder="输入以筛选"
        ></el-input>
        <el-button
          v-loading="loading"
          type="primary"
          class="refreshHandle"
          @click="handleRefresh"
          >刷新</el-button
        >
        <transition name="fade-right">
          <span class="refresh-ok" v-show="handleLoading">
            <span class="fa fa-check"></span>已刷新
          </span>
        </transition>
      </div>
      <div class="message-tab-wrap">
        <el-scrollbar v-show="expand" class="message-tab-inner">
          <transition-group class="theUl" name="list22" tag="ul">
            <li
              v-for="item in filterItems"
              :key="item.$key"
              class="list22-item theLi"
            >
              <a class="clickArea" href="javascript:;" @click="clickFn(item)">
                <div class="inner">
                  <div class="icon">
                    <div v-if="seeItems.indexOf(item.$key) < 0" class="newTip">
                      new
                    </div>
                    <div v-else class="fa fa-info"></div>
                  </div>
                  <div class="msg">{{ item.AuditMessages }}</div>
                  <div class="date">{{ item.OperateDate }}</div>
                </div>
              </a>
            </li>
          </transition-group>
        </el-scrollbar>
      </div>
    </div>
    <transition name="fade-right">
      <div class="loadTip" v-show="loading">
        <span class="fa fa-sync-alt"></span>刷新中...
      </div>
    </transition>
  </el-popover>
</template>

<script>
import tool from "@/plugins/js/tool";
export default {
  name: "message-tab",
  data() {
    return {
      loading: false,
      handleLoading: false,
      handleLoading_timer: 0,
      expand: true,
      items: [],
      newItems: [],

      seeItems: [],
      //checkItems: [],
      timer_refresh: 0,
      autoRefresh: true,

      //【12-1】新增需求
      search: ""
    };
  },
  computed: {
    userinfo() {
      return window.Ywp.GetUserInfo();
    },
    noSeeItems() {
      let me = this,
        count = 0,
        Yw = window.Yw;
      Yw.each(me.items, function(item) {
        if (me.seeItems.indexOf(item.$key) < 0) {
          ++count;
        }
      });
      return count;
    },
    itemMap() {
      let me = this,
        map = {},
        Yw = window.Yw;
      Yw.each(me.items, function(item) {
        map[item.$key] = item;
      });
      return map;
    },
    filterItems() {
      let me = this,
        items = me.items.filter(a => {
          return !me.search || a.AuditMessages.includes(me.search);
        });

      return items;
    }
  },
  methods: {
    // seeMapFn() {
    //   let me = this,
    //     Yw = window.Yw;
    //   console.log(["执行see"]);
    //   setTimeout(() => {
    //     Yw.each(me.items, function(item) {
    //       if (me.seeItems.indexOf(item.$key) < 0) {
    //         me.seeItems.push(item.$key);
    //       }
    //     });
    //   }, 0);
    // },
    deleteItem(item) {
      let me = this,
        at = me.items.findIndex(a => {
          return a.$key === item.$key;
        });
      if (at > -1) {
        me.items.splice(at, 1);
      }
    },
    clickFn(item) {
      let me = this,
        Yw = window.Yw,
        Ywp = window.Ywp,
        mainCmp = Ywp.down("queryFlag", "vm_main"),
        card = {
          xtype: "plugins.BaseAccraditation.WindowCard",
          ModuleId: item.moduleid,
          idValue: item.keyvalue,
          stepcode: item.stepcode,
          text: item.modulename + "【" + item.keyvalue + "】",
          canAudit: true,
          listeners: {
            "audit": function() {
              console.log(["【1214】审核任一操作后要求删除", arguments]);
              //【1214】要求删除
              me.deleteItem(item);
            },
          }
        };

      if (card.stepcode == "0") {
        me.$msgbox({
          type: "info",
          title: item.modulename + "【" + item.moduleid + "】",
          message: item.AuditMessages
        });
      }
      //item.messid = 2;
      else if (item.messid == 1) {
        Yw.require(["plugins.BaseAccraditation.WindowCard"]);
        card.xtype = "plugins.BaseAccraditation.WindowCard.SimpleCard";
        //窗口打开
        Yw.create({
          xtype: "window",
          width: 500,
          height: 350,
          queryFlag: "BAWindow",
          title: item.modulename + "【" + item.keyvalue + "】",
          items: [card]
        });
      } else if (item.messid == 2) {
        tool.apply(card.listeners,  {
          afterRender: function(holder) {
            let processBox = holder.down("WindowCard.processBox"),
              removeItems = [],
              applyBtn = processBox.bbar.down("name", "stepApplyText");
            tool.each(processBox.bbar.items, item => {
              if (applyBtn !== item) {
                removeItems.push(item);
              }
            });
            tool.each(removeItems, item => {
              processBox.bbar.remove(item);
            });

            applyBtn.setText("确认");
            applyBtn.handler = function() {
              //表示已查看
              Ywp.request({
                url: Ywp.Api.Module,
                mask: true,
                params: {
                  method: Ywp.Api.Module.SeeOneAuditMsg,
                  ModuleId: item.moduleid,
                  idValue: item.keyvalue,
                  userid: me.userinfo.UserId
                },
                success(result) {
                  Ywp.Msg.success("成功", result.msg || "确认成功");
                  applyBtn.disable();
                }
              });
            };
          }
        });

        mainCmp.activeCard(null, card);
      } else {
        mainCmp.activeCard(null, card);
      }
      //【表示已经看过】
      if (me.seeItems.indexOf(item.$key) < 0) {
        me.SeeOver(item);
      }
    },
    SeeOver(item) {
      let me = this,
        Ywp = window.Ywp;
      me.seeItems.push(item.$key);
      //console.log(["奇怪，怎么没运行？"]);
      Ywp.request({
        url: Ywp.Api.Module,
        params: {
          userid: me.userinfo.UserId,
          method: Ywp.Api.Module.SeeOveOneMsg,
          record: JSON.stringify(item)
        }
        // OnSuccess(result) {

        // },
      });
    },
    mouseOverFn() {
      this.autoRefresh = false;
    },
    mouseLeaveFn() {
      this.autoRefresh = true;
    },
    loopRefresh() {
      let me = this,
        callback = () => {
          me.timer_refresh = setTimeout(() => {
            me.loopRefresh();
          }, 20000);
        };
      if (!me.autoRefresh) {
        callback();
      } else {
        //重复刷新
        me.refresh(callback);
      }
    },
    handleRefresh() {
      let me = this;
      me.handleLoading = true;
      me.refresh(() => {
        if (me.handleLoading_timer) {
          clearTimeout(me.handleLoading_timer);
        }
        me.handleLoading_timer = setTimeout(() => {
          me.handleLoading = false;
        }, 1000);
      });
    },
    refresh(callback) {
      let Ywp = window.Ywp,
        me = this;
      me.loading = true;
      Ywp.request({
        url: Ywp.Api.Module,
        params: {
          userid: me.userinfo.UserId,
          method: Ywp.Api.Module.GetAuditMsgTab
        },
        OnSuccess(result) {
          //console.log(["成功", arguments]);
          let Yw = window.Yw,
            newItems = [],
            theItems = result.data;
          Yw.each(theItems, function(item) {
            item.$key = [
              item.keyvalue,
              item.stepcode,
              item.menuid,
              item.messid,
              item.UserId,
              item.AuditMessages
            ].join(";");
            if (!me.itemMap[item.$key]) {
              newItems.push(item);
            }
          });
          me.newItems = newItems;
          //# 3 新消息加入，旧消息当前不删
          me.items = me.newItems.concat(me.items); //theItems;
          if (me.newItems.length) {
            me.$message({
              type: "success",
              showClose: true,
              //iconClass: "el-icon-info",
              //duration: 2000,
              customClass: "rightTopMsg",
              message: "您有" + me.newItems.length + "条新消息"
            });
          }
        },
        OnFail() {
          //console.log(["失败", arguments]);
        },
        OnError() {},
        OnComplete() {
          me.loading = false;
          if (tool.isFunction(callback)) {
            callback();
          }
        }
      });
    }
  },
  created() {
    let me = this;
    console.log(["开始轮询消息"]);
    me.loopRefresh();
  }
  // mounted() {
  //   let me = this,
  //     popover = me.$refs.popover;
  //   popover.doShow();
  // }
};
</script>

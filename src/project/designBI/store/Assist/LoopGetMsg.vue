<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
import tool from "@/plugins/js/tool";
export default {
  name: "LoopGetMsg",
  props: {
    theStore: {
      type: Object,
      required: true
    },
    interval: {
      type: Number,
      default: 20000
    }
  },
  data() {
    return {
      timer: 0,
      getMsgLoading: false,
      result: null
    };
  },
  computed: {
    userCode() {
      return this.theStore.getters.loginUserCode;
    },
    groupId() {
      return this.theStore.state.pageGroupId;
    },
    userMsg() {
      let me = this;
      return me.result
        ? me.result.data.userMsg.map(rec => {
            rec = me.parseRec(rec);
            rec.$isNew = !rec.readFlag;
            return rec;
          })
        : [];
    },
    groupMsg() {
      let me = this;
      return me.result
        ? me.result.data.groupMsg.map(rec => {
            rec = me.parseRec(rec);
            rec.$isNew = me.groupIsNewFn(rec);
            return rec;
          })
        : [];
    }
  },
  methods: {
    //~ 1 发送时间小于1天的为new
    groupIsNewFn(theMsg) {
      let me = this,
        sendTimeDate = new Date(theMsg.sendTime),
        nowDate = new Date(),
        reg = /(\d+)天/,
        diff = tool.Date.GetDateDiff(sendTimeDate, nowDate),
        matchs = reg.exec(diff),
        isNew = false;
      if (matchs) {
        let dayCount = parseInt(matchs[1]);
        if (dayCount <= 3) {
          isNew = true;
        }
      } else {
        isNew = true;
      }

      return isNew;
    },
    parseRec(rec) {
      tool.each(rec, (key, val) => {
        if (tool.isString(val) && /^[{|[]/.test(val)) {
          rec[key] = JSON.parse(val);
        }
      });
      return rec;
    },
    getMsgFn() {
      let me = this;
      if (!me.userCode) {
        return;
      }
      me.getMsgLoading = true;
      loader
        .ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.GetMessages,
            userCode: me.userCode,
            groupId: me.groupId
          }
        })
        .then(result => {
          me.result = result;
          me.getMsgLoading = false;
        })
        .catch(r => {
          me.getMsgLoading = false;
        });
    },
    start() {
      let me = this,
        loopFn = () => {
          try {
            me.getMsgFn();
          } catch (e) {
            console.error(["LoopGetMsg获取数据出现错误！", e]);
          }
        };
      me.stop();
      loopFn();
      me.timer = setInterval(loopFn, me.interval);
    },
    stop() {
      let me = this;
      if (me.timer) {
        clearInterval(me.timer);
      }
    },
    refresh() {
      let me = this;
      me.start();
    }
  },
  watch: {
    groupId(newVal, oldVal) {
      let me = this;
      if (newVal && newVal != oldVal) {
        me.refresh();
      }
    }
  },
  created() {
    let me = this;
    me.start();
  },
  beforeDestroy() {
    let me = this;
    me.stop();
  }
};
</script>

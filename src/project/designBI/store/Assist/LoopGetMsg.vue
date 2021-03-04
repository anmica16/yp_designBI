<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
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
      return this.theStore.state.loginUserCode;
    },
    userMsg() {
      let me = this;
      return me.result ? me.result.data.userMsg : [];
    },
    groupMsg() {
      let me = this;
      return me.result ? me.result.data.groupMsg : [];
    }
  },
  methods: {
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
      let me = this;
      me.stop();
      me.timer = setInterval(() => {
        try {
          me.getMsgFn();
        } catch (e) {
          console.error(["LoopGetMsg获取数据出现错误！", e]);
        }
      }, me.interval);
    },
    stop() {
      let me = this;
      if (me.timer) {
        clearInterval(me.timer);
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

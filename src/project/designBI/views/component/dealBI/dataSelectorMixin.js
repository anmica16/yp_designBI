import $ from "@/plugins/js/loader";
import Vue from "vue";
import { theStore } from "@designBI/store";
export default {
  props: {
    isLoadByHand: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      records: [],
      //【update】文件夹选择提示
      nowFolderRec: null,
      nowFileRec: null,
      DetailDataAjax: null,
      DetailData: null,
      DetailDataLoading: false,

      confirmLoading: false
    };
  },
  methods: {
    //~ 1 树数据 获取 简单替换
    refreshRecords() {
      let me = this;
      return new Promise((res, rej) => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.GetDataMenus,
          data: {
            groupId: me.pageGroupId
          }
        })
          .then(result => {
            let recs = result.data;
            me.records = recs;
            res(result);
          })
          .catch(r => {
            Vue.$message.error("获取数据集菜单失败");
            rej(r);
          });
      });
    },
    //~ 2 点击演算
    nodeClickFn(rec, nodeData, node) {
      let me = this;
      return new Promise((res, rej) => {
        //~ 1 有子集
        if (rec.isFolder) {
          me.nowFolderRec = rec;
          res(false);
        } else {
          me.nowFileRec = rec;
          if (rec.$parent) {
            me.nowFolderRec = rec.$parent;
          } else {
            //~ 2 可能是根的 file选中，那么就无选中父节点了。
            me.nowFolderRec = null;
          }
          //~ 3 选中的 fileRec要进行DetailData获取
          me.getDetailData(rec)
            .then(r => {
              res(r);
            })
            .catch(r => {
              rej(r);
            });
        }
      });
    },
    //~ 3 获取详细数据
    getDetailData(rec) {
      let me = this,
        theId = rec.id;
      if (me.DetailDataAjax) {
        me.DetailDataAjax.abort();
      }
      me.DetailDataLoading = true;
      return new Promise((res, rej) => {
        me.DetailDataAjax = $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.GetLinkDetailData,
          data: {
            id: theId
          }
        });
        me.DetailDataAjax.then(result => {
          let data = result.data;
          if (!data) {
            console.log(["获取到 GetLinkDetailData", result, me]);
            //# 1 数据不存在！页面不允许访问！
            let info = {
              title: "错误提示",
              message: "选中数据集所获取到的数据为空！",
              type: "warning"
            };
            me.$msgbox(info);
            // rej(info);
            // return;
          }
          //# 2 center选中的 都应是完整确立的数据！
          me.DetailData = data;
          me.DetailDataLoading = false;

          res(data);
        }).catch(r => {
          if (r && r.statusText === "abort") {
            res(false);
          } else {
            let info = {
              title: "错误提示",
              message: "从服务器获取数据集数据失败",
              type: "error"
            };
            me.DetailDataLoading = false;
            me.$msgbox(info);
            rej(info);
          }
        });
      });
    }
  },
  created() {
    let me = this;
    if (!me.$store) {
      me.$store = theStore;
    }
    //console.log(["奇怪，加载呢？"]);
    if (!me.isLoadByHand) {
      let n = 0;
      let t = setInterval(() => {
        if (me.pageGroupId) {
          me.refreshRecords();
          clearInterval(t);
        } else {
          ++n;
          if (n >= 10) {
            clearInterval(t);
          }
        }
      }, 200);
    }
  }
};

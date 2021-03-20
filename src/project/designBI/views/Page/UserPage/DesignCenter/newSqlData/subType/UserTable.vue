<template>
  <div class="newUserTable">
    <div class="dbTableSelectArea" v-show="sqlSource">
      <div class="dbSelect">
        <span>步骤1：选择数据库</span>
        <el-select
          v-model="dataBaseName"
          filterable
          remote
          :clearable="true"
          :loading="dbListLoading"
          :remote-method="getDBList"
          @visible-change="getDBListReFn"
        >
          <el-option
            v-for="db in dbList"
            :key="db.name"
            :label="db.name"
            :value="db.name"
            >{{ db.name }}</el-option
          >
        </el-select>
      </div>

      <div class="tableSelect" v-show="dataBaseName">
        <span>步骤2：选择表</span>
        <el-select
          v-model="selTableName"
          filterable
          remote
          :clearable="true"
          :loading="tbLoading"
          :remote-method="getDBTableList"
          @visible-change="getDBTableListReFn"
        >
          <el-option
            v-for="tb in tbList"
            :key="tb.name"
            :label="tb.name"
            :value="tb.name"
            >{{ tb.name }}</el-option
          >
        </el-select>
      </div>
    </div>
    <div class="tableDataArea" v-show="selTableName">
      <div class="dimensionArea">
        <div>步骤3：选择表维度</div>
        <Scrollbar v-loading="dimLoading">
          <el-tree
            class="dimTree"
            :data="tableDims"
            :check-on-click-node="true"
            show-checkbox
            node-key="name"
            @check="dimCheckFn"
          >
            <span class="dimOption" slot-scope="{ data }">
              <span class="theText">{{ data.name }}</span>
              <span class="midText">名：</span>
              <el-input
                @click.native.stop
                class="nameText"
                size="mini"
                @change="dimChangeName(data)"
                v-model="data.chineseName"
              ></el-input>
            </span>
          </el-tree>
        </Scrollbar>
      </div>
      <div class="dataTableArea">
        <div>步骤4：确认表数据</div>
        <DimTable
          ref="table"
          v-loading="tbDTLoading"
          :data="tableData"
          :dimension="dimension"
        ></DimTable>
      </div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import $ from "@/plugins/js/loader";
import { lastLoader } from "@/plugins/js/loader";
import Vue from "vue";
import LoginUser from "@designBI/views/mixins/LoginUser";
export default {
  name: "newUserTable",
  mixins: [LoginUser],
  props: {
    PageNode: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    sqlSource: {
      type: Object,
      required: true
    },
    canSubmit: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      //~~ 2 所选 数据库 表
      dataBaseName: "",
      selTableName: "",
      //~~ 3 字段候选
      tableDims: [],
      //~~ 4 选择维度
      dimension: [],
      //~~ 5【展示用】 表与字段结合 ajax的 数据
      tableData: [],

      //~~ 1 候选 数据库s
      dbListLoading: false,
      dbListAjax: null,
      dbList: [],
      //~~ 2 候选 表s
      tbLoading: false,
      tbListAjax: null,
      tbList: [],
      //~~ 3 候选 字段
      dimLoading: false,
      dimAjax: null,
      //~~ 4 table 读取
      tbDTLoading: false,
      tbDTAjax: null
    };
  },

  computed: {
    orderProps() {
      return [
        "sqlSource",
        "dataBaseName",
        "selTableName",
        "tableDims",
        "dimension",
        "tableData"
      ];
    }
  },
  methods: {
    //@#@ 1 为空 时的后续属性操作
    emptyClear(propName) {
      let me = this,
        props = me.orderProps,
        at = props.indexOf(propName);
      for (let i = at + 1; i < props.length; ++i) {
        let key = props[i];

        if (tool.isArray(me[key])) {
          me[key] = [];
        } else {
          me[key] = "";
        }
      }
    },
    //^^ 2-1 获取数据源下的数据库列表，前100个
    getDBList(queryStr) {
      let me = this;
      me.dbListLoading = true;
      if (!me.dbListAjax) {
        me.dbListAjax = new lastLoader({
          then(r) {
            let ls = r.data;
            me.dbList = ls;
            me.dbListLoading = false;
          },
          catch(r) {
            me.$message.error("获取数据库列表失败！" + r.msg);
            me.dbListLoading = false;
          }
        });
      }
      me.dbListAjax.ajax = {
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBList,
        data: {
          serverName: me.sqlSource.name,
          query: queryStr
        }
      };
      me.dbListAjax.load();
    },
    getDBListReFn(ifShow) {
      let me = this;
      if (!ifShow) {
        me.getDBList(me.dataBaseName);
      }
    },
    //^^ 2-2 获取数据源数据库下的表列表，前100个
    getDBTableList(queryStr) {
      let me = this;
      me.tbLoading = true;
      if (!me.tbListAjax) {
        me.tbListAjax = new lastLoader({
          then(r) {
            let ls = r.data;
            me.tbList = ls;
            me.tbLoading = false;
          },
          catch(r) {
            me.$message.error("获取数据库下表列表失败！" + r.msg);
            me.tbLoading = false;
          }
        });
      }
      me.tbListAjax.ajax = {
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBTableList,
        data: {
          serverName: me.sqlSource.name,
          dbName: me.dataBaseName,
          query: queryStr,
          groupId: me.pageGroupId
        }
      };
      me.tbListAjax.load();
    },
    getDBTableListReFn(ifShow) {
      let me = this;
      if (!ifShow) {
        me.getDBTableList(me.selTableName);
      }
    },
    //^^ 2-3 获取表下 列配置列表，所有
    getTBDimList() {
      let me = this;
      me.dimLoading = true;

      if (!me.dimAjax) {
        me.dimAjax = new lastLoader({
          then(r) {
            let ls = r.data;
            me.tableDims = ls.map(d => {
              d.$id = tool.uniqueStr();
              return d;
            });
            me.dimLoading = false;
          },
          catch(r) {
            me.$message.error("获取表列配置失败！" + r.msg);
            me.dimLoading = false;
          }
        });
      }
      me.dimAjax.ajax = {
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBTableDimList,
        data: {
          serverName: me.sqlSource.name,
          dbName: me.dataBaseName,
          tableName: me.selTableName,
          groupId: me.pageGroupId
        }
      };
      me.dimAjax.load();
    },
    dimChangeName(data) {
      let me = this,
        tDim = me.dimension.find(d => {
          return d.$id === data.$id;
        }),
        tableDim = me.tableDims.find(d => {
          return d.$id === data.$id;
        });
      me.$set(tDim, "chineseName", tableDim["chineseName"]);
    },
    //@#@ 3 选择了一个
    dimCheckFn(cNode, checkInfo) {
      let me = this,
        result = [],
        checkNodes = checkInfo.checkedNodes;
      checkNodes.forEach(n => {
        let t = `t${me.dataId}`,
          dim = {
            $id: n.$id,
            key: n.name,
            chineseName: n.chineseName,
            dataId: me.id,
            type: n.type,
            tTable: t,
            tName: `${n.name}_${t}`,

            //++ 1 转换类型，某些特殊类型
            originType: n.originType
          };
        result.push(dim);
      });
      me.dimension = result;
      me.$nextTick(() => {
        me.$refs.table.doLayout();
      });
      //# 2 维度选择后，进行数据刷新
      if (!result.length) {
        me.tableData = [];
      } else {
        me.getResultTableData();
      }
    },
    //^^ 4 获取维度决定后的 表数据
    getResultTableData() {
      let me = this;
      me.tbDTLoading = true;

      if (!me.tbDTAjax) {
        me.tbDTAjax = new lastLoader({
          then(r) {
            let ls = r.data;
            me.tableData = ls;
            me.tbDTLoading = false;
          },
          catch(r) {
            me.$message.error("获取表列配置失败！" + r.msg);
            me.tbDTLoading = false;
          }
        });
      }
      me.tbDTAjax.ajax = {
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBTableData,
        data: {
          serverName: me.sqlSource.name,
          dbName: me.dataBaseName,
          tableName: me.selTableName,
          dimension: JSON.stringify(me.dimension),
          groupId: me.pageGroupId
        }
      };
      me.tbDTAjax.load();
    },
    //^^ 5-2 v2的 新建，后端处理index，然后变为一次性
    submitFnBase(recordCfg) {
      let me = this;
      recordCfg = recordCfg || {};

      if (!me.name) {
        me.$message.warning("请命名所需提交的数据！（界面左上角）");
        return;
      }

      let editTime = tool.now(true),
        record = tool.apply(
          {
            pIndex: me.PageNode.pIndex,
            isFolder: false,
            exist: true,
            ownerGroup: me.pageGroupId,

            name: me.name,
            //## 1 name！
            tableName: me.selTableName,
            //dataSource: me.getStrDateAoa(me.sheet, true),
            sourceName: me.sqlSource && me.sqlSource.name,
            dataBaseName: me.dataBaseName,

            editTime,
            editOperId: me.loginUser.userCode
          },
          recordCfg
        );
      me.$store.state.progress = 10;
      //【=1=】首先创建，获取id，然后再执行
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.AddNewTreeItem,
        data: {
          table: "data",
          records: JSON.stringify([record]),
          groupId: me.pageGroupId
        }
      })
        .then(result => {
          me.$store.state.progress = 50;
          let theId = result.other;
          tool.apply(record, {
            id: theId
          });

          //【=2=】两种模式处理
          //【update】待处理
          if (me.isEdit) {
            //tool.apply(record, {});
          } else {
            //固定了 的 第一次数据 不可轻易变动
            tool.apply(record, {
              createTime: editTime,
              createOperId: me.loginUser.userCode,

              dataType: me.PageNode.dataType,
              //~~ 1 暂时不改
              //## 2 维度！
              dimension: me.dimension.map(d => {
                d.dataId = theId;
                d.tTable = `t${d.dataId}`;
                d.tName = `${d.key}_t${d.dataId}`;
                return d;
              })
            });
          }

          //【=3=】 保存上传！
          $.ajax({
            url: Vue.Api.designBI,
            method: Vue.Api.designBI.AddOrUpd,
            data: {
              table: "data",
              records: JSON.stringify([record]),
              groupId: me.pageGroupId
            }
          })
            .then(result => {
              me.$message.success("保存成功！");
              //# 2 返回
              me.PageNode.backPage(record);
              me.$store.state.progress = 100;
            })
            .catch(r => {
              me.$message.error("保存失败！" + r);
              me.$store.state.progress = 100;
            });
          console.log(["尝试提交", me, record]);
        })
        .catch(r => {
          me.$message.error(r.msg || "提交保存时服务器出了一些问题……");
          me.$store.state.progress = 100;
        });
    },
    submitFn() {
      let me = this;
      me.submitFnBase();
    }
  },
  watch: {
    sqlSource(newVal, oldVal) {
      let me = this;
      if (newVal !== oldVal) {
        this.emptyClear("sqlSource");
        newVal && me.getDBList();
      }
    },
    dataBaseName(newVal, oldVal) {
      let me = this;
      if (newVal !== oldVal) {
        this.emptyClear("dataBaseName");
        newVal && me.getDBTableList();
      }
    },
    selTableName(newVal, oldVal) {
      let me = this;
      if (newVal !== oldVal) {
        this.emptyClear("selTableName");
        newVal && me.getTBDimList();
      }
      //#2 name的 变化
      if (!newVal && oldVal) {
        //~ 1 变空了！
        me.$emit("update:name", "");
      } else if (newVal && !oldVal) {
        //~ 2 选择了新的
        me.$emit("update:name", newVal);
      }
    },
    dimension(newVal) {
      let me = this;
      if (newVal && newVal.length) {
        me.$emit("update:canSubmit", true);
      } else {
        me.$emit("update:canSubmit", false);
      }
    }
  },
  mounted() {
    let me = this;
    me.getDBList();
  }
};
</script>

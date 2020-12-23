<template>
  <div class="DesignCenter">
    <div class="topH">
      <div class="centerHeadWrap">
        <div class="leftIcon">
          <i class="el-icon-s-promotion"></i>
        </div>
        <div class="app-title">
          <h1 class="app-title-text">朗速BI商业设计</h1>
        </div>
        <dir class="rightItems">
          <div class="oneItem star">
            <i class="el-icon-star-off"></i>
          </div>
          <div class="oneItem user">
            <el-link :underline="false"
              ><i class="el-icon-user-solid"></i
              ><span class="text">{{ $route.params.id || "用户" }}</span
              ><i class="el-icon-arrow-down"></i
            ></el-link>
          </div>
        </dir>
      </div>
    </div>
    <div class="theBody">
      <el-tabs
        :value="nowMain"
        class="centerBody"
        tab-position="left"
        @tab-click="tabChangeFn"
      >
        <el-tab-pane name="DesignCenter">
          <div slot="label" class="item">
            <div class="boardsList">
              <div class="icon"><i class="el-icon-data-line"></i></div>
              <div class="text">绘板</div>
            </div>
          </div>

          <div class="BoardsList-inner">
            <div class="topArea">
              <div class="leftPart">
                <!-- 新增用 -->
                <AttachBoard :isAdd="true"></AttachBoard>
              </div>
              <div class="rightPart"></div>
            </div>
            <div class="bodyArea">
              <el-table
                height="100%"
                :data="boardDatasPager"
                @row-click="rowClickFn"
              >
                <el-table-column type="selection" width="50">
                  <template #header>
                    <div>全选</div>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column prop="desp" label="备注"></el-table-column>
                <el-table-column>
                  <template #default="scope">
                    <el-link @click.stop="deleteBoard(scope)">删除</el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="editTime"
                  label="最后修改时间"
                ></el-table-column>
              </el-table>
              <Pager
                ref="pager"
                :total="boardDatas.length"
                :page-size="10"
              ></Pager>
            </div>
          </div>
          <!-- <template v-for="board in boards">
            <AttachBoard :key="board.templateMap" :Entity="board"></AttachBoard>
          </template> -->
        </el-tab-pane>
        <el-tab-pane name="DesignCenter-menu">
          <div slot="label" class="item">
            <div class="menu">
              <div class="icon"><i class="el-icon-s-unfold"></i></div>
              <div class="text">目录</div>
            </div>
          </div>
          <router-view name="menu"></router-view>
        </el-tab-pane>
        <el-tab-pane name="DesignCenter-data">
          <div slot="label" class="item">
            <div class="data">
              <div class="icon"><i class="el-icon-s-data"></i></div>
              <div class="text">数据预备</div>
            </div>
          </div>
          <router-view name="data"></router-view>
        </el-tab-pane>
      </el-tabs>
      <!-- 
      <div class="boardArea"></div> -->
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import AttachBoard from "./AttachBoard";
export default {
  name: "DesignCenter",
  components: {
    AttachBoard
  },
  data() {
    return {
      windowMap: {},
      nowMain: "board"
    };
  },
  computed: {
    boards() {
      let me = this,
        list = [],
        map = this.$store.state.templateMap;
      tool.each(map, (key, val) => {
        list.push(val.board);
      });
      return list;
    },
    boardDatas() {
      let me = this,
        boards = me.boards,
        list = [];
      boards.forEach(item => {
        list.push(item.parser.recordData);
      });

      return list;
    },
    boardDatasPager() {
      let me = this,
        datas = me.boardDatas,
        pager = me.$refs.pager;
      if (pager) {
        return datas.slice(pager.start, pager.end);
      } else {
        return datas;
      }
    },
    editLocBase() {
      let me = this,
        loc = window.location,
        editLoc = loc.pathname + "#/user/" + me.$route.params.id + "/edit/";
      return editLoc;
    }
  },
  methods: {
    rowClickFn(row) {
      let me = this,
        map = me.windowMap,
        tempCode = row.templateCode;
      //【update】以后注意 session
      if (!map[tempCode] || !map[tempCode].window.location.pathname) {
        let toLoc = me.editLocBase + tempCode,
          newWin = window.open(toLoc);
        map[tempCode] = newWin;
      } else {
        map[tempCode].window.location.reload();
      }
    },
    deleteBoard(scope) {
      let me = this;
      me.$msgbox({
        type: "warning",
        title: "确认",
        message: "真的要删除该绘板吗？",
        showCancelButton: true
      })
        .then(() => {
          console.log(["删除时的确认", scope, scope.row]);
          let board = me.$store.getters.getBoard(scope.row.templateCode);
          board.delete();
        })
        .catch(() => {});
    },
    tabChangeFn(pane, e) {
      let me = this,
        route = me.$route,
        router = me.$router,
        toName = pane.name;
      if (route.name !== toName) {
        router.push({ name: toName });
      }
    }
  },
  created() {
    let me = this,
      reg = new RegExp("^(DesignCenter-[^-]+)(-.*)?"),
      name = me.$route.name,
      result = reg.exec(name);
    if (result) {
      me.nowMain = result[1];
    }
  }
};
</script>

<style></style>

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
              ><i class="el-icon-user-solid"></i><span class="text">{{ $route.params.id || "用户" }}</span><i class="el-icon-arrow-down"></i
            ></el-link>
          </div>
        </dir>
      </div>
    </div>
    <div class="theBody">
      <el-tabs class="centerBody" tab-position="left">
        <el-tab-pane>
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
              <el-table :data="boardDatas">
                <el-table-column type="selection" width="50">
                  <template #header>
                    <div>全选</div>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column prop="desp" label="备注"></el-table-column>
                <el-table-column>
                  <template #default="scope">
                    <div>
                      {{ scope.$index }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="editTime"
                  label="最后修改时间"
                ></el-table-column>
              </el-table>
              <el-pagination
                :total="boardDatas.length"
                :page-size="10"
              ></el-pagination>
            </div>
          </div>
          <!-- <template v-for="board in boards">
            <AttachBoard :key="board.templateMap" :Entity="board"></AttachBoard>
          </template> -->
        </el-tab-pane>
        <el-tab-pane>
          <div slot="label" class="item">
            <div class="menu">
              <div class="icon"><i class="el-icon-s-unfold"></i></div>
              <div class="text">目录</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane>
          <div slot="label" class="item">
            <div class="data">
              <div class="icon"><i class="el-icon-s-data"></i></div>
              <div class="text">数据预备</div>
            </div>
          </div>
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
    AttachBoard,
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
      boards.forEach((item) => {
        list.push(item.parser.recordData);
      });

      return list;
    },
  },
};
</script>

<style></style>

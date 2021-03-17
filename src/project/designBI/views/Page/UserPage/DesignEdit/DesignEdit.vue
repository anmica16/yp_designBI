<template>
  <div class="DesignEdit" style="width: 100%; height: 100%">
    <div v-if="!nowBoard">
      正在努力搜索和加载该绘板！若等待过久可<router-link
        :to="{ name: 'DesignCenter' }"
        >返回主界面</router-link
      >
    </div>
    <template v-else>
      <RectLayoutV2 ref="rect" wWidth="60px" nHeight="36px">
        <!-- 【3】上部 标题 工具栏 -->
        <div slot="n" class="EditHeader">
          <div class="leftPart">
            <!-- ~ 1 绘板名 -->
            <div class="item templateTitle" :title="nowBoard.recordData.name">
              <i class="el-icon-edit"></i>
              <span class="text">{{ limitName }}</span>
            </div>

            <!-- ~ 2 导出 撤销、还原 预留 -->
            <!-- <el-popover
              class="popover"
              @show="headPopShow"
              placement="bottom-start"
              trigger="hover"
            >
              <div slot="reference" class="item">
                <i class="el-icon-document-add"></i>
                <span class="text">导出</span>
              </div>
              <div class="outType">
                <div class="option">
                  <i class="el-icon-date"></i>
                  <span class="text">导出Excel</span>
                </div>
                <div class="option">
                  <i class="el-icon-collection"></i>
                  <span class="text">导出Pdf</span>
                </div>
              </div>
            </el-popover>

            <div class="item">
              <i class="el-icon-caret-left"></i>
              <span class="text">撤销</span>
            </div>

            <div class="item">
              <span class="text">还原</span>
              <i class="el-icon-caret-right"></i>
            </div>

            <div class="divid"></div>

            <div class="item">
              <i class="el-icon-magic-stick"></i>
              <span class="text">绘板样式</span>
            </div>

            <el-popover
              class="popover"
              @show="headPopShow"
              trigger="hover"
              placement="bottom-start"
            >
              <div slot="reference" class="item">
                <i class="el-icon-more"></i>
                <span class="text">更多</span>
              </div>
              <div class="outType">
                <div class="option">
                  <i class="el-icon-picture-outline"></i>
                  <span class="text">选项1</span>
                </div>
                <div class="option">
                  <i class="el-icon-camera"></i>
                  <span class="text">选项2</span>
                </div>
              </div>
            </el-popover> -->
          </div>

          <dir class="rightPart">
            <!-- <div class="item return" @click="returnToCenter">
              <i class="el-icon-s-promotion"></i>
              <span class="text">返回主界面</span>
            </div> -->

            <div class="item view" @click="previewShow = true">
              <i class="el-icon-data-analysis"></i>
              <span class="text">预览绘板</span>
            </div>
          </dir>

          <msgBtn></msgBtn>
          <userBtn class="oneItem" :userRankStr="loginUserRankStr"> </userBtn>
        </div>

        <!-- 【2】左侧工具栏 -->
        <div
          class="EditLeftBar"
          :class="{ isReadonly }"
          :title="isReadonly ? '权限不足' : ''"
          slot="w"
        >
          <div class="barItem core" @click="createBIItem">
            <dir class="icon">
              <i class="el-icon-circle-plus-outline"></i>
            </dir>
            <dir class="text">BI控件</dir>
          </div>
          <div class="dividLine"></div>
          <!-- <el-popover
            class="popover addItemBtn"
            @show="leftBarPopShow"
            ref="popover"
            placement="right-start"
            trigger="click"
          >
            <div slot="reference" class="barItem">
              <dir class="icon">
                <i class="el-icon-circle-plus-outline"></i>
              </dir>
              <dir class="text">子控件</dir>
            </div>

            <el-table :data="addTable" @row-click="handleAddTip">
              <el-table-column
                v-for="col in addTableColumns"
                :key="col.prop"
                v-bind="col"
              ></el-table-column>
            </el-table>
          </el-popover> -->
          <!-- ~ 3 关联表控件 -->
          <div class="barItem" @click="createDetail">
            <dir class="icon">
              <i class="el-icon-office-building"></i>
            </dir>
            <dir class="text">关联控件</dir>
          </div>
          <!-- ~ 2 过滤控件 -->
          <el-popover
            class="popover conditionAddBar"
            @show="leftBarPopShow"
            ref="popover"
            placement="right-start"
            :disabled="isReadonly"
          >
            <div class="barItem" slot="reference">
              <dir class="icon">
                <i class="el-icon-cold-drink"></i>
              </dir>
              <dir class="text">过滤组件</dir>
            </div>
            <div class="conditionAddPop">
              <template v-for="(section, j) in conditionCmps">
                <div
                  class="conditionSection"
                  v-if="section.items.length"
                  :key="section.key"
                >
                  <div class="sectionTitle">{{ section.name }}</div>
                  <div class="sectionTags">
                    <template v-for="(condition, i) in section.items">
                      <el-button
                        plain
                        :type="['primary', 'success', 'info'][j % 3]"
                        :key="i"
                        class="oneCondition"
                        :icon="'bi ' + condition.icon"
                        @click="conditionAddFn(condition)"
                      >
                        {{ condition.text }}
                      </el-button>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </el-popover>

          <!-- ~ 4 复用 -->
          <div class="barItem" @click="selectCopyItemFn">
            <dir class="icon">
              <i class="el-icon-money"></i>
            </dir>
            <dir class="text">复用</dir>
          </div>
        </div>

        <!-- 【1】中间部分 绘板 -->
        <div class="EditCenter" slot="c">
          <Scrollbar
            class="EditCenter-scorll"
            style="width: 100%; height: 100%"
          >
            <div
              v-loading="loadRoot"
              :style="{
                width: rootWidth,
                height: rootHeight,
                position: 'relative'
              }"
              class="EditCenter-inner"
            >
              <Bubble
                v-if="nowBoardRoot"
                :Entity="nowBoardRoot"
                :isRoot="true"
                :nowBoard="nowBoard"
                :EditNode="me"
                :is="rankNormal ? 'Bubble' : 'BubbleReadOnly'"
              ></Bubble>
            </div>
          </Scrollbar>
        </div>
      </RectLayoutV2>

      <!-- ~ 3 各子控件编辑全页 fix全局 -->
      <transition name="PageMove">
        <ItemEdit
          ref="itemEdit"
          v-show="itemEditPage && rankNormal"
          :addInstances="addInstances"
          :EditNode="me"
          :nowBoard="nowBoard"
          :linkDatas="linkDatas"
          :isShow="itemEditPage"
        ></ItemEdit>
      </transition>

      <!-- ~ 4 预览页 fix全局 -->
      <transition name="PageMove">
        <BoardPreview
          ref="preview"
          v-if="previewShow"
          :theTempCode="nowTemplateCode"
          :originEdit="me"
        ></BoardPreview>
      </transition>
    </template>
  </div>
</template>

<script>
import DesignEditMixin from "./DesignEditMixin";
import BoardPreview from "./BoardPreview";
export default {
  name: "DesignEdit",
  mixins: [DesignEditMixin],
  components: {
    BoardPreview
  },
  computed: {
    isReadonly() {
      let me = this,
        boardGid = me.nowBoard && me.nowBoard.recordData.ownerGroup;

      return !me.rankNormal && boardGid == me.pageGroupId;
    }
  }
};
</script>

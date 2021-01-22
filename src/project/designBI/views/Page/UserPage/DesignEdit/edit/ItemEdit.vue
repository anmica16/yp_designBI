<template>
  <div class="ItemEdit">
    <div class="headBar">
      <div class="tabWrap">
        <div class="tabs">
          <!-- ~ 1 tab循环 首 -->
          <template v-for="ins in theInstances">
            <div
              :key="ins.instanceCode"
              href="javascript:;"
              class="oneTab"
              :class="{ active: ins === nowIns }"
              @click="changeIns(ins)"
            >
              <span class="tabTitle">{{ ins.name }}</span>
            </div>
          </template>
        </div>
        <div
          class="addNewItemBtn el-icon-circle-plus-outline"
          @click="createBIItemFn"
        ></div>
      </div>

      <div class="fill"></div>

      <div class="operBtns">
        <div class="item">
          <i class="bi bi-undo"></i>
          <span class="text">撤销</span>
        </div>

        <div class="item">
          <span class="text">还原</span>
          <i class="bi bi-retry"></i>
        </div>

        <div class="item back" @click="goBackEdit">
          <i class="bi bi-board"></i>
          <span class="text">返回仪表盘</span>
        </div>
      </div>
    </div>

    <div class="editBody">
      <!-- ~ 2 tab循环 体 -->
      <template v-for="ins in theInstances">
        <div
          v-show="nowIns && nowIns.instanceCode === ins.instanceCode"
          :key="ins.instanceCode"
          class="oneTabBody"
        >
          <one-item-edit
            :Entity="ins"
            :EditNode="EditNode"
            :nowBoard="nowBoard"
            :sumData="getSumData(ins)"
          ></one-item-edit>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import OneItemEdit from "./OneItemEdit.vue";
export default {
  components: { OneItemEdit },
  name: "ItemEdit",
  props: {
    addInstances: {
      type: Array,
      required: true
    },
    EditNode: {
      type: Object,
      required: true
    },
    nowBoard: Object,
    linkDatas: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      nowIns: null
    };
  },
  computed: {
    theInstances() {
      return this.addInstances.filter(ins => {
        return !ins.isRoot && [10, 11].indexOf(ins.recordData.useType) > -1; //10表示echart
      });
    }
  },
  methods: {
    changeIns(ins) {
      let me = this;
      //~ 2 新旧切换
      me.$emit("changeIns", ins, me.nowIns);
      me.nowIns = ins;
    },
    goBackEdit() {
      let me = this;
      me.EditNode.goBackEdit();
    },
    //【update】看会不会响应
    getSumData(ins) {
      return this.linkDatas[ins.linkDataId];
    },
    createBIItemFn() {
      let me = this;
      if (this.EditNode) {
        this.EditNode.createBIItem().then(ins => {
          if (ins) {
            me.changeIns(ins);
          }
        });
      }
    }
  }
};
</script>

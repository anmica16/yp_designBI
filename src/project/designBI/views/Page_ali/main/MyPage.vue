<template>
  <div class="AliMypage">
    <!-- ~ 1 左侧 -->
    <div class="leftArea">
      <el-carousel
        :interval="3000"
        arrow="never"
        trigger="click"
        height="180px"
      >
        <el-carousel-item v-for="item in 4" :key="item"
          ><div class="text">{{ item }}</div></el-carousel-item
        >
      </el-carousel>

      <div class="workSpace">
        <div class="head">
          <div class="title">工作空间</div>
        </div>
        <div class="body">
          <div class="body-inner">
            <template v-for="(space, i) in workSpaces">
              <div class="oneSpace" :key="i">
                <div class="main">
                  <div class="spaceName">
                    <i class="icon"></i>
                    <span>{{ space.name }}</span>
                  </div>
                  <div class="createTime">
                    <span class="pre">创建：</span>
                    <span>{{ space.cTime }}</span>
                  </div>
                  <div class="owner">
                    <span class="pre">项目负责人：</span>
                    <span>{{ space.owner }}</span>
                  </div>
                </div>

                <div class="bottom">
                  <div class="workerCount">{{ space.workerCount }}人</div>
                  <div class="center"></div>
                  <div
                    :class="[
                      'managerBtn',
                      {
                        canManager: space.canManager
                      }
                    ]"
                  >
                    <i class="icon"></i>
                    <span>管理权限</span>
                  </div>
                </div>
              </div>
            </template>
            <div class="bottomInfo">尾部提醒消息</div>
          </div>
          <div class="body-bottom"></div>
        </div>
      </div>
    </div>

    <!-- ~ 2 中间 -->
    <div class="centerArea">
      <div class="newInfoArea"></div>
      <div class="creatorArea"></div>
    </div>

    <!-- ~ 3 右侧 -->
    <div class="rightArea">
      <div class="demoChoose"></div>
      <div class="fastGuide"></div>
      <div class="contactArea"></div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";

export default {
  name: "MyPage",
  data() {
    return {
      workSpaces: [
        {
          name: "个人空间1",
          cTime: tool.Date.format(new Date(), "yyyy/MM/dd hh:mm:ss"),
          owner: "用户A",
          workerCount: 3,
          canManager: true
        },
        {
          name: "个人空间2",
          cTime: tool.Date.format(new Date(), "yyyy/MM/dd hh:mm:ss"),
          owner: "用户B",
          workerCount: 6,
          canManager: false
        }
      ]
    };
  }
};
</script>

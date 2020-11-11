import Vue from "vue";
//v8版本各个模块的引入
import PubModule from "@/modules/PubModule/PubModule.vue";

Vue.component("PubModule", PubModule);

//----------
// 其他package
//-------
import DragResize from "@/packages/drag-resize/drag-resize.vue";
Vue.component("DragResize", DragResize);

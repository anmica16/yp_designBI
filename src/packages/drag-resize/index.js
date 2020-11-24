import Vue from "vue";
import DragResizeDom from "./components/vue-draggable-resizable.vue";
import DragResizeMouse from "./components/drag-resize.vue";

Vue.component("DragResizeDom", DragResizeDom);
Vue.component("DragResizeMouse", DragResizeMouse);

import panelDR from "./components/panel-drag-resize.vue";
Vue.component("panel-drag-resize", panelDR);

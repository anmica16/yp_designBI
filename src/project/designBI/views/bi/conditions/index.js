import Vue from "vue";
import DesignItem from "@designBI/store/Entity/DesignItem";
import itemManager from "@designBI/views/drawer/itemManager";

// import b1 from "./btn-re.vue";
// Vue.component("cond-btn-re", b1);
// import b2 from "./btn-search.vue";
// Vue.component("cond-btn-search", b2);

// import d1 from "./date-calendar.vue";
// Vue.component("cond-date-calendar", d1);

import d2 from "./date-day-range.vue";
Vue.component("cond-date-day-range", d2);
itemManager.add(
  new DesignItem({
    xtype: "cond-date-day-range",
    typeCode: "0312",
    name: "日期区间",
    desp: "条件控件",
    props: d2.props
  })
);

import d3 from "./date-day.vue";
Vue.component("cond-date-day", d3);
itemManager.add(
  new DesignItem({
    xtype: "cond-date-day",
    typeCode: "0313",
    name: "日期",
    desp: "条件控件",
    props: d3.props
  })
);
import d4 from "./date-month.vue";
Vue.component("cond-date-month", d4);
itemManager.add(
  new DesignItem({
    xtype: "cond-date-month",
    typeCode: "0314",
    name: "年月",
    desp: "条件控件",
    props: d4.props
  })
);
import d5 from "./date-year.vue";
Vue.component("cond-date-year", d5);
itemManager.add(
  new DesignItem({
    xtype: "cond-date-year",
    typeCode: "0315",
    name: "年份",
    desp: "条件控件",
    props: d5.props
  })
);
// import d6 from "./date-year90.vue";
// Vue.component("cond-date-year90", d6);
import d7 from "./date-yearday-range.vue";
Vue.component("cond-date-yearday-range", d7);
itemManager.add(
  new DesignItem({
    xtype: "cond-date-yearday-range",
    typeCode: "0317",
    name: "年月区间",
    desp: "条件控件",
    props: d7.props
  })
);

import n1 from "./number-divid.vue";
Vue.component("cond-number-divid", n1);
itemManager.add(
  new DesignItem({
    xtype: "cond-number-divid",
    typeCode: "0301",
    name: "数值区间",
    desp: "条件控件",
    props: n1.props
  })
);
// import n2 from "./number-down.vue";
// Vue.component("cond-number-down", n2);
// import n3 from "./number-range.vue";
// Vue.component("cond-number-range", n3);

// import t1 from "./text-down.vue";
// Vue.component("cond-text-down", t1);
// import t2 from "./text-list.vue";
// Vue.component("cond-text-list", t2);

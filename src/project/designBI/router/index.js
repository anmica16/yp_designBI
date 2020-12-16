import Vue from "vue";

import VueRouter from "vue-router";
Vue.use(VueRouter);

import { theStore } from "../store";

import App from "../views/App.vue";
import Login from "../views/Page/Login/Login.vue";
import UserPage from "../views/Page/UserPage/UserPage.vue";
import DesignCenter from "../views/Page/UserPage/DesignCenter/DesignCenter.vue";
import DesignEdit from "../views/Page/UserPage/DesignEdit/DesignEdit.vue";

//--------
// 阿里云皮肤
//--------
import aliLogin from "../views/Page_ali/Login.vue";
import aliMain from "../views/Page_ali/Main.vue";
import aliMyPage from "../views/Page_ali/main/MyPage.vue";
import aliWorkSpace from "../views/Page_ali/main/WorkSpace.vue";

const routes = [
  {
    path: "/",
    name: "App",
    component: App,
    children: [
      {
        path: "login",
        name: "Login",
        component: Login
      },
      {
        path: "user/:id",
        name: "UserPage",
        component: UserPage,
        children: [
          {
            path: "center",
            name: "DesignCenter",
            component: DesignCenter
          },
          {
            path: "edit/:templateCode",
            name: "DesignEdit",
            component: DesignEdit
          }
        ]
      },
      {
        path: "ali/login",
        name: "aliLogin",
        component: aliLogin
      },
      {
        path: "ali/main",
        name: "aliMain",
        component: aliMain,
        children: [
          {
            path: "mypage",
            name: "aliMyPage",
            component: aliMyPage
          },
          {
            path: "work",
            name: "aliWorkSpace",
            component: aliWorkSpace
          }
        ]
      }
    ]
  }
  // {
  //   path: "/error/:msg",
  //   name: "Error",
  //   component: () => import("../views/user/Error.vue")
  // }
];

const router = new VueRouter({
  routes
});

export default router;

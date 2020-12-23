import Vue from "vue";

import VueRouter from "vue-router";
Vue.use(VueRouter);

import { theStore } from "../store";

import App from "../views/App.vue";
import Login from "../views/Page/Login/Login.vue";
import UserPage from "../views/Page/UserPage/UserPage.vue";
//import DesignCenter from "../views/Page/UserPage/DesignCenter/DesignCenter.vue";
//import DesignEdit from "../views/Page/UserPage/DesignEdit/DesignEdit.vue";

//--------
// 阿里云皮肤
//--------
import aliLogin from "../views/Page_ali/Login.vue";
import aliMain from "../views/Page_ali/Main.vue";
import aliMyPage from "../views/Page_ali/main/MyPage.vue";
import aliWorkSpace from "../views/Page_ali/main/WorkSpace.vue";
import aliCreatorArea from "../views/Page_ali/main/CreatorArea.vue";

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
            component: () =>
              import(
                /* webpackChunkName: "bi-center" */ "../views/Page/UserPage/DesignCenter/DesignCenter.vue"
              ),
            children: [
              {
                path: "menu",
                name: "DesignCenter-menu",
                components: {
                  menu: () =>
                    import(
                      /* webpackChunkName: "bi-center" */ "../views/Page/UserPage/DesignCenter/CenterMenu.vue"
                    )
                }
              },
              {
                path: "data",
                name: "DesignCenter-data",
                components: {
                  data: () =>
                    import(
                      /* webpackChunkName: "bi-center" */ "../views/Page/UserPage/DesignCenter/CenterData.vue"
                    )
                },
                children: [
                  {
                    path: "new",
                    name: "DesignCenter-data-new",
                    component: () =>
                      import(
                        /* webpackChunkName: "bi-center-data" */ "../views/Page/UserPage/DesignCenter/newData/NewDataPage.vue"
                      )
                  }
                ] //data
              }
            ] // center
          },
          {
            path: "edit/:templateCode",
            name: "DesignEdit",
            component: () =>
              import(
                /* webpackChunkName: "bi-edit" */ "../views/Page/UserPage/DesignEdit/DesignEdit.vue"
              )

            //DesignEdit
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
          },
          {
            path: "creator",
            name: "aliCreatorArea",
            component: aliCreatorArea
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

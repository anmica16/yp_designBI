<script>
import { Menu } from "element-ui";
export default {
  name: "MenuPopup",
  extends: Menu,
  props: {
    clickHide: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleItemClick(item) {
      const { index, indexPath } = item;
      const oldActiveIndex = this.activeIndex;
      const hasIndex = item.index !== null;

      if (hasIndex) {
        this.activeIndex = item.index;
      }

      this.$emit("select", index, indexPath, item);

      //【=1=】是否点击隐藏？
      if (this.clickHide && (this.mode === "horizontal" || this.collapse)) {
        this.openedMenus = [];
      }

      if (this.router && hasIndex) {
        this.routeToItem(item, error => {
          this.activeIndex = oldActiveIndex;
          if (error) {
            // vue-router 3.1.0+ push/replace cause NavigationDuplicated error
            // https://github.com/ElemeFE/element/issues/17044
            if (error.name === "NavigationDuplicated") return;
            console.error(error);
          }
        });
      }
    }
  }
};
</script>

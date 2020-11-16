import tool from "@/plugins/js/tool";

const createAndTime = {
  //----------------------
  // Section 1.2 创建修改
  //----------------------
  //【++ 1】创建时赋予
  createTime: {
    desp: "创建时间",
    default: function() {
      return tool.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss");
    }
  },
  createOper: {
    desp: "创建者"
  },
  createOperId: {
    desp: "创建者ID"
  },
  //【++ 2】修改保存时赋予
  editTime: {
    desp: "修改时间",
    default_save: function() {
      return tool.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss");
    }
  },
  editOper: {
    desp: "修改者"
  },
  editOperId: {
    desp: "修改者ID"
  }
};

export { createAndTime };

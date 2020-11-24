import tool from "@/plugins/js/tool";

const createAndTime = {
  //----------------------
  // Section 1.2 创建修改
  //----------------------
  //【++ 1】创建时赋予
  createTime: {
    name: "创建时间",
    desp: "创建时间",
    disabled: true,
    default: function() {
      return tool.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss");
    }
  },
  createOper: {
    name: "创建者",
    desp: "创建者",
    disabled: true
  },
  createOperId: {
    name: "创建者ID",
    desp: "创建者ID",
    disabled: true
  },
  //【++ 2】修改保存时赋予
  editTime: {
    name: "修改时间",
    desp: "修改时间",
    disabled: true,
    default_save: function() {
      return tool.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss");
    }
  },
  editOper: {
    name: "修改者",
    desp: "修改者",
    disabled: true
  },
  editOperId: {
    name: "修改者ID",
    desp: "修改者ID",
    disabled: true
  }
};

export { createAndTime };

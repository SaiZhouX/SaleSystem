Component({
  data: {
    active: 0,
    list: [
      {
        "pagePath": "/pages/index/index",
        "text": "首页",
        "iconPath": "/images/tabbar/home.png",
        "selectedIconPath": "/images/tabbar/home_active.png"
      },
      {
        "pagePath": "/pages/add/add",
        "text": "添加",
        "iconPath": "/images/tabbar/add.png",
        "bulge": true
      },
      {
        "pagePath": "/pages/my/my",
        "text": "我的",
        "iconPath": "/images/tabbar/my.png",
        "selectedIconPath": "/images/tabbar/my_active.png"
      }
    ]
  },
  methods: {
    onChange(event) {
      const index = parseInt(event.currentTarget.dataset.index);
      this.setData({ active: index });
      wx.switchTab({
        url: this.data.list[index].pagePath
      });
    },
    init() {
      const page = getCurrentPages().pop();
      const index = this.data.list.findIndex(item => item.pagePath === `/${page.route}`);
      this.setData({
        active: index !== -1 ? index : 0
      });
    }
  }
});
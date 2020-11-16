let app = getApp();

Page({
  data: {
    showLoading: true,
    tabs: ["余额", "交易额"],
    gridNum: 6,
    lineLeft: 35 - 1,
    tabIndex: 0,
    fontSize: 12,
    canvasWidth: app.systemInfo.windowWidth,
    canvasHeight: 300,
    gridMarginLeft: 35,
    gridMarginTop: 20,
    todayTime: "",
  },
  onLoad() {
    let _this = this;
    app.$store.connect(this, "card");
    this.observeCommon("card");
    this.observeCommon("icons");
    this.observeCommon("userInfo");
    this.setState({
      todayTime: new Date().toLocaleDateString(),
    });
    setTimeout(() => {
      // 判断是否登录
      if (!app.isLogin() || !this.data.userInfo) {
        return wx.redirectTo({
          url: "/pages/login/login",
        });
      }

      // 判断是否有成绩数据
      if (!this.data.card) {
        this.getCard();
      } else {
        this.afterGetCard();
      }
    }, 500);
  },
  switchTab(e) {
    this.setState(
      {
        tabIndex: this.data.tabIndex === 0 ? 1 : 0,
      },
      () => {
        this.drawCanvas();
      }
    );
  },
  canvasTap(e) {
    const { canvasWidth, card, points, gridMarginLeft } = this.data;
    // 手指在画布中的坐标
    const tapX = e.detail.x;
    const iwidth = (canvasWidth - 2 * gridMarginLeft) / 9;

    let i = Math.round((tapX - gridMarginLeft) / iwidth);
    points[i] &&
      this.setState({
        tapDetail: points[i].detail,
        lineLeft: gridMarginLeft + iwidth * i - 1, // 详情竖线的left
        currentIndex: i, // 当前点的索引，即显示当前详情
      });
  },
  drawLineXY() {
    const {
      gridNum,
      gridMarginTop,
      gridMarginLeft,
      canvasHeight,
      canvasWidth,
      fontSize,
      tabIndex,
      xArr,
      card,
      context,
    } = this.data;
    const list = card["今日账单"];
    const balanceArr = tabIndex
      ? list.map((item) => item["交易额"])
      : list.map((item) => item["卡余额"]);
    const maxY = Math.max(...balanceArr); // 最小金额
    const minY = balanceArr.length === 1 ? 0 : Math.min(...balanceArr); // 最大金额
    const spaceYe = tabIndex ? maxY / gridNum : (maxY - minY) / gridNum; // 坐标系Y轴间隔
    const gridHeight = canvasHeight - 2 * gridMarginTop; // 坐标系高度
    const spaceY = gridHeight / gridNum; // 横网格间距

    // 绘制竖网格
    context.setLineWidth(1);
    context.setLineCap("round");
    context.setStrokeStyle("#dddddd");
    for (let i = 0; i < xArr.length; i++) {
      context.beginPath();
      context.moveTo(xArr[i] + gridMarginLeft, canvasHeight - gridMarginTop);
      context.lineTo(xArr[i] + gridMarginLeft, gridMarginTop);
      context.stroke();
      context.closePath();
    }
    context.setStrokeStyle("#dddddd");
    context.setFillStyle("#ffcb63");

    // 绘制横网格&纵轴金额
    context.setTextAlign("right");
    for (let i = 0; i <= gridNum; i++) {
      let numY = 0,
        diff = 0;
      // 纵轴金额
      if (i === 0) {
        numY = tabIndex ? 0 : minY.toFixed(0);
      } else {
        numY = tabIndex
          ? Math.abs(spaceYe * i).toFixed(1)
          : (minY + spaceYe * i).toFixed(0);
      }
      context.beginPath();
      context.moveTo(xArr[0] + gridMarginLeft, gridMarginTop + spaceY * i);
      context.lineTo(
        xArr[xArr.length - 1] + gridMarginLeft,
        gridMarginTop + spaceY * i
      );
      context.stroke();
      context.closePath();

      context.beginPath();
      context.setFontSize(fontSize);
      let left = 6;
      context.fillText(
        numY,
        gridMarginLeft - left,
        canvasHeight - gridMarginTop - spaceY * i + 3
      );
      context.closePath();
    }
    context.setTextAlign("left");

    // 绘制横轴和纵轴
    context.setLineWidth(2);
    context.setStrokeStyle("#ffcb63");
    context.beginPath();
    context.moveTo(xArr[0] + gridMarginLeft, canvasHeight - gridMarginTop);
    context.lineTo(
      canvasWidth - gridMarginLeft / 2,
      canvasHeight - gridMarginTop
    );
    context.moveTo(xArr[0] + gridMarginLeft, canvasHeight - gridMarginTop);
    context.lineTo(xArr[0] + gridMarginLeft, 0);
    context.stroke();
    context.closePath();
  },
  drawPointLine() {
    const {
      gridNum,
      gridMarginTop,
      gridMarginLeft,
      canvasHeight,
      canvasWidth,
      fontSize,
      tabIndex,
      xArr,
      card,
      context,
    } = this.data;
    const list = card["今日账单"];
    const balanceArr = tabIndex
      ? list.map((item) => item["交易额"])
      : list.map((item) => item["卡余额"]);
    const maxY = tabIndex
      ? Math.max(...balanceArr.map((item) => Math.abs(item)))
      : Math.max(...balanceArr); // 最大金额
    const minY = tabIndex
      ? Math.min(...balanceArr.map((item) => Math.abs(item)))
      : Math.min(...balanceArr); // 最小金额
    // const spaceYe = tabIndex ? Math.abs(maxY) / gridNum : Math.abs(maxY - minY) / gridNum // 坐标系Y轴间隔
    const spaceYe = tabIndex
      ? Math.abs(maxY) / gridNum
      : (Math.abs(maxY - minY) || 1) / gridNum; // 坐标系Y轴间隔
    const gridHeight = canvasHeight - 2 * gridMarginTop; // 坐标系高度
    const spaceY = gridHeight / gridNum; // 横网格间距
    const switchBtn = !tabIndex;
    const yArr = [];
    const pointArr = [];
    for (let i = 0; i < balanceArr.length; i++) {
      yArr.push(
        gridHeight -
          ((maxY - (tabIndex ? Math.abs(balanceArr[i]) : balanceArr[i])) *
            spaceY) /
            spaceYe
      );
    }
    // 描点连线
    for (let i = 0; i < balanceArr.length; i++) {
      let x = xArr[i] + gridMarginLeft, // 横坐标
        y = canvasHeight - gridMarginTop - yArr[i]; // 纵坐标

      // 将点在画布中的坐标&消费详情存入数组
      pointArr.push({
        x: x,
        y: y,
        detail: list[i],
      });
    }

    context.setStrokeStyle("#73b4ef");
    context.setFillStyle("#ffcb63");
    // 描点连线
    for (let i = 0, pLen = pointArr.length; i < pLen; i++) {
      if (pointArr[i + 1]) {
        if (
          (switchBtn && balanceArr[i + 1] > balanceArr[i]) ||
          (!switchBtn && (balanceArr[i] > 0 || balanceArr[i + 1] > 0))
        ) {
          context.setGlobalAlpha(0.66);
        }
        context.beginPath();
        context.moveTo(pointArr[i].x, pointArr[i].y);
        context.lineTo(pointArr[i + 1].x, pointArr[i + 1].y);
        context.stroke();
        context.beginPath();
      }

      context.setGlobalAlpha(1);
      context.beginPath();
      context.arc(pointArr[i].x, pointArr[i].y, 2, 0, 2 * Math.PI); // 画点
      context.fill();
      context.fillText(
        (!switchBtn && balanceArr[i] > 0 ? "+" : "") + balanceArr[i],
        pointArr[i].x + 3,
        pointArr[i].y - 3
      ); // 点的含义，画字
      context.closePath();
    }

    this.setState({
      points: pointArr,
    });
  },
  getCard(callback = this.afterGetCard) {
    wx.showLoading({
      title: "获取数据中",
    });
    app.services.getCard(callback, {
      showError: true,
      back: true,
    });
  },
  drawCanvas() {
    const { context } = this.data;
    this.drawLineXY();
    this.drawPointLine();
    context.draw();
  },
  afterGetCard() {
    const { gridMarginLeft, canvasWidth, card } = this.data;
    wx.hideLoading();
    const context = wx.createCanvasContext("balanceCanvas");
    const len = 10;
    const spaceX = (canvasWidth - 2 * gridMarginLeft) / (len - 1); // 表示横坐标的间隔距离
    const xArr = [];
    for (let i = 0; i < len; i++) {
      xArr.push(i * spaceX);
    }
    this.setState(
      {
        tapDetail: card["今日账单"][0] || {},
        spaceX,
        xArr,
        showLoading: false,
        context,
      },
      this.drawCanvas
    );
  },
});

import logger from "./logger";

const tabBarBadgePathMapping = ["/index", "/news", "/home"];

export default function ({ store }) {
  const badgeManager = {
    data: {},
    clearBadge(path) {
      const badgeClearStatus = this.data.badgeClearStatus || {};
      store.setState("static", {
        badgeClearStatus: {
          ...badgeClearStatus,
          [path]: true,
        },
      });
    },
    updateBadgeForTabBar() {
      const unclearedBadges = store.getState("session", "unclearedBadges");
      if (!unclearedBadges) {
        return;
      }
      tabBarBadgePathMapping.forEach((path, index) => {
        const cnt = unclearedBadges.reduce((total, currentVal) => {
          return total + (currentVal.startsWith(path) ? 1 : 0);
        }, 0);
        if (cnt > 0) {
          wx.showTabBarRedDot({
            index,
            fail: (error) => {
              logger.warn(
                "badgeManager",
                `Failed to set tab bar red dot for index: ${index}, error: `,
                error
              );
            },
          });
        } else {
          wx.hideTabBarRedDot({
            index,
            fail: (error) => {
              logger.warn(
                "badgeManager",
                `Failed to clear tab bar red dot for index: ${index}, error :`,
                error
              );
            },
          });
        }
      });
    },
    updateUnclearedBadges() {
      if (!this.data.badges) {
        return;
      }

      const { allBadges } = this.data.badges;
      const badgeClearStatus = this.data.badgeClearStatus || {};

      const unclearedBadges = allBadges.filter((badgePath) => {
        return !badgeClearStatus[badgePath];
      });
      logger.debug(
        "badgeManager",
        "Uncleared badges update: ",
        unclearedBadges
      );
      store.setState("session", { unclearedBadges });
      this.updateBadgeForTabBar();
    },
  };

  const _this = badgeManager;

  store.connect(badgeManager, "badgeManager");
  badgeManager.observe("session", "badges", null, (newValue) => {
    logger.debug("badgeManager", "Received new badges config", newValue);
    _this.updateUnclearedBadges();
  });
  badgeManager.observe("static", "badgeClearStatus", null, (newValue) => {
    logger.debug(
      "badgeManager",
      "Received badge clear status update with: ",
      newValue
    );
    _this.updateUnclearedBadges();
  });

  return badgeManager;
}

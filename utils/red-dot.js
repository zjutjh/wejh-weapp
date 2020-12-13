const app = getApp();

const clearRedDot = (identifier) => {
  const clearedRedDots = app.$store.getState("static", "clearedRedDots") || {};

  app.$store.setState("static", {
    clearedRedDots: {
      ...clearedRedDots,
      [identifier]: true,
    },
  });
};

module.exports = {
  clearRedDot,
};

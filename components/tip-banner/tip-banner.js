import formatter from "../../utils/formatter";

import dayjs from "../../libs/dayjs/dayjs.min.js";
import dayjs_duration from "../../libs/dayjs/plugin/duration.js";

dayjs.extend(dayjs_duration);

Component({
  properties: {
    /* 'float' or 'block' */
    mode: {
      type: String,
      value: "float",
    },
  },
  data: {},
});

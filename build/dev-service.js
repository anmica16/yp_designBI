const path = require("path");
const theContext = path.resolve(__dirname, "../");
process.env.VUE_CLI_CONTEXT = theContext;
//下面就运行了
require("../node_modules/@vue/cli-service/bin/vue-cli-service.js");

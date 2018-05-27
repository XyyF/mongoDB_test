const express = require('express');
require('./global');
const entryRouter = require('./routes/entry_router');
const apiRouter = require('./routes/restful_api_router');
const proxyRouter = require('./routes/proxy');

const app = express();

console.log('api server start...')
/** ******************************************* */

// 检测请求的入口信息，保存到req.entry上
app.use(entryRouter.entryDetector);

/** *********************路由********************** */

// 路径映射
app.use(proxyRouter);

// REST接口
app.use('/api', apiRouter);

/** *********************监听********************** */

// 开始监听http请求
app.listen(27880, (error) => {
    if (error) {
        console.error(error)
    } else {
        console.log(`\x1b[34m监听端口:27880`);
    }
});

module.exports = app;

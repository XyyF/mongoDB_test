const listDir = require('list-dir');
const express = require('express');

const router = express.Router();

// 初始化router列表，根据请求路径，自动转发到对应的router.js文件中去
const routerList = [];
listDir.sync(__dirname).forEach((fileName) => {
    const matchs = fileName.match(/(.+)[/\\]router\.js/);
    if (matchs) {
        routerList.push(`/${matchs[1].replace(/\\/g, '/')}`);
    }
});
routerList.forEach((url) => {
    // eslint-disable-next-line import/no-dynamic-require,global-require
    const model = require(`.${url}/router`);
    if (typeof model.router === 'function') {
        router.use(url, model.router)
    }
})

// 上一步没有找到可路由的api接口，返回404状态
router.use((req, res) => res.sendStatus(404));

module.exports = router;

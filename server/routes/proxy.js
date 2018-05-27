/**
 * Created by lnk on 17/2/22.
 */
// const url = require('url');
const express = require('express');
const router = express.Router();

router.use('/', (req, res, next) => {
    // const parsedUrl = url.parse(req.url);
    let rewriteTarget;

    // "/入口名_api/xxx"请求重写为"/api/xxx"
    if (req.entry) {
        rewriteTarget = `/${req.url.substr(req.entry.entryName.length + 2)}`
    }

    if (rewriteTarget) {
        req.url = rewriteTarget;
        next();
    } else {
        next();
    }
});

module.exports = router;

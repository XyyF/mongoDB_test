/**
 * Created by rengar on 2018/05/27.
 */

/**
 * 检测请求的入口信息，保存到req.entry上
 */
exports.entryDetector = (req, res, next) => {
    if (req.url.startsWith(`/admin_api/`)) {
        req.entry = item
        return true
    }
    return false
    next()
}

/**
 * 不需要检查登录态的请求url列表。这里采用glob语法，常用语法如下：
 * * 匹配任意数量的字符，但不匹配/
 * ? 匹配单个字符，但不匹配/
 * ** 匹配任意数量的字符，包括/，只要它是路径中唯一的一部分
 * [] 匹配其中任意一个字符
 * {} 允许使用一个逗号分割的列表或者表达式，如{/b/c, /[0-9]}
 * ! 在模式的开头用于否定一个匹配模式(即排除与模式匹配的信息)
 */
const Minimatch = require('minimatch').Minimatch

module.exports = [
    '/account/signin',
    '/account/signup',
    '/account/signout',
    '/cmd/create_system_conf',
    '/wechat', // 微信推送
    '/wechat/**',
    '/transaction/notify', // 支付成功的推送
].map(pattern => new Minimatch(pattern));

exports.init = function init(configure) {
    // node监听的端口号。测式环境使用奇数端口号
    configure.port++
    // 暴露给用户的主机名，使用80端口，通过nginx转发到port端口上。注意只有resource服可以直接被用户访问到
    configure.host = `${configure.httpProtocol}//${configure.projectName.replace(/_/g, '-')}.dev.huisaas.com`
    // 是否允许注册测试账号
    configure.enable_test_account = true

    // 日志配置名字
    configure.log4js_category = 'file'

    configure.wx_server_token = 'fokajowiejfpoaiwjepoifjo';
    configure.wx_appid = 'wxead204a18dfe0648' // lnk的测试公众号
    configure.wx_secret = '84c32241909c462786dc684f84687027' // 应用秘钥

    // 微信模板消息id（lnk的测试公众号）
    // 为了不在这个文件中引用push.enums.js，所以key名需要手动和PushTypes枚举值保持一致
    configure.wxTemplateIdMap = {
        HOMEWORK_RESULT: '', // 作业批改通知
    }

    return configure;
}

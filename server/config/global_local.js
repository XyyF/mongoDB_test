const envHostName = process.env.HOST_NAME

exports.init = function init(configure) {
    // 是否是测试环境
    configure.dev = true

    // 当前开发者的名字
    configure.developer = process.env.USER || process.env.USERNAME || process.env.COMPUTERNAME

    // 是否允许注册测试账号
    configure.enable_test_account = true

    // 日志配置名字
    configure.log4js_category = 'codeLine'

    configure.mongo_db_address = `mongodb://localhost:25916/${configure.projectName}`

    // 若不为空，则跳过获取微信用户信息的环节，直接使用该数据
    configure.fake_wechat_user_info = {
        openid: `fake_${String(Math.random()).slice(2)}`,
        nickname: configure.developer || 'fake_name',
        headimgurl: '/placeholder/400x400',
        sex: '1',
    }

    // 微信模板消息id
    // 为了不在这个文件中引用push.enums.js，所以key名需要手动和PushTypes枚举值保持一致
    configure.wxTemplateIdMap = {
        HOMEWORK_RESULT: '', // 作业批改通知
    }

    // localtunnel服务器域名
    configure.tunnelServerHost = 'http://tunnel.xiaojing0.com'
    configure.tunnelSubdomain = configure.developer.replace(/\W/g, '').toLocaleLowerCase()
    // 是否使用localtunnel进行开发
    configure.useLocaltunnel = false

    console.log(`load ${configure.developer}'s config`)
    switch (configure.developer) {
        case 'vv13':
            configure.wx_server_token = 'skeleton';
            configure.wx_appid = 'wx55ce322233ab97cc'
            configure.wx_secret = 'dd4742cff2a1021ead295a8073e8de7a' // 应用秘钥
            // configure.useLocaltunnel = true
            break;
        case 'Carlos':
            configure.wx_server_token = 'meetinisgood';
            configure.wx_appid = 'wx0b4cd0e90be4faa3'
            configure.wx_secret = '7f2001a4c6c6b7f914fccec6e97fec48' // 应用秘钥
            // configure.useLocaltunnel = true
            break;
        case 'lnk':
            configure.wx_server_token = 'fokajowiejfpoaiwjepoifjo';
            configure.wx_appid = 'wxead204a18dfe0648'
            configure.wx_secret = '84c32241909c462786dc684f84687027' // 应用秘钥
            // configure.useLocaltunnel = true
            break;
        default:
            // 清空appid，以免刷新了正式环境的accessToken
            configure.wx_appid = ''
            configure.wx_secret = '' // 应用秘钥
    }
    if (configure.useLocaltunnel) {
        configure.fake_wechat_user_info = null // 开启localtunnel就不需要假数据了
        // 注意localtunnel还需要配置测试公众号中的以下信息：
        // 接口配置信息：http://域名/api/wechat/own_platform
        // JS接口安全域名：域名（不带http）
        // 网页服务->网页账号：域名（不带http）
    }

    // 暴露给用户的主机名，使用80端口，通过nginx转发到port端口上。注意只有resource服可以直接被用户访问到
    if (configure.useLocaltunnel) {
        // 开启localtunnel后暴用户访问的接口变成了80端口。（node监听的还是原来的端口）
        configure.host = configure.tunnelServerHost.replace('//', `//${configure.tunnelSubdomain}.`)
    } else {
        const hostName = envHostName || `${configure.httpProtocol}//localhost`
        // TODO 使用服务发现机制，去获取resource服暴露给用户的访问地址
        // eslint-disable-next-line global-require
        // const ServerList = require('../../common/server_list')
        // const port = ServerList[`${configure.projectName.toUpperCase()}_LOCAL_RESOURCE`].host.split(':')[2]
        // configure.host = `${hostName}:${port}`
    }

    return configure;
}

const projectConfig = require('../../common/project_config')

/**
 * 服务器端正式环境使用的配置。其它环境需要定义单独的文件覆盖这些配置
 */
let configure = projectConfig

// node监听的端口号。正式环境使用偶数端口号
configure.port = 27880
// 暴露给用户的主机名，使用80端口，通过nginx转发到port端口上。注意只有resource服可以直接被用户访问到
configure.host = `${configure.httpProtocol}//${configure.projectName.replace(/_/g, '-')}.prod.huisaas.com`

// 文件编辑器上传图片大小限制，单位B
configure.editor_max_img_upload_size = 10 * 1024 * 1024
// 文件编辑器允许上传的图片格式
configure.editor_allow_img = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
// 最大请求大小，包括ajax和表单提交，不含上传文件
configure.max_request_size = '1mb'

// 是否允许注册测试账号
configure.enable_test_account = false


// 日志配置名字
configure.log4js_category = 'file'

configure.mongo_db_address = `mongodb://node_user:${configure.serverConfig.mongo_password}@dds-m5e410e6371755042.mongodb.rds.aliyuncs.com:3717,dds-m5e410e6371755041.mongodb.rds.aliyuncs.com:3717/${configure.projectName}?replicaSet=mgset-1614947`

// 若不为空，则跳过获取微信用户信息的环节，直接使用该数据
configure.fake_wechat_user_info = null
configure.wx_appid = ''; // 正式公众号
configure.wx_secret = ''; // 应用秘钥
// 微信支付分配的商户号
configure.wx_mchid = '';
// 微信支付key
configure.wx_paykey = '';
// 微信异步支付回调地址
configure.wx_notify_url = '';
// Native支付方式调用微信支付API的机器IP
configure.wx_device_ip = '';

// 服务器配置，Token(令牌)
configure.wx_server_token = '';

configure.wx_open_platform_appid = 'wx87b0411631a181a5'; // 微信第三方平台appid
configure.wx_open_platform_secret = '7f14644ba41060bed2136c18de3d2879'; // 微信第三方平台secret
configure.wx_open_platform_msg_token = 'meetinisgood'; // 公众号消息校验Token
configure.wx_open_platform_crypto_key = '12345678901234567890qwertyuiopqwertyuiop123'; // 公众号消息加解密Key


if (!configure.is_server) {
    console.log('加载本地版配置文件')
    // eslint-disable-next-line global-require
    configure = require('./global_local').init(configure);
} else if (configure.dev) {
    console.log('加载服务器测试环境版配置文件')
    // eslint-disable-next-line global-require
    configure = require('./global_server_dev').init(configure);
} else {
    console.log('加载服务器正式环境版配置文件')
}

module.exports = configure;

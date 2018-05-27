const path = require('path');

/**
 * 服务器端正式环境使用的配置。其它环境需要定义单独的文件覆盖这些配置
 */
const configure = {}

// 工程名字
configure.projectName = 'test_mongodb'
// 工程根目录
configure.project_dir = path.normalize(`${__dirname}/..`)

// 请求协议，可改为https
configure.httpProtocol = 'http:'

try {
    // 安全起见，各关键账号密码不托管在git上，直接保存在server_config.js文件中
    // eslint-disable-next-line
    configure.serverConfig = require(`${configure.project_dir}/server_config`);
} catch (e) {
    console.warn('没有找到server_config.js文件')
    configure.serverConfig = {};
}
// 服务器端环境
configure.is_server = !configure.serverConfig.env || configure.serverConfig.env !== 'local'
// 是否是测试环境
configure.dev = configure.serverConfig.env === 'develop' || configure.serverConfig.env === 'local'

// 可直接通过url访问的静态资源目录，包括html、图片、js等
configure.web_static_dir = path.join(configure.project_dir, 'public')
// 模板目录
configure.render_dir = path.join(configure.web_static_dir, 'templates')

// 前端源码目录
configure.client_src_dir = path.join(configure.project_dir, 'client')
// 网站标题栏logo。可以不填
configure.favicon_path = '' // path.join(configure.client_src_dir, 'favicon.ico')

// 后端用的数据和资源目录
configure.data_dir = path.join(configure.project_dir, 'server', 'data')
// 生成文件的临时目录
configure.TMP_DIR = path.join(configure.data_dir, 'tmp')
// 上传时的临时目录
configure.UPLOAD_TMP_DIR = path.join(configure.data_dir, 'uploadtmp')
// 使用文件储存session时的存放目录
configure.SESSION_DIR = path.join(configure.data_dir, 'sessions')

module.exports = configure;

# 环境依赖

### node
去官网下载安装node7.9+版本(8.x版也可以)，windows版会附带npm。这是一个包管理工具，我们会用它来安装下面提到的其它依赖工具

### yarn

```
npm install yarn -g
```
没有npm的话可以直接去[这里](https://yarnpkg.com/en/docs/install)下载yarn安装包

### MongoDB

* 安装mongodbd
* 修改项目根目录下的install_mongo_service.bat第一行的路径为您自己的mongodb安装路径，保存后右键“以管理员身份运行”
* 以上操作在windows中安装了一个服务MONGODB，会在开机时自启动

### vue-devtools

可以在控制台查看vue实例的状态的调试工具。
[安装地址](https://chrome.google.com/webstore/detail/nhdogjmejiglipccpnnnanhbledajbpd)
如果控制台不显示，需要检查以下配置
* 网页使用vue.js而不是vue.min.js，或在刚初始化好后设置Vue.config.devtool=true
* 关闭控制台再重新打开

----
















# 常用命令
## 1.开发环境初始化项目
```
yarn
```
* 在根目录下新建`server_config.js`文件。文件内容如下：
 ```
 module.exports = {
    'env': 'local', // 取值为production、develop或local
 };
 ```

----
## 2.开发环境启动项目
```
node server/app.js
node client/resource_server/resource_server.js
```
只做后台开发的同学可以使用以下命令
```
yarn run build-local
node server/app.js
node client/resource_server/resource_server.js --nowebpack
```

----

## 3.发布到测试环境
git push到develop分支，会自动进行构建与部署

----

## 4.发布到正式环境
git push到master分支，并登录[阿里云持续构建系统](https://crp.aliyun.com)，找到正式环境工作流，点`运行工作流`，点三角按钮

----

## 5.线上环境启动命令
```
./update.sh
```

----















# 项目初始化
## 1.修改全局配置
* 修改`common/project_config.js`中的`projectName`
* 修改`server/config/global.js`中的`port`
* 修改`package.json`中的`repository.url`

## 2.服务器端克隆代码
在/nginxres目录下用git clone检出代码
进入代码目录，执行以下命令赋予根目录的脚本执行权限
```
chmod 777 *.sh
```
在根目录下新建`server_config.js`文件。文件内容如下：
 ```
 module.exports = {
    'env': 'production', // 取值为production、develop或local
 };
 ```

## 3.配置服务器端数据库
在[DMS](https://dms-rds.aliyun.com/?spm=5176.8113352.3.d41.3edDAG&host=dds-m5e410e6371755042.mongodb.rds.aliyuncs.com&port=3717)中以`工程名`创建一个用户库，并在其中创建一个`node_user`用户，并勾上`read`和`readWrite`权限。
将该用户的密码记录在`server_config.js`文件中。增加一行如下：
```
    'mongo_password': 'xxx',
```

## 4.配置nginx端口
1. 找到nginx配置文件，一般路径为：`/usr/local/nginx/conf/nginx.conf`

2. 编辑，只需要编辑或新增 `server{...}` 内的信息，具体配置参考下方的nginx配置说明

3. 编辑完成后，需要重启nginx服务使其配置生效：

3.1. 使用  `ps -ef | grep nginx` 命令找到 `nginx: master process`进程，记录进程号，如：15753  
3.2. 使用平滑重启方式重启nginx进程：`kill -HUP 15753`(nginx主进程号，3.1已记录)


## 5.创建服务器端日志文件夹
在`/log`目录下以`工程名`创建一个文件夹。如果有测试环境，还要以`工程名_dev`创建一个文件夹

## 6.配置域名解析
* 登录阿里云控制台，找到云解析DNS。点`huisaas.cn`。
* 配置一个A类记录，主机记录填`工程名.prod`，记录值填服务器ip。
* 如果要配置测试环境的话还需要以`工程名.dev`为主机记录创建一条解析规则
* 注意服务器ip一定要和@记录的地址一致，否则打开该域名时会提示未备案。
* 实在不行可以换用meetin.co的子域名，需要去修改`server/config/global.js`和`server/config/global_server_dev.js`中的`configure.host`。而且meetin.co的域名解析在[dnspod](https://www.dnspod.cn/)上
* 把域名和端口使用情况记录在[Tower](https://tower.im/projects/55b928565deb44648d505616af5b9253/docs/c588450891564625b8a272a3e50e173d/)上

## 7.配置七牛
* 登录[七牛](https://portal.qiniu.com)
* 在`对象存储`中创建一个`存储空间`
* 在`存储空间`的`镜像存储`中设置镜像源，如`http://example.prod.huisaas.cn`
* 将存储空间的域名填入`build/webpack.configs.js`文件的`prodCdnDomain`属性处
* 若有七牛上传模块，还要把access和key(个人面板->密钥管理)填入`server_config.js`文件。增加两行如下：
  ```
    "qiniu_ACCESS_KEY": "xxx",
    "qiniu_SECRET_KEY": "xxx",
  ```
  把上传用的bucket容器名和路径填入`server/routes/upload/qiniu_upload.js`  
  根据容器所在区域和上传域名的[对应表](https://developer.qiniu.com/kodo/manual/1671/region-endpoint)配置`qiniu_upload.js`中的`QINIU_UPLOAD_URL`
 
## 8.配置容联云通讯
* 登录[容联云通讯](http://www.yuntongxun.com/)
* 将配置信息填入`server/routes/utils/sms_send_utils`中

## 9.配置持续构建
* 登录持续构建平台[Kelude](https://crp.aliyun.com/projects/21954)  
* 在`工作流`中以`真·node持续构建`模板创建一个新工作流  
* 设置`代码仓库`和`监听分支`  
* 点击上方区域流程图中的`1部署`，将`部署路径`和`部署命令`中的`edu_saas`修改为自己的工程名。  
* 注意若是要配置测试环境的发布流程，则应在路径中加上`_dev`。还要把`2构建`>`编译/测试`>`运行命令`中的`build`改为`build-dev`  
* 注意正式环境要把`2构建`左边的`自动触发`关掉
* 点击右侧的`保存并立即运行`。

## 10.创建超级管理员账号
* 打开`common/authority.js`修改以下变量
```
authority.DEFAULT_GROUP_IDS = [authority.groups.SUPER_MANAGER.id];
```
* 重启服务器。打开浏览器进行访问。  
* 在登录页面点击`初始化权限组`按钮。密码在`server/routes/cmd/subtask.js`中。  
此时注册的账号即为超级管理员账号。  
* 还原`common/authority.js`中的修改

----















# nginx配置
目前我们有两台服务器，校精灵与会众。各自路由规则不同。由于微信接口要求提供80端口地址，所以推荐暴露在80端口的写法  


## 1.校精灵nginx配置`80端口`
校精灵服务器上运行着校精灵官网，localtunnel项目。  
校精灵服务器中各项目使用不同的子域名，暴露出来的都是80端口，由nginx识别域名并路由到各项目node端口。  
目前https配置（443端口）还不可用
新增项目时向`ningx.conf`中增加一段以下代码即可。xxx为项目名和端口号
```
# 项目名
server {
    listen       80;
    server_name  xxx.xiaojing0.com;
    limit_conn lim_conn 100;
    limit_req zone=lim_freq burst=50 nodelay;

    location / {
        proxy_pass http://127.0.0.1:xxx;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
# 项目名测试环境
server {
    listen       80;
    server_name  xxx.dev.xiaojing0.com;
    limit_conn lim_conn 100;
    limit_req zone=lim_freq burst=50 nodelay;

    location / {
        proxy_pass http://127.0.0.1:xxx;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```
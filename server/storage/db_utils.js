/**
 * Created by Lnk on 2016/8/22.
 */
const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

// 数据库连接列表，按表分库的时候用到
const connections = [];
const CONN_DEFAULT = 0;
const penddingFunc = [];

/**
 * 数据库的名字，统一放在这里是为避免外键引用时写错对方名字
 */
exports.dbName = {
    test: 'test',
    recycleBin: 'recycleBin'
};

// 根据Model名生成数据表名
Object.keys(exports.dbName).forEach((modelName) => {
    const underlineName = modelName.replace(/[A-Z]+/g, a => `_${a.toLowerCase()}`).replace(/^_/, '');
    exports.dbName[modelName] = underlineName + (gConfig.dev ? '_dev' : '');
});

/**
 * 初始化数据库
 */
exports.initDB = function initDB() {
    // 默认的数据库连接
    connections[CONN_DEFAULT] = createConnection(gConfig.mongo_db_address, gConfig.dev);
};

/**
 * 创建一个数据库连接
 * @param {string} dbUri 连接地址
 * @param {boolean} debugMode 是否打印数据库操作日志
 * @return {{connected: boolean, db: Connection}}
 */
function createConnection(dbUri, debugMode) {
    const connectionInfo = {
        connected: false,
        db: mongoose.createConnection(dbUri, {
            // 在每次数据更新后自动更新索引，有性能开销
            config: {autoIndex: debugMode}
        })
    };
    connectionInfo.db.on('error', (e) => {
        console.error(`连接数据库失败: ${e.message}`);
    });
    connectionInfo.db.once('open', () => {
        connectionInfo.connected = true;
        console.log('成功连接到数据库');
        // 建立连接后才开启调试模式，以免连接时显示很多红字提示
        if (debugMode) {
            // mongoose.set('debug', true);
            // use custom function to log collection methods + arguments
            mongoose.set('debug', (collectionName, methodName, ...args) => {
                const argsStr = args.map(arg => JSON.stringify(arg)).join(',');
                console.debug(`Mongoose: ${collectionName}.${methodName}(${argsStr})`)
            });
        }
        for (let i = 0; i < penddingFunc.length; i++) {
            penddingFunc[i]();
        }
    });
    connectionInfo.db.once('close', () => {
        connectionInfo.connected = false;
        console.log('断开数据库连接');
    });
    return connectionInfo
}

/**
 * 获取数据表所在的数据库连接
 * @param {string} name 数据表名，dbName.member等
 * @returns {mongoose.connection}
 */
exports.getConnection = function getConnection(name) {
    if (!connections.length) {
        throw new MError(MError.DATABASE_CONNECTION_NOT_EXIST, 'db connection is not exist');
    }
    switch (name) {
        default:
            return connections[CONN_DEFAULT].db;
    }
};

/**
 * 获取数据表所在的数据库连接
 * @param {string} name 数据表名，dbName.Member等
 * @param {"mongoose".Schema} schema
 * @return {(Statics&_mongoose.ModelConstructor<T>)|*|_mongoose.ModelConstructor<T>}
 */
exports.createModel = function createModel(name, schema) {
    const connection = exports.getConnection(name);
    return connection.model(name, schema, name);
};

/**
 * 在数据库建立连接后再执行fn
 * @param {Function} fn
 */
exports.onConnected = function onConnected(fn) {
    if (connections.every(connection => connection.connected)) {
        fn();
    } else {
        penddingFunc.push(fn);
    }
};

/**
 * 删除对应字段的index索引
 * @param {string} collectionName 数据集合名字
 * @param {string} rmIndexFiled 删除index的字段名字，可以根据log中的字段获得
 */
exports.rmCollectionIndex = function rmCollectionIndex(collectionName, rmIndexFiled) {
    const keys = Object.keys(exports.dbName);
    if (keys.indexOf(collectionName) < 0) {
        console.error(`carlos error, collection: ${collectionName} not exist`);
        return;
    }
    const tempCollection = exports.getConnection(collectionName).collections[collectionName];
    tempCollection.getIndexes()
        .then((indexs) => {
            console.log(`carlos log, the collection: ${collectionName}, has indexs info: `, JSON.stringify(indexs));
            if (rmIndexFiled) {
                tempCollection.dropIndex(rmIndexFiled);
            }
        });
};

// eslint-disable-next-line no-unused-vars
function showBudda() {
    setTimeout(() => {
        console.log(`
\x1b[43;30m                   _ooOoo_                   \x1b[0m
\x1b[43;30m                  o8888888o                  \x1b[0m
\x1b[43;30m                  88" . "88                  \x1b[0m
\x1b[43;30m                  (| -_- |)                  \x1b[0m
\x1b[43;30m                  O\\  =  /O                  \x1b[0m
\x1b[43;30m               ____/\`---'\\____               \x1b[0m
\x1b[43;30m             .'  \\\\|     |//  \`.             \x1b[0m
\x1b[43;30m            /  \\\\|||  :  |||//  \\            \x1b[0m
\x1b[43;30m           /  _||||| -:- |||||-  \\           \x1b[0m
\x1b[43;30m           |   | \\\\\\  -  /// |   |           \x1b[0m
\x1b[43;30m           | \\_|  ''\\---/''  |   |           \x1b[0m
\x1b[43;30m           \\  .-\\__  \`-\`  ___/-. /           \x1b[0m
\x1b[43;30m         ___\`. .'  /--.--\\  \`. . __          \x1b[0m
\x1b[43;30m      ."" '<  \`.___\\_<|>_/___.'  >'"" .      \x1b[0m
\x1b[43;30m     | | :  \`- \\\`.;\`\\ _ /\`;.\`/ - \` : | |     \x1b[0m
\x1b[43;30m     \\  \\ \`-.   \\_ __\\ /__ _/   .-\` /  /     \x1b[0m
\x1b[43;30m======\`-.____\`-.___\\_____/___.-\`____.-'======\x1b[0m
\x1b[43;30m                   \`=---='                   \x1b[0m
\x1b[43;30m^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\x1b[0m
\x1b[43;30m            佛祖保佑       永无BUG             \x1b[0m
`);
    }, 50);
}

// 初始化数据库
exports.initDB();

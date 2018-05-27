/**
 * 在此声明全局变量
 */
const path = require('path');
const P = require('bluebird');
const _ = require('underscore');

// 请求处理结束时用的方法，将数据封装成标准对象，并下发到浏览器
P.prototype.thenSend = thenSend;
// 请求处理结束时用的方法，将数据封装成标准对象，并下发到浏览器。async使用的是原生Promise对象，所以这里需要对原生对象也进行改造
Promise.prototype.thenSend = thenSend;
// 替换全局Promise
global.Promise = P;

// 向前端返回数据时用的异常类
global.MError = require('./utils/merror');

global.gConfig = require('./config/global');

// 把要返回给网页端的数据封装成标准的格式
global.gWrapPromiseResult = function gWrapPromiseResult(result) {
    return {
        data: result,
        status: {
            code: 0
        }
    };
};

// 请求处理结束时用的方法，将数据封装成标准对象，并下发到浏览器
function thenSend(req, res, next) {
    return this.then(gWrapPromiseResult)
        .then((result) => {
            console.log(`carlos log, send: ${JSON.stringify(result)}`)
            return result
        })
        .then(res.send.bind(res))
        .catch(next);
}

/**
 * 下发到客户端时，过滤掉从mongo中查出来的数据的_id，__v属性，删去标记为已删除的数据，并转为普通对象。
 * 支持处理数组或单个对象
 */
global.gFilterDocument = function gFilterDocument(doc) {
    return filterDocument(doc, ['_id', '__v']);
};

/**
 * 通过bulk的update存入数据库时，过滤掉无法修改的_id等属性，并转为普通对象。
 * 支持处理数组或单个对象
 */
global.gFilterDocumentForBulk = function gFilterDocumentForBulk(doc) {
    return filterDocument(doc, ['_id', '__v']);
};

/**
 * 通用检查参数是否存在方法
 * @param {object} paramsObj
 * @returns {Promise}
 */
global.checkParamsExist = function checkParamsExist(paramsObj) {
    if (typeof paramsObj !== 'object' || Array.isArray(paramsObj)) {
        if (!paramsObj || typeof paramsObj === 'undefined' || paramsObj === 'undefined') {
            return Promise.reject(new MError(MError.PARAMETER_ERROR, `参数paramsObj=${paramsObj}`));
        } else {
            return Promise.resolve();
        }
    } else {
        const errMsg = Object.entries(paramsObj)
            .filter(([, value]) => !value || typeof value === 'undefined' || value === 'undefined')
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
        if (errMsg) {
            return Promise.reject(new MError(MError.PARAMETER_ERROR, `参数${errMsg}`));
        }
        return Promise.resolve();
    }
};

/**
 * 检查session信息是否存在，会检查所有字段
 * @param {object} sessionInfo
 */
global.checkSessionIsExist = function checkSessionIsExist(sessionInfo) {
    const pivotalKeys = ['campusId', 'organizationId', 'studentId', 'managerId', 'accountId'];
    _.forEach(sessionInfo, (value, key) => {
        // 检查关键字段是否存在
        if (pivotalKeys.includes(key) && !value) {
            throw new MError(MError.NOT_SIGNIN);
        }
    })
};

/**
 * 检查名字是否符合规范
 * @param {string} name
 * @param {boolean?} isNeedCheckSpecialChar 是否需要检查特殊字符
 */
global.checkNameIsValid = function checkNameIsValid(name, isNeedCheckSpecialChar = true) {
    if (!name) {
        return;
    }
    if (isNeedCheckSpecialChar) {
        const pattern = /[`~!@#\$%\^\&\*\(\)\+<>\?:"\{\},\.\\\/;'\[\]]/im;
        const isExistSpecifiedChar = pattern.test(name);
        if (isExistSpecifiedChar) {
            throw new MError(MError.CAN_NOT_CONTAIN_SPECIFIED_CHAR);
        }
    }
    if (name.length > 15) {
        throw new MError(MError.CAN_NOT_EXCEED_LIMITED_CHARS);
    }
};

function filterDocument(doc, dropPropertyNames) {
    if (!doc) {
        return doc;
    }
    if (doc instanceof Date) {
        return doc;
    }
    if (Array.isArray(doc)) {
        return doc.map(item => filterDocument(item, dropPropertyNames));
    }
    if (!dropPropertyNames) {
        dropPropertyNames = [];
    }
    if (typeof doc.toJSON === 'function') {
        doc = doc.toJSON();
    }
    for (let i = dropPropertyNames.length - 1; i >= 0; i--) {
        delete doc[dropPropertyNames[i]];
    }

    for (const key in doc) {
        if ((key === 'createdAt' || key === 'updatedAt') && doc.hasOwnProperty(key)) {
            doc[key] = new Date(doc[key]).getTime();
        }
        if (!doc.hasOwnProperty(key)) {
            continue;
        }
        const value = doc[key];
        if (Array.isArray(value)) {
            doc[key] = value.map(item => filterDocument(item, dropPropertyNames));
        } else if (value instanceof Object) {
            doc[key] = filterDocument(value, dropPropertyNames);
        }
    }
    return doc;
}

/**
 * 执行bulk.execute方法，并将结果回调转为promise形式
 * @param bulk
 * @returns {Promise}
 */
global.gBulkExecutePromise = function gBulkExecutePromise(bulk) {
    return new Promise((resolve, reject) => {
        if (!bulk.length) {
            resolve();
        }
        bulk.execute((err, result) => {
            if (result && result.toJSON) {
                result = result.toJSON();
            }
            console.log(result);
            if (err) {
                reject(new MError(MError.ACESS_DATABASE_ERROR, err));
            } else if (result && result.ok !== 1) {
                reject(new MError(MError.ACESS_DATABASE_ERROR, 'update database failed!'));
            } else {
                resolve(result);
            }
        });
    })
        .catch(MError.prependCodeLine(true));
};

// 可通过console.log(__line)的形式获得当前代码行号字符串
Object.defineProperty(global, '__line', {
    get() {
        const pos = gGetCodePosition(1);
        return pos ? pos.line : '';
    }
});

const rootPath = `${path.sep}server`;
const rootPathIndex = __dirname.lastIndexOf(rootPath) + 1;
// 获得当前代码位置信息
global.gGetCodePosition = function gGetCodePosition(logStackDepth) {
    // Extract caller:
    const stack = new Error().stack;
    const callMsg = stack.split('\n')[logStackDepth + 2];
    if (callMsg) {
        const m = callMsg.match(/^\s+at\s*(.*?)\s+\(?([^ ]+?):(\d+):\d+\)?$/);
        if (m && m.length === 4) {
            const nodeExportsPathIndex = m[1].lastIndexOf('.exports.');
            if (nodeExportsPathIndex >= 0) {
                m[1] = m[1].substr(nodeExportsPathIndex + '.exports.'.length);
            }
            return {
                file: m[2].substr(rootPathIndex),
                line: m[3],
                method: m[1] ? m[1].replace(/^.*\[as ([^\]]+)].*$/, '$1').replace(/.+\.<anonymous>/, '') : ''
            }
        }
    }
    return {file: '', line: '', method: ''};
};

/**
 * 将查询参数转换为字符串，如果传了两个参数，可自动进行拼接
 * @param {string|object} url 待拼接的url。拼接时会检测其中是否已含有问号
 * @param {object} [paramsObj] 对象形式的查询参数。其中的undefined属性会被过滤掉
 * @returns {string} 拼接好的url。若没填url参数则返回字符形式的查询参数
 */
global.gStringifyUrlParams = function gStringifyUrlParams(url, paramsObj) {
    if (paramsObj === undefined) {
        // 只传了一个参数的情况
        paramsObj = url;
        url = undefined;
    }
    const pairs = [];
    for (const key in paramsObj) {
        if (paramsObj.hasOwnProperty(key) && paramsObj[key] !== undefined && paramsObj[key] !== null) {
            pairs.push(`${key}=${paramsObj[key]}`);
        }
    }
    const query = pairs.join('&');
    if (!url) {
        return query;
    }
    return url.includes('?') ? (`${url}&${query}`) : (`${url}?${query}`);
};

/**
 * 删除object中的不可更改的字段
 * @param {object} mObject 改变信息
 * @param {string[]} needDeleteFields 需要删除的字段
 */
global.gDeleteFixedFields = (mObject, needDeleteFields) => {
    if (!mObject) {
        return mObject;
    }
    return _.omit(mObject, needDeleteFields);
};

/**
 * 选择object中需要的字段
 * @param {object} mObject 改变信息
 * @param {string[]} needReserveFields 需要保留的字段
 */
global.gPickFixedFields = (mObject, needReserveFields) => {
    if (!mObject) {
        return mObject;
    }
    return _.pick(mObject, needReserveFields);
};

/**
 * 冻结object中所有的对象属性
 * @param {object} object
 */
global.freezeObject = (object) => {
    Object.freeze(object);
    _.forEach(object, (value, key) => {
        if (typeof value !== 'object') {
            return;
        }
        Object.freeze(object[key]);
        if (Array.isArray(value)) {
            value.forEach((eachItem) => {
                if (typeof eachItem === 'object') {
                    freezeObject(eachItem);
                }
            })
        } else if (typeof value === 'object') {
            freezeObject(value);
        }
    })
};

/**
 * 比较老的信息和新的信息，获得两者不同的部分，仅比较非嵌套的最外层数据
 * @param oldInfo
 * @param newInfo
 */
global.gGetChangedInfo = (oldInfo, newInfo) => {
    if (!oldInfo) {
        return {};
    }
    const changedInfo = {};
    _.forEach((newInfo), (newValue, key) => {
        const oldValue = oldInfo[key];
        if (typeof oldValue === 'object' || typeof oldValue === 'function' || typeof oldValue === 'undefined') {
            return;
        }
        if (oldValue !== newValue) {
            changedInfo[key] = newValue;
        }
    });
    return changedInfo;
};

/**
 * created by rengar on 18/05/27
 */
const dbUtils = require('../../../storage/db_utils');
const testSchema = require('./test_schema');

const TestSchema = dbUtils.createModel(dbUtils.dbName.test, testSchema.testSchema);
exports.TestSchema = TestSchema;


/** ********************外露接口************************ */

/**
 * 自定义查找单条数据
 * @param {object} query 查询条件
 * @param {string[]} selectArray 筛选返回字段
 */
function findOne(query, selectArray) {
    return TestSchema.findOne(query)
        .select(selectArray ? selectArray.join(' ') : '')
        .exec()
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then((document) => {
            if (!document) {
                throw new MError(MError.FIND_NOTHING_IN_DB).setMessageTemplateData(['评测信息']);
            }
            return document
        });
}

/**
 * 自定义查找
 * @param {object} query 查找条件
 * @param {object} sortRule 排序规则
 * @param {number} limit 返回doc个数
 * @param {number} index 返回的第一个doc的下标
 * @param {string[]} selectArray 筛选返回字段数组
 */
function find(query, sortRule, limit = 0, index = 0, selectArray) {
    return TestSchema.find(query)
        .sort(sortRule)
        .limit(limit)
        .skip(index)
        .select(selectArray ? selectArray.join(' ') : '')
        .exec()
        .then((document) => {
            if (!document && !document.length) {
                throw new MError(MError.FIND_NOTHING_IN_DB).setMessageTemplateData(['评测信息']);
            }
            return document
        })
        .catch((error) => {
            if (error.code && error.code !== MError.FIND_NOTHING_IN_DB) {
                throw new MError(MError.ACESS_DATABASE_ERROR, error);
            }
        })
}

/**
 * 计算匹配条件的数量
 * @param {object} query
 */
function count(query) {
    return TestSchema.count(query)
        .exec()
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
}

/**
 * 自定义查找并更新
 * @param {object} query  查找条件
 * @param {object} updateInfo 更新条件
 * @param {object} options 附加参数
 */
function findOneAndUpdate(query, updateInfo, options) {
    return TestSchema.findOneAndUpdate(
        query,
        updateInfo,
        options
    )
        .exec()
        .then((doc) => {
            if (!doc && !options.upsert) {
                throw new MError(MError.FIND_NOTHING_IN_DB).setMessageTemplateData(['评测信息']);
            }
            return gFilterDocument(doc)
        })
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
}

/* *********************************** 分割线 ******************************************** */

/**
 * 保存新的评测信息
 * @param managerDoc
 */
exports.save = (managerDoc) => {
    return new TestSchema({
        test: managerDoc
    }).save()
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument)
};

exports.find = (query, selectObj) => {
    return TestSchema.find(query, selectObj)
}

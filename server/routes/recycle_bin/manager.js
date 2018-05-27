/**
 * Created by Carlos on 2016/12/24.
 */
const subtask = require('./subtask');

/**
 * 查找并保存删除后的doc，单个操作
 * @param {object} model 被删除的doc所在的model
 * @param {object} queryCondition delete操作的查询条件
 */
exports.deleteAndSaveDoc = (model, queryCondition) => {
    return checkParamsExist({model, queryCondition})
        .then(() => subtask.checkSaveDocParame(model))
        .then(() => subtask.findDeleteDoc(model, queryCondition))
        .then(deletedDoc => subtask.deleteAndSaveDoc(deletedDoc, model, queryCondition))
        .return({})
        .catch(MError.prependCodeLine());
}

/**
 * Created by Carlos on 2016/12/24.
 */
const RecycleBinModel = require('./db/recycle_bin_model');
const Promise = require('bluebird');

/**
 * 查找需要被删除的字段
 * @param model
 * @param queryCondition
 */
exports.findDeleteDoc = (model, queryCondition) => {
    return model.findOne(queryCondition)
        .exec()
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then((deleteDoc) => {
            if (!deleteDoc) {
                throw new MError(MError.FIND_NOTHING_IN_DB).setMessageTemplateData(['被删除doc']);
            }
            return gFilterDocument(deleteDoc);
        });
}

/**
 * 检查saveDeletedDoc方法参数
 * @param model
 */
exports.checkSaveDocParame = (model) => {
    if (!model.modelName) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, `modelName=${model.modelName}`));
    }
    return Promise.resolve();
}

/**
 * 删除并保存被删除的doc
 * @param deletedDoc
 * @param model
 * @param queryCondition
 */
exports.deleteAndSaveDoc = (deletedDoc, model, queryCondition) => {
    const saveDoc = {
        dataBaseName: model.modelName,
        deletedDoc
    };
    // 异步保存被删除的doc
    RecycleBinModel.deleteAndSaveDoc(saveDoc);
    // 异步删除
    model.remove(queryCondition)
        .exec();
}

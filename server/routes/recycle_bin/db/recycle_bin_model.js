/**
 * Created by Carlos on 2016/12/24.
 */
const recycleBinSchema = require('./recycle_bin_schema');
const dbUtils = require('../../../storage/db_utils');


// 回收站model
const RecycleBinModel = dbUtils.createModel(dbUtils.dbName.recycleBin, recycleBinSchema.recycleBinSchema);
exports.RecycleBinModel = RecycleBinModel;

/** ********************外露接口************************ */

/**
 * 保存删除后的doc信息
 * @param deletedDoc
 * @returns {Promise<R>|Promise<R2|R1>|Promise.<TResult>}
 */
exports.deleteAndSaveDoc = (deletedDoc) => {
    return (new RecycleBinModel(deletedDoc)).save();
}



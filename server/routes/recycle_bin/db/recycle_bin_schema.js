/**
 * Created by Carlos on 2016/12/24.
 */
const mongoose = require('mongoose');

// 数据版本号，数据更新时需要更新版本号
exports.DATA_VERSION = 1;

const recycleBinSchema = new mongoose.Schema({
    dataBaseName: String, // 数据库名，对应于被删除doc的所在数据库
    deletedDoc: mongoose.Schema.Types.Mixed, // 被删除的doc，不关心doc的具体类型

    dataVersion: {type: Number, default: exports.DATA_VERSION}, // 数据版本号
});

// 增加创建和修改日期字段
recycleBinSchema.set('timestamps', true);

recycleBinSchema.index({}); // 索引
exports.recycleBinSchema = recycleBinSchema;

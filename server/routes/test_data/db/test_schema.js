/**
 * created by rengar 2018/05/27
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
    test: Schema.Types.Mixed,
});

exports.testSchema = testSchema;
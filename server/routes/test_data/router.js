const testModel = require('./db/test_model')
const express = require('express');
const router = express.Router();

router.post('/new')

/*testModel.save({
    nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
})*/


const a = testModel.explain().find({}, {
    'test.email': 1,
}).limit(2).skip(1).then((doc) => {
    console.dir(gFilterDocument(doc))
})
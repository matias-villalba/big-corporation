'use strict'
const DataAccessSession = require('../repositories/DataAccessSession')

module.exports = function (req, res, next) {
    req.dataAccessSession = new DataAccessSession()
    next()
}
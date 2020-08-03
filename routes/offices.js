'use strict'
const express = require('express')
const OfficeModel = require('../model/OfficeModel')

const router = express.Router()
const expandParser = require('../commons/expandParser')
const { validateId,
    validatePaginationParams,
    validateExpand } = require('../commons/requestValidator')

const DEFAULT_OFFICES_OFFSET = 0
const DEFAULT_OFFICES_LIMIT = 100


router.get('/offices/:id', async function (req, res) {
    if (!validateId(req.params.id)) {
        return res.status(400).send({ message: 'Invalid id' })
    }
    const [offices] = await req.dataAccessSession
        .getRepository(OfficeModel)
        .getById(parseInt(req.params.id), expandParser(req.query.expand))

    if (!offices) {
        res.status(404).end()
        return
    }
    res.send(offices)
})

router.get('/offices', async function (req, res) {
    if (!validatePaginationParams(req.query)) {
        return res.status(400).send({ message: 'Offset and limit must be numbers and limit must be zero or positive ' })
    }

    const limit = parseInt(req.query.limit || DEFAULT_OFFICES_LIMIT)
    const offset = parseInt(req.query.offset || DEFAULT_OFFICES_OFFSET)

    const offices = await req.dataAccessSession
        .getRepository(OfficeModel)
        .getAll({ offset, limit }, expandParser(req.query.expand))

    res.send(offices)
})

module.exports = router
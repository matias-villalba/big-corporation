'use strict'
const express = require('express')
const DepartmentModel = require('../model/DepartmentModel')

const router = express.Router()
const expandParser = require('../commons/expandParser')

const { validateId,
    validatePaginationParams,
    validateExpand } = require('../commons/requestValidator')

const DEFAULT_DEPARTMENTS_OFFSET = 0
const DEFAULT_DEPARTMENTS_LIMIT = 100

router.get('/departments/:id', async function (req, res) {
    if (!validateId(req.params.id)) {
        return res.status(400).send({ message: 'Invalid id' })
    }
    if (!validateExpand(req.query.expand, ['superdepartment'])) {
        return res.status(400).send({ message: 'Invalid expand' })
    }
    const [department] = await req.dataAccessSession
        .getRepository(DepartmentModel)
        .getById(parseInt(req.params.id), expandParser(req.query.expand))


    if (!department) {
        res.status(404).end()
        return
    }
    res.send(department)

})

router.get('/departments', async function (req, res) {
    if (!validatePaginationParams(req.query)) {
        return res.status(400).send({ message: 'Offset and limit must be numbers and limit must be zero or positive ' })
    }
    if (!validateExpand(req.query.expand, ['superdepartment'])) {
        return res.status(400).send({ message: 'Invalid expand' })
    }
    const limit = parseInt(req.query.limit || DEFAULT_DEPARTMENTS_LIMIT)
    const offset = parseInt(req.query.offset || DEFAULT_DEPARTMENTS_OFFSET)

    const departments = await req.dataAccessSession
        .getRepository(DepartmentModel)
        .getAll({ offset, limit }, expandParser(req.query.expand))

    res.send(departments)
})

module.exports = router
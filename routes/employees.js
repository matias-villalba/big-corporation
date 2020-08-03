'use strict'
const express = require('express')
const EmployeeModel = require('../model/EmployeeModel')

const router = express.Router()
const expandParser = require('../commons/expandParser')
const { validateId,
    validatePaginationParams,
    validateExpand } = require('../commons/requestValidator')
const DEFAULT_EMPLOYEES_OFFSET = 0
const DEFAULT_EMPLOYEES_LIMIT = 100


router.get('/employees/:id', async function (req, res) {
    if (!validateId(req.params.id)) {
        return res.status(400).send({ message: 'Invalid id' })
    }
    if (!validateExpand(req.query.expand, ['manager', 'department', 'office'])) {
        return res.status(400).send({ message: 'Invalid expand' })
    }
    const [employee] = await req.dataAccessSession
        .getRepository(EmployeeModel)
        .getById(parseInt(req.params.id), expandParser(req.query.expand))

    if (!employee) {
        res.status(404).end()
        return
    }
    res.send(employee)

})

router.get('/employees', async function (req, res) {
    if (!validatePaginationParams(req.query)) {
        return res.status(400).send({ message: 'Offset and limit must be numbers and limit must be zero or positive ' })
    }
    if (!validateExpand(req.query.expand, ['manager', 'department', 'office'])) {
        return res.status(400).send({ message: 'Invalid expand' })
    }
    const limit = parseInt(req.query.limit || DEFAULT_EMPLOYEES_LIMIT)
    const offset = parseInt(req.query.offset || DEFAULT_EMPLOYEES_OFFSET)

    const employees = await req.dataAccessSession
        .getRepository(EmployeeModel)
        .getAll({ offset, limit }, expandParser(req.query.expand))

    res.send(employees)
})

module.exports = router
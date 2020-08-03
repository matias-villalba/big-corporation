'use strict'
const { port } = require('./setup/config')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const employeesRoute = require('./routes/employees')
const officesRoute = require('./routes/offices')
const departmentsRoute = require('./routes/departments')
const dataAccessSessionMiddleware = require('./middlewares/dataAccessSession')

app.use(bodyParser.json())
app.use(dataAccessSessionMiddleware)

app.use(employeesRoute)
app.use(officesRoute)
app.use(departmentsRoute)

app.listen(port, () => {
    console.log(`app listening at port ${port}`)
})
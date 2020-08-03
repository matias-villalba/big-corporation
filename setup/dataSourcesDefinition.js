'use strict'
const path = require('path');

const { departamentsDsFilePath, officesDsFilePath, employeesApiUri } = require('./config').dataAccess
const exportedDefinition = {}
module.exports = exportedDefinition
const FileSystemDS = require('../repositories/connections/FileSystemDS')
const APIRestProxy = require('../repositories/connections/APIRestProxy')
const EmployeeModel = require('../model/EmployeeModel')
const OfficeModel = require('../model/OfficeModel')
const DepartmentModel = require('../model/DepartmentModel')

const datasources = {
    employeesDs: {
        models: [EmployeeModel],
        dsConnectionType: APIRestProxy,
        uri: employeesApiUri,
        resourcePathByModel: {
            EmployeeModel: '/employees'
        }
    },
    departamentsDs: {
        models: [DepartmentModel],
        dsConnectionType: FileSystemDS,
        path: path.resolve(require.main.path, departamentsDsFilePath)   //the path can be relative to project root directory or absolute
    },
    officesDs: {
        models: [OfficeModel],
        dsConnectionType: FileSystemDS,
        path: path.resolve(require.main.path, officesDsFilePath)    //the path can be relative to project root directory or absolute
    }
}

Object.keys(datasources).forEach(key => exportedDefinition[key] = datasources[key])
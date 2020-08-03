'use strict'
const coordinator = require('./coordinator')
const expandingConnectionsIterator = require('./expandingConnectionsIterator')
const dataSourcesDefinition = require('../setup/dataSourcesDefinition')
const EmployeeModel = require('../model/EmployeeModel')
const OfficeModel = require('../model/OfficeModel')
const DepartmentModel = require('../model/DepartmentModel')


const modelByExpandString = {   //it should be in other module
    manager: EmployeeModel,
    office: OfficeModel,
    department: DepartmentModel,
    superdepartment: DepartmentModel
}



class DataAccessSession {

    dsConnectionsByModel = {
        EmployeeModel: undefined,
        DepartmentModel: undefined,
        OfficeModel: undefined
    }

    getRepository = (model) => {
        const getAll = this.getAll.bind(this, model)
        const getById = this.getById.bind(this, model)
        return { getAll, getById }
    }

    getAll = (model, offsetAndLimitParams, expands = {}) => {
        const connectionsByExpandingLevelIterator = expandingConnectionsIterator(expands, this._getConnectionByExpanding)

        return coordinator.getAll(model, this._getOrCreateDsConnectionInstanceByModel(model), connectionsByExpandingLevelIterator, offsetAndLimitParams)
    }
    getById = (model, id, expands = {}) => {
        const connectionsByExpandingLevelIterator = expandingConnectionsIterator(expands, this._getConnectionByExpanding)

        return coordinator.getById(model, this._getOrCreateDsConnectionInstanceByModel(model), connectionsByExpandingLevelIterator, id)
    }


    _getConnectionByExpanding = expand => this._getOrCreateDsConnectionInstanceByModel(modelByExpandString[expand])



    _getOrCreateDsConnectionInstanceByModel = (model) => {
        if (this.dsConnectionsByModel[model]) {
            return this.dsConnectionsByModel[model]
        }

        const dataSourceDef = Object.values(dataSourcesDefinition)
            .find(dataSourceDef => dataSourceDef.models.indexOf(model) !== -1)

        const connectionModels = dataSourceDef.models

        const dsConnectionClass = dataSourceDef.dsConnectionType
        const dsConnectionInstance = new dsConnectionClass(connectionModels)

        connectionModels.forEach(modelInDsDefinition => {
            this.dsConnectionsByModel[modelInDsDefinition] = dsConnectionInstance
        })

        return dsConnectionInstance
    }



}


module.exports = DataAccessSession
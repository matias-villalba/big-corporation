'use strict'
const dataSourcesDefinition = require('../../setup/dataSourcesDefinition')
const fs = require('fs');
const DsConnection = require('./DsConnection')


let loadedData = {}
class FileSystemDS extends DsConnection {

    constructor(models) {
        super(models)
        models.forEach(model => {
            this._getJsonData(model)
        });
    }

    getAll = async (model, { offset, limit }) => {
        this._validateModel(model)
        return this._getJsonData(model)
            .then(entities => {
                const pageEntities = []
                for (let i = offset; (i < entities.length) && (i < (limit + offset)); i++) {
                    pageEntities.push(entities[i])
                }
                return pageEntities
            })
    }

    getById = async (model, id) => {
        this._validateModel(model)

        return this._getJsonData(model)
            .then(entities => this._find(entities, id))
    }

    flush = () => {
        //it is correct that flush does nothing
    }

    _find = (entities, id) => {
        return entities.find(entity => entity.id === id)
    }


    _getJsonData = async (model) => {
        const modelName = model.name
        if (loadedData[modelName]) {
            return JSON.parse(JSON.stringify(loadedData[modelName]))
        }

        const filePath = this._getPathByModel(model)

        const data = fs.readFileSync(filePath, 'utf8')

        loadedData[modelName] = JSON.parse(data)
        return JSON.parse(JSON.stringify(loadedData[modelName]))

    }

    _getPathByModel = (model) => {
        const dsConfig = Object.values(dataSourcesDefinition)
            .find(dsConfig => dsConfig.models.find(m => m === model))

        if (!dsConfig) {
            throw new Error(`There is not a valid data source config for model : ${this._getModelName(model)}`)
        }
        return dsConfig.path
    }
}



module.exports = FileSystemDS
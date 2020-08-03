'use strict'
const dataSourcesDefinition = require('../../setup/dataSourcesDefinition')
const DsConnection = require('./DsConnection')
const Deferred = require('../../commons/Deferred')
const axios = require('axios');


class APIRestProxy extends DsConnection {

    constructor(models) {
        super(models)
        this.deferredByModelRequestedId = {}
        this.getAllDeferredByModel = {}
    }


    getAll = async (model, { offset, limit }) => {
        this._validateModel(model)

        if (!this.getAllDeferredByModel[model.name]) {

            const deferred = new Deferred()

            this.getAllDeferredByModel[model.name] = {
                deferred,
                params: { offset, limit }
            }
        }
        return this.getAllDeferredByModel[model.name].deferred.promise

    }

    getById = async (model, id) => {
        this._validateModel(model)

        if (!this.deferredByModelRequestedId[model.name]) {
            this.deferredByModelRequestedId[model.name] = {}
        }
        if (!this.deferredByModelRequestedId[model.name][id]) {
            const deferred = new Deferred()
            this.deferredByModelRequestedId[model.name][id] = deferred
        }

        return this.deferredByModelRequestedId[model.name][id].promise
    }

    flush = () => {
        this._flushRequestsWithPagination()
        this._flushRequestsById()
    }

    _createIdsQuerystringParams = (ids) => 'id=' + ids.join('&id=')

    _crateUriForRequestsById = (model) => {
        const path = this._modelToResourcePath(model)
        const ids = Object.keys(this.deferredByModelRequestedId[model])
        const queryparams = this._createIdsQuerystringParams(ids)
        return `${this._getUriByModel(model)}${path}?${queryparams}`
    }

    _processResponseWithDataById = (response, model) => {
        const { data } = response
        data.forEach(entity => {
            const deferred = this.deferredByModelRequestedId[model][entity.id]
            if (!deferred) {
                delete this.deferredByModelRequestedId[model][entity.id]
                return
            }
            this.deferredByModelRequestedId[model][entity.id] = undefined
            delete this.deferredByModelRequestedId[model][entity.id]
            deferred.resolve(entity)
        })
    }
    _handleErrorResponseInDataById = (e, uri, model) => {
        console.log(`error retrieving data with uri: ${uri}`)
        Object.keys(this.deferredByModelRequestedId[model])
            .forEach(id => {
                const deferred = this.deferredByModelRequestedId[model][id]
                this.deferredByModelRequestedId[model][id] = undefined
                delete this.deferredByModelRequestedId[model][id]
                deferred.reject(e)
            })
    }

    _flushRequestsById = () => {
        Object.keys(this.deferredByModelRequestedId)
            .forEach(model => {
                const uri = this._crateUriForRequestsById(model)
                axios.get(uri)
                    .then(response => {
                        this._processResponseWithDataById(response, model)
                        Object.keys(this.deferredByModelRequestedId[model])
                            .forEach(pendingId => {
                                const deferred = this.deferredByModelRequestedId[model][pendingId]
                                this.deferredByModelRequestedId[model][pendingId] = undefined
                                delete this.deferredByModelRequestedId[model][pendingId]
                                if (deferred) {
                                    deferred.reject(new Error(`external server did not return entity with id:${pendingId}`))
                                }
                            })
                    })
                    .catch(e => {
                        this._handleErrorResponseInDataById(e, uri, model)
                    })

            })

    }

    _flushRequestsWithPagination = () => {
        Object.keys(this.getAllDeferredByModel)
            .forEach(model => {
                const path = this._modelToResourcePath(model)

                const params = this.getAllDeferredByModel[model].params
                const queryparams = `offset=${params.offset}&limit=${params.limit}`

                const uri = `${this._getUriByModel(model)}${path}?${queryparams}`
                axios.get(uri)
                    .then(response => {
                        const deferred = this.getAllDeferredByModel[model].deferred
                        this.getAllDeferredByModel[model] = undefined
                        delete this.getAllDeferredByModel[model]
                        return deferred.resolve(response.data)
                    })
                    .catch(e => {
                        const deferred = this.getAllDeferredByModel[model].deferred
                        this.getAllDeferredByModel[model] = undefined
                        delete this.getAllDeferredByModel[model]
                        return deferred.reject(new Error(e))
                    })

            })
    }

    _getDsConfigByModel = (model) => {
        const dsConfig = Object.values(dataSourcesDefinition)
            .find(dsConfig => dsConfig.models.find(m => {
                return m.name === model
            }))

        if (!dsConfig) {
            throw new Error(`There is not a valid data source config for model : ${this._getModelName(model)}`)
        }
        return dsConfig
    }
    _getUriByModel = (model) => {
        return this._getDsConfigByModel(model).uri
    }

    _modelToResourcePath = (model) => {
        return this._getDsConfigByModel(model).resourcePathByModel[model]
    }

}

module.exports = APIRestProxy
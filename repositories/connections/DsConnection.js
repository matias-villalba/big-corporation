'use strict'
class DsConnection {

    constructor(models = []) {
        this.models = models
    }

    getModels = () => this.models

    hasModel = (aModel) => this.models.indexOf(aModel) !== -1

    getAll = (model, { offset, limit }) => {
        throw new Error('getAll method must be implemented in subclass')
    }

    getById = (model, id) => {
        throw new Error('getById method must be implemented in subclass')
    }

    flush = () => {
        throw new Error('flush method must be implemented in subclass')
    }

    _validateModel = (model) => {
        if (!this.hasModel(model)) {
            throw new Error(`connection is not created with model model: ${this._getModelName(model)}`)
        }

    }

    _getModelName(model) {
        return `${model && model.constructor && model.constructor.name ? model.constructor.name : JSON.stringify(model)}`
    }

}




module.exports = DsConnection
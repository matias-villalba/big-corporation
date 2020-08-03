'use strict'

class Mapper {

    constructor() {
        this._mapFunctions = []
    }

    add = (object, property, valuePromise) => {
        this._mapFunctions.push(async () => object[property] = await valuePromise)
        return this
    }

    map = async () => {
        return Promise.all(this._mapFunctions.map(mapFunction => mapFunction()))
    }
}

module.exports = Mapper
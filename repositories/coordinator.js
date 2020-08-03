'use strict'
const Mapper = require('./Mapper')
const Model = require('../model')

module.exports.getById = async function (model, rootEntityDsConnection, connectionsListsIterator, id) {

    const entityPromise = rootEntityDsConnection.getById(model, id)
    rootEntityDsConnection.flush()

    const entity = await entityPromise

    const entitiesByMode = {}
    entitiesByMode[model.name] = [entity]
    return getEntitiesMappedWithExpands(entitiesByMode, [entity], connectionsListsIterator)
}

module.exports.getAll = async function (model, rootEntityDsConnection, connectionsListsIterator, offsetAndLimitParams) {

    const entitiesPromise = rootEntityDsConnection.getAll(model, offsetAndLimitParams)
    rootEntityDsConnection.flush()

    const entities = await entitiesPromise

    const entitiesByMode = {}
    entitiesByMode[model.name] = entities
    return getEntitiesMappedWithExpands(entitiesByMode, entities, connectionsListsIterator)
}

async function getEntitiesMappedWithExpands(entitiesByModel, rootEntities, connectionsListsIterator) {

    const expandingItem = connectionsListsIterator.next()
    const currentEntityExpdingLevelConnections = expandingItem.value
    if (!currentEntityExpdingLevelConnections || currentEntityExpdingLevelConnections.length === 0) {
        return rootEntities
    }
    const expandingEntitiesPromisesByModel = {}
    const mapper = new Mapper()
    Object.keys(entitiesByModel).forEach(parentEntityModelName => {

        entitiesByModel[parentEntityModelName].forEach((entity) => {
            const parentEntityModel = Model[parentEntityModelName]
            Object.keys(entity).forEach(property => {
                if (!parentEntityModel.properties[property] || !parentEntityModel.properties[property].foreignKey || !entity[property]) {
                    return
                }
                const expandingModel = parentEntityModel.properties[property].type
                const expandingConnection = currentEntityExpdingLevelConnections.find(connection => connection.hasModel(expandingModel))
                if (!expandingConnection) {   //if there is not a connection it means expands for this connection was not requested
                    return
                }
                const expandingEntityPromise = expandingConnection.getById(expandingModel, entity[property])

                mapper.add(entity, property, expandingEntityPromise)

                if (!expandingEntitiesPromisesByModel[expandingModel.name]) {
                    expandingEntitiesPromisesByModel[expandingModel.name] = new Set()
                }
                expandingEntitiesPromisesByModel[expandingModel.name].add(expandingEntityPromise)

            })

        })
    })

    currentEntityExpdingLevelConnections.forEach(connection => connection.flush())

    await mapper.map()

    const expEntitiesByModel = {}
    for (const modelName in expandingEntitiesPromisesByModel) {
        const entities = await Promise.all(Array.from(expandingEntitiesPromisesByModel[modelName]))
        expEntitiesByModel[modelName] = entities
    }

    return getEntitiesMappedWithExpands(expEntitiesByModel, rootEntities, connectionsListsIterator)
}



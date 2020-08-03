'use strict'


module.exports = function* (expands = {}, connectionByExpandGetter) {
    if (!expands || Object.keys(expands).length === 0) {
        return []
    }
    let currentExpandingNodes = [expands]

    while (currentExpandingNodes.length > 0) {
        let connectionsInCurrentExpandingLevel = getKeys(currentExpandingNodes)
            .map(expand => connectionByExpandGetter(expand))
        yield connectionsInCurrentExpandingLevel

        currentExpandingNodes = getExpandingNodes(currentExpandingNodes)
    }

    return []

}

const getKeys = (expandsObjList) =>
    Array.from(new Set(
        expandsObjList.map(expandsObj => Object.keys(expandsObj))
            .reduce((allExpandsStrings, currentExpandsStrings) => allExpandsStrings.concat(currentExpandsStrings), [])
    ))

const getExpandingNodes = (expandsObjList) =>
    expandsObjList.map(expandsObj => Object.values(expandsObj)
        .filter(obj => obj && Object.keys(obj).length > 0)
    ).reduce((allExpandingNodes, currentExpandingNodes) => allExpandingNodes.concat(currentExpandingNodes), [])



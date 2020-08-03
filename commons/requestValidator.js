
module.exports.validateId = (id) => {
    return !isNaN(parseInt(id))
}

module.exports.validatePaginationParams = ({ offset, limit }) => {
    const offsetAsInt = parseInt(offset || 0)
    const limitAsInt = parseInt(limit || 1)
    return (!isNaN(limitAsInt) && !isNaN(offsetAsInt) &&
        limitAsInt > 0 && limitAsInt <= 1000 && offsetAsInt >= 0)
}

const validExpand = {
    manager: ['manager', 'department', 'office'],
    office: [],
    department: ['superdepartment'],
    superdepartment: ['superdepartment']
}

module.exports.validateExpand = (expand, validExpandsForResource) => {
    const expandList = [].concat(expand)

    for (let i = 0; i < expandList.length; i++) {
        const expandWithLevels = expandList[i].split('.')
        for (let deepLevel = 0; deepLevel < expandWithLevels.length; deepLevel++) {
            if (deepLevel === 0) {
                if (!validExpandsForResource.includes(expandWithLevels[deepLevel])) {
                    return false
                }
                continue
            }
            const currentExpand = expandWithLevels[deepLevel]
            const prevoiusExpand = expandWithLevels[deepLevel - 1]

            if (!validExpand[prevoiusExpand].includes(currentExpand)) {
                return false
            }
        }
    }
    return true
}

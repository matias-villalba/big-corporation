function parser(expand) {
    if (!expand) {
        return {};
    }
    const expands = [].concat(expand);

    const expandsAsArrays = expands.map(expandString => expandString.split('.'))
    const indexOfExpandWithMoreLevels = expandsAsArrays.reduce((indexWithMax, currentExpand, currentIndex, src) => {
        const deepLevel = currentExpand.length
        const max = src[indexWithMax].length
        return max > deepLevel ? indexWithMax : currentIndex
    }, 0)

    const expandsInLevels = expandsAsArrays[indexOfExpandWithMoreLevels].map((val, index) =>
        expandsAsArrays.map(row => row[index]))

    return crateExpandTree(expandsInLevels, expandsAsArrays)
}

function crateExpandTree(expandsInLevels, expandsAsArrays) {
    const root = {}
    let parentNodeByIndex = {}

    for (let deepLevel = 0; deepLevel < expandsInLevels.length; deepLevel++) {
        if (deepLevel === 0) {
            expandsInLevels[deepLevel].forEach((key, index) => {
                if (!key) {
                    return
                }
                if (!(key in root)) {
                    root[key] = {}
                }
                parentNodeByIndex[index] = root[key]
            })
            continue
        }
        expandsInLevels[deepLevel].forEach((key, index) => {
            if (!key) {
                return
            }
            if (parentNodeByIndex[index] && !(key in parentNodeByIndex[index])) {
                parentNodeByIndex[index][key] = {}
            }
            if (parentNodeByIndex[index] && deepLevel < expandsAsArrays[index].length) {
                parentNodeByIndex[index] = parentNodeByIndex[index][key]
            }
        })
    }
    return root
}

module.exports = parser



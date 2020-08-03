const expandParser = require('../commons/expandParser')
const assert = require('assert')


describe('expandParser unit test', function () {


    it('should get the expands as an object with the correct structure', () => {

        const expectedStructure = {
            manager: {
                department: {
                    superdepartment: {}
                }
            }
        }
        const result = expandParser('manager.department.superdepartment')
        JSON.stringify(expectedStructure)
        assert(JSON.stringify(result), JSON.stringify(expectedStructure))

    })

    it('should get the expands as an object with the correct structure passing an expand array', () => {

        const expectedStructure = {
            manager: {
                department: {
                    superdepartment: {}
                },
                office: {},
                manager: {
                    department: {}
                }
            }
        }
        const result = expandParser(['manager.department.superdepartment', 'manager.office', 'manager.manager.department'])
        JSON.stringify(expectedStructure)
        assert(JSON.stringify(result), JSON.stringify(expectedStructure))

    })

})
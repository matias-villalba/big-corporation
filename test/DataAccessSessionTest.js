'use strict'
const path = require('path')
const dataSources = require('../setup/dataSourcesDefinition')
dataSources.departamentsDs.path = path.normalize(__dirname + '/../resources/departments.json')

const DataAccessSession = require('../repositories/DataAccessSession')
const DepartmentModel = require('../model/DepartmentModel')
const assert = require('assert')

const allDepartments = require('../resources/departments')
describe('DataAccessSession integration test', function () {

    it('should create a DataAccessSession and get all departments', async () => {

        const session = new DataAccessSession()
        const departments = await session.getRepository(DepartmentModel)
            .getAll({ limit: 1000, offset: 0 })

        departments.forEach((element, index) => {

            const expectedDepartment = allDepartments[index]

            for (const key in expectedDepartment) {
                assert.equal(element[key], expectedDepartment[key])
            }

        });

    })

    it('should create a DataAccessSession and get all departments with expand to superdepartment', async () => {

        const session = new DataAccessSession()
        const departments = await session.getRepository(DepartmentModel)
            .getAll({ limit: 1000, offset: 0 }, { superdepartment: {} })

        departments.forEach((element, index) => {

            const expectedDepartment = allDepartments[index]

            for (const key in expectedDepartment) {
                if (key === 'superdepartment' && expectedDepartment[key]) {

                    assert.ok(element[key])

                    const superdepartment = element[key]
                    const superpepartmentExpected = expectedDepartment[expectedDepartment[key]]
                    for (const key in superpepartmentExpected) {
                        assert.equal(superdepartment[key], superpepartmentExpected[key])

                    }

                } else {
                    assert.equal(element[key], expectedDepartment[key])
                }

            }

        });

    })

})
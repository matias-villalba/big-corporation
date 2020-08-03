
const DepartmentModel = require('./DepartmentModel')
const OfficeModel = require('./OfficeModel')

function EmployeeModel() { }

const schema = {

    properties: {
        first: { type: String },
        last: { type: String },
        id: { type: Number },
        manager: {
            foreignKey: true,
            type: EmployeeModel
        },
        department: {
            foreignKey: true,
            type: DepartmentModel
        },
        office: {
            foreignKey: true,
            type: OfficeModel
        }
    }


}

Object.keys(schema).forEach(schemaField => EmployeeModel[schemaField] = schema[schemaField])

module.exports = EmployeeModel
'use strict'
function DepartmentModel() { }

const schema = {

    properties: {
        name: { type: String },
        id: { type: Number },
        superdepartment: {
            foreignKey: true,
            type: DepartmentModel
        }
    }

}

Object.keys(schema).forEach(schemaField => DepartmentModel[schemaField] = schema[schemaField])

module.exports = DepartmentModel
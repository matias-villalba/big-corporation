'use strict'

function OfficeModel() { }

const schema = {

    properties: {
        city: { type: String },
        country: { type: String },
        address: { type: String },
        id: { type: Number },
    }

}

Object.keys(schema).forEach(schemaField => OfficeModel[schemaField] = schema[schemaField])


module.exports = OfficeModel
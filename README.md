### "Big corporation api"

The DataAccessSession class is instantiated per request. It is done by the middleware : 'dataAccessSession'

This way you can get the DataAccessSession instance from the req object and then call getRepository passing the model. 

APIRestProxy is a proxy to the external service. What apiRestProxy does is to avoid calling too many times to the external server.

The config file is at: ./setup/config.json

Run:
npm start

Test:
npm test

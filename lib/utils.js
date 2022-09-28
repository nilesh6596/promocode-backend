const mongoose = require('mongoose')
const logger = require('pino')({ level: 'debug' });
const jwt = require('jsonwebtoken')

module.exports = {

    pino: require('pino'),
    bcrypt: require("bcryptjs"),
    autoIncrement: require('mongoose-plugin-autoinc'),
    
    responseGenerators: function (responseData, responseStatusCode, responseStatusMsg, responseErrors, token) {
        const responseJson = {};
        responseJson['data'] = responseData;
        responseJson['status_code'] = responseStatusCode;
        responseJson['status_message'] = responseStatusMsg;
        // errors
        if (responseErrors === undefined) {
            responseJson['response_error'] = [];
        } else {
            responseJson['response_error'] = responseErrors;
        }       
        // token
        if (token !== undefined) {
            responseJson['token'] = token;
        }
        return responseJson;
    },

    connect: function (dbName) {
        mongoose.connect(`mongodb://localhost:27017/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'Error while connecting to database:'));
        db.once('open', function () {
            logger.debug('Db connected successfully');
        });
        return db;
    },

    generateToken: function (shop, secretKey) {
        shop.date = Date.now;
        return jwt.sign({ shop: shop }, secretKey.toString(), { expiresIn: '12h' });
    }

}

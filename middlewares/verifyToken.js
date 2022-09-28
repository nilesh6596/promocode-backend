const jwt = require('jsonwebtoken')
const { responseGenerators, pino } = require('./../lib/utils')
const httpStatusCode = require('http-status-codes')
const logger = pino({ level: 'debug' });

const verifyToken = async (req, res, next) => {
    try {
        jwt.verify(req.headers.token, req.headers.shop_code.toString(), function (error) {
            if (error) {
                return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.UNAUTHORIZED, 'You are not allowed to do this action', true));
            }
            next();
        });
    } catch (error) {
        logger.warn(`Error while verifying token : %j %s`, error, error)
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, 'Error while verifying token', true));
    }
}

module.exports = {
    verifyToken
}
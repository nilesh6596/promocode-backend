const promotionCodeService = require('../services/promotionCode');
const httpStatusCode = require('http-status-codes');
const {
    responseGenerators,
    pino
} = require('../lib/utils');
const logger = pino({
    level: 'debug'
});
const Joi = require('joi');

const promotionCodeSchema = Joi.object().keys({
    promocodeName: Joi.string().min(3).max(30).required(),
    promocodeDiscount: Joi.string().required(),
    promocodeStatus: Joi.string().max(30).required().valid('Active', 'Inactive', 'Pending approval'),
    promocodeType: Joi.string().max(30).required().valid('Party share', 'Gift card'),
    promocodeStartDate: Joi.number().required(),
    promocodeEndDate: Joi.number().required()
});

const addPromotionCodeData = async (req, res) => {
    try {
        const promocodePayload = req.body;
        const joiValidate = await promotionCodeSchema.validate(promocodePayload);
        if (!joiValidate.error) {
            const promocodeResponse = await promotionCodeService.insertPromotionCodeData(promocodePayload);
            if (Array.isArray(promocodeResponse) && promocodeResponse.length > 0) {
                return res.status(httpStatusCode.OK).send(responseGenerators(promocodeResponse, httpStatusCode.OK, 'Data added successfully', false));
            }
            return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, promocodeResponse, true));
        } else {
            return res.status(httpStatusCode.BAD_REQUEST).send(responseGenerators({}, httpStatusCode.OK, `Invalid Body: ${JSON.stringify(joiValidate.error.details)}` , true));
        }
    } catch (error) {
        logger.warn(`Error while adding data. Error: %j %s`, error, error);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, 'Error while adding data', true));
    }
};

const getAllPromotionCodeData = async (req, res) => {
    try {
        const payload = req.body;
        const response = await promotionCodeService.getAllPromotionCodeData(payload);
        if (response && response.length <= 0) {
            return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, 'No data exist..!', true));
        }
        return res.status(httpStatusCode.OK).send(responseGenerators(response, httpStatusCode.OK, 'Data fetched successfully', false));
    } catch (error) {
        logger.warn(`Error while fetch data. Error: %j %s`, error, error);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, 'Error while fetch data', true));
    }
};

const getPromotionCodeDataById = async (req, res) => {
    try {
        const promocodeId = Number(req.params.promocodeId);
        const response = await promotionCodeService.getPromotionCodeDataByCode(promocodeId);
        if (response && response.length <= 0) {
            return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, 'No data exist..!', true));
        }
        return res.status(httpStatusCode.OK).send(responseGenerators(response[0], httpStatusCode.OK, 'Data fetched successfully', false));
    } catch (error) {
        logger.warn(`Error while fetch data. Error: %j %s`, error, error);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, 'Error while fetch data', true));
    }
};

const editPromotionCodeData = async (req, res) => {
    try {
        const promocodeId = Number(req.body.promocodeId);
        const promocodePayload = req.body;
        const response = await promotionCodeService.editPromotionCodeData(promocodePayload, promocodeId);
        if (Array.isArray(response) && response.length <= 0) {
            return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, 'No data exist..!', true));
        } else if (response == true) {
            return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, 'Promotion code name already exists', true));
        }
        return res.status(httpStatusCode.OK).send(responseGenerators(response, httpStatusCode.OK, 'Data updated successfully', false));
    } catch (error) {
        logger.warn(`Error while update data. Error: %j %s`, error, error);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, 'Error while update data', true));
    }
};

const deletePromotionCodeData = async (req, res) => {
    try {
        const promocodeId = Number(req.query.promocodeId);
        const response = await promotionCodeService.deletePromotionCodeData(promocodeId);
        if (response && response.length <= 0) {
            return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, 'No data deleted', true));
        }
        return res.status(httpStatusCode.OK).send(responseGenerators(response, httpStatusCode.OK, 'Data deleted successfully', false));
    } catch (error) {
        logger.warn(`Error while delete data. Error: %j %s`, error, error);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, 'Error while delete data', true));
    }
};


module.exports = {
    addPromotionCodeData,
    getAllPromotionCodeData,
    editPromotionCodeData,
    deletePromotionCodeData,
    getPromotionCodeDataById,
};
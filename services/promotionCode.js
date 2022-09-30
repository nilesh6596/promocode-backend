'use strict';

const db = require('../models/promotionCode');
const {
    pino,
} = require('../lib/utils');
const logger = pino({
    level: 'debug'
});

const insertPromotionCodeData = async (reqPayload) => {
    try {
        logger.debug('insertPromotionCodeData() reqPayload: %j', reqPayload);
        const promotionCodeModel = db.model('promotionCodes');
        const promocodeData = await promotionCodeModel.find({
            promocodeName: reqPayload.promocodeName
        });
        if (promocodeData.length > 0) {
            return 'Promotion Code already exists.';
        }
        const response = await promotionCodeModel.insertMany(reqPayload);
        return response;
    } catch (error) {
        logger.warn(`Error while insertPromotionCodeData(). Error = %j %s`, error, error);
        throw error;
    }
};

const getAllPromotionCodeData = async (reqPayload) => {
    try {
        logger.debug('getAllPromotionCodeData() reqPayload: %j', reqPayload);
        const promotionCodeModel = db.model('promotionCodes');
        const aggregareQuery = await getPipelineQuery(null, reqPayload);
        let aggregatecount = aggregareQuery.concat([{
            $count: "total_data",
        }]);
        const responseCount = await promotionCodeModel.aggregate(aggregatecount);
        if (responseCount < 0) {
            return responseCount;
        }

        let page_index = Number(reqPayload.pageIndex) || 0;
        let page_size = Number(reqPayload.pageSize) || 50;
        let pageIndex = page_size * page_index;
        let pageSize = page_size;

        aggregareQuery.push({
            $skip: Number(pageIndex),
        });
        aggregareQuery.push({
            $limit: Number(pageSize),
        });
        const response = await promotionCodeModel.aggregate(aggregareQuery);
        const finalRes = {
            promocodeData: response,
            totalCount: responseCount && responseCount.length ? responseCount[0]['total_data'] : 0
        };
        return finalRes;
    } catch (error) {
        logger.warn(`Error while getAllPromotionCodeData(). Error = %j %s`, error, error);
        throw error;
    }
};

const getPromotionCodeDataByCode = async (promocodeId) => {
    try {
        logger.debug('getPromotionCodeDataByCode() promocodeId: %s', promocodeId);
        const promotionCodeModel = db.model('promotionCodes');
        const aggregareQuery = await getPipelineQuery(promocodeId);
        const response = await promotionCodeModel.aggregate(aggregareQuery);
        return response;
    } catch (error) {
        logger.warn(`Error while getPromotionCodeDataByCode(). Error = %j %s`, error, error);
        throw error;
    }
};

const editPromotionCodeData = async (reqPayload, promocodeId) => {
    try {
        logger.debug('editPromotionCodeData() reqPayload: %j, promocodeId: %s', reqPayload, promocodeId);
        const promotionCodeModel = db.model('promotionCodes');
        const promocodeData = await promotionCodeModel.find({
            promocodeId: promocodeId,
            deleted: false,
        });
        if (promocodeData && promocodeData.length <= 0) {
            return [];
        }

        if (reqPayload.oldPromocodeName != reqPayload.promocodeName) {
            const promocodeDataExists = await promotionCodeModel.find({
                promocodeName: reqPayload.promocodeName
            });
            if (promocodeDataExists.length > 0) {
                return true;
            }
        }

        const response = await promotionCodeModel.findOneAndUpdate({
            promocodeId: promocodeId,
            deleted: false,
        }, {
            $set: {
                promocodeName: reqPayload.promocodeName,
                promocodeDiscount: reqPayload.promocodeDiscount,
                promocodeStatus: reqPayload.promocodeStatus,
                promocodeType: reqPayload.promocodeType,
                promocodeStartDate: reqPayload.promocodeStartDate,
                promocodeEndDate: reqPayload.promocodeEndDate,
                ts_last_update: new Date().getTime()
            }
        }, {
            upsert: true,
            new: true,
        });
        return [response];
    } catch (error) {
        logger.warn(`Error while editPromotionCodeData(). Error = %j %s`, error, error);
        throw error;
    }
};

const deletePromotionCodeData = async (promocodeId) => {
    try {
        logger.debug('deletePromotionCodeData() promocodeId: %s', promocodeId);
        const promotionCodeModel = db.model('promotionCodes');
        const promocodeData = await promotionCodeModel.find({
            promocodeId: promocodeId,
            deleted: false
        })
        if (promocodeData && promocodeData.length <= 0) {
            return [];
        }
        const response = await promotionCodeModel.findOneAndUpdate({
            promocodeId: promocodeId,
        }, {
            $set: {
                deleted: true,
                ts_deleted_date: new Date().getTime()
            }
        }, {
            upsert: true,
            new: true,
        });
        return [response];
    } catch (error) {
        logger.warn(`Error while deletePromotionCodeData(). Error = %j %s`, error, error);
        throw error;
    }
};

const getPipelineQuery = async (promocodeId, reqPayload = null) => {
    let aggregatePipeline = [];
    let searchQuery = [];
    let sortPromotionCode = {
        promocodeId: -1
    };

    let matchQuery = {
        $and: [
            {
                deleted: false,
            }
        ],
    };

    if (promocodeId) {
        matchQuery['$and'].push({
            promocodeId: {
                $eq: promocodeId
            }
        });
    }

    if (reqPayload && reqPayload.promocodeStatus) {
        matchQuery['$and'].push({
            promocodeStatus: {
                $eq: reqPayload.promocodeStatus
            }
        });
    }

    aggregatePipeline.push({
        $match: matchQuery
    });

    aggregatePipeline.push({
        $project: {
            _id: 0,
            promocodeId: 1,
            promocodeName: 1,
            promocodeDiscount: 1,
            promocodeStatus: 1,
            promocodeType: 1,
            promocodeStartDate: 1,
            promocodeEndDate: 1,
        },
    });

    aggregatePipeline.push({
        $sort: sortPromotionCode
    });

    if (reqPayload && reqPayload.promocodeSearch) {
        let searchValue = reqPayload.promocodeSearch || '';
        searchValue = searchValue.replace(/^\s+|\s+$/g, '');
        searchValue = searchValue.replace(/ +(?= )/g, '');
        searchQuery = {
            $and: [{
                'promocodeName': {
                    "$regex": searchValue,
                    '$options': 'i'
                }
            }]
        };
        aggregatePipeline.push({
            $match: searchQuery
        });
    }

    return aggregatePipeline;
};

module.exports = {
    insertPromotionCodeData,
    getAllPromotionCodeData,
    getPromotionCodeDataByCode,
    editPromotionCodeData,
    deletePromotionCodeData,
}
/* mongoDB schema configuration for promotionCodes */
'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-long')(mongoose);
const {
    autoIncrement
} = require('../lib/utils');

const PromotionCodesSchema = new Schema({
    promocodeId: {
        type: Number,
        required: true
    },
    promocodeName: {
        type: String,
        required: true
    },
    promocodeDiscount: {
        type: String,
        required: true
    },
    promocodeStatus: {
        type: String,
        required: true
    },
    promocodeType: {
        type: String,
        required: true
    },
    promocodeStartDate: {
        type: Number,
        required: true
    },
    promocodeEndDate: {
        type: Number,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    ts_deleted_date: {
        type: Number,
        default: null
    },
    ts_last_update: {
        type: Number,
        default: new Date().getTime()
    },
    timezone: {
        type: String
    },
}, {
    versionKey: false
}).index({
    promocodeName: 1
}, {
    unique: true
});

PromotionCodesSchema.plugin(autoIncrement.plugin, {
    model: 'promotionCodes',
    field: 'promocodeId',
    startAt: 1
});

module.exports = mongoose.model('promotionCodes', PromotionCodesSchema);
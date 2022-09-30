const express = require('express');
const router = express.Router();
const promotionCodeController = require('../controllers/promotionCode');
const {
    verifyToken
} = require('../middlewares/verifyToken');

router.post('/promocode/add', promotionCodeController.addPromotionCodeData);
router.post('/promocode/getAll', promotionCodeController.getAllPromotionCodeData);
router.get('/promocode/get/:promocodeId', promotionCodeController.getPromotionCodeDataById);
router.delete('/promocode/delete/:promocodeId', promotionCodeController.deletePromotionCodeData);
router.put('/promocode/update', promotionCodeController.editPromotionCodeData);

module.exports = router;

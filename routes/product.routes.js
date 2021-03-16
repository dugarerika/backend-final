const productCtrl = require('../controllers/product.controller');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const shopCtrl = require('../controllers/shop.controller');
var express = require('express');
const router = express.Router();

router
	.route('/api/products/by/:userId')
	.post(authCtrl.requireSignin, productCtrl.create)
	.get(productCtrl.listByShop);

router
	.route('/api/products/latest')
	.get(productCtrl.listLatest);

router
	.route('/api/products/related/:productId')
	.get(productCtrl.listRelated);

router
	.route('/api/products/categories')
	.get(productCtrl.listCategories);

router.route('/api/products').get(productCtrl.list);

router
	.route('/api/products/:productId')
	.get(productCtrl.read);

router
	.route('/api/product/image/:productId')
	.get(productCtrl.photo, productCtrl.defaultPhoto);

router
	.route('/api/product/defaultphoto')
	.get(productCtrl.defaultPhoto);

router
	.route('/api/product/:userId/:productId')
	.put(authCtrl.requireSignin, productCtrl.update)
	.delete(authCtrl.requireSignin, productCtrl.remove);

router.param('shopId', shopCtrl.shopByID);
router.param('userId', userCtrl.userByID);
router.param('productId', productCtrl.productByID);

module.exports = router;

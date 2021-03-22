const authCtrl = require('../controllers/auth.controller');
var express = require('express');
const router = express.Router();

router.route('/auth/signin').post(authCtrl.signin);
router.route('/auth/signout').get(authCtrl.signout);
// router.route('/auth/reset').get(authCtrl.reset);

module.exports = router;

const express = require('express');
const Account = require('../models/accounts');

const auth = require('../middleware/auth');

const router = express.Router();

const { login, getAuth, getAccountByToken } = require('../controllers/auth_controller');

/////////////// Swagger Model Definition /////////////////
/**
 * Toasters y Customers heredarían las propiedades de este tipo.
 * @typedef Account
 * @property {string} userName.required
 * @property {string} password.required
 * @property {string} email.required
 * @property {boolean} isCustomer.required - Autogenerado
 * @property {Date} updated - Última fecha en que se actualizó el perfil
 */


/**
 * @route POST /auth/login
 * @group authentication - login/logout
 * @returns {object} 201 - Logged user
 * @returns {Error}  401 - Error while logging user
 */
router.route('/login').post(login);


/**
 * @route GET /auth
 * @group authentication - login/logout
 * @returns {object} 201 - Get account by stored token (used for frontend)
 */
router.route('/').get(auth, getAuth);


/**
 * @route GET /auth/{token}
 * @group authentication - login/logout
 * @param {string} token.query.required - JWT token
 * @returns {object} 201 - Authenticated user, giving user id
 * @returns {Error}  401 - Error while checking token
 */

router.route('/:token').get(getAccountByToken);


module.exports = router; 
const { Router } = require('express');
const auth = require('../middleware/auth');

const { login, getAuth, getAccountByToken } = require('../controllers/auth_controller');

class AuthRoutes {
    constructor(apiPrefix, router) {
        const apiUrl = apiPrefix + "/auth";
        /////////////// Swagger Model Definition /////////////////
        /**
         * Toasters y Customers heredarían las propiedades de este tipo.
         * @typedef Account
         * @property {string} username.required
         * @property {string} password.required
         * @property {string} email.required
         * @property {boolean} isCustomer.required - Autogenerado
         * @property {Date} createdAt.required - Autogenerado - Fecha de creación
         * @property {Date} updatedAt.required - Autogenerado - Fecha de actualización
         */

        /////////////// Routes /////////////////
        /**
         * @route POST /auth/login
         * @group authentication - login/token
         * @returns {object} 200 - Logged user info and token
         * @returns {Error}  400 - Error while logging user
         */
        router.post(apiUrl + '/login', login);

        /**
         * @route GET /auth
         * @group authentication - login/token
         * @returns {object} 200 - Get account by stored token (used for frontend)
         * @returns {Error}  500 - Server error
         */
        router.get(apiUrl, auth, getAuth);

        /**
         * @route GET /auth/{token}
         * @group authentication - login/token
         * @param {string} token.query.required - JWT token
         * @returns {object} 201 - Authenticated user, giving user id
         * @returns {Error}  401 - Error while checking token
         * @returns {Error}  500 - Invalid token
         */
        router.get(apiUrl + '/:token', getAccountByToken);
    }
}


module.exports = AuthRoutes;

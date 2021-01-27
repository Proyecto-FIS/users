const { Router } = require('express');
const multer = require("multer")
const upload = multer({ dest: "" })
const Validators = require("../middleware/Validators");

class CustomerRoutes { 
    constructor(apiPrefix, router) {
        const { getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer_controller');
        const apiUrl = apiPrefix + "/customers";

        /////////////// Swagger Model Definition /////////////////
            /**
             * @typedef Customer
             * @property {string} pictureUrl
             * @property {string} address
             * @property {integer} stripe_id.required - Autogenerado
             * @property {Account.model} account.required
             * @property {Date} createdAt.required - Autogenerado - Fecha de creación
             * @property {Date} updatedAt.required - Autogenerado - Fecha de actualización
             */

        /////////////// Routes /////////////////
        /**
         * @route GET /customers/{accountId}
         * @group customers - customers operations
         * @param {string} accountId.query.required - Account id required
         * @returns {object} 200 - The customer with given account id
         * @returns {Error}  404 - Customer not found
         */
        router.get(apiUrl + '/:accountId', getCustomer);

        /**
         * @route POST /customers
         * @group customers - customers operations
         * @returns {object} 201 - customer created
         * @returns {Error} 400 - Account already exists
         * @returns {Error}  500 - Unexpected error creating a customer
         */
        const onCreateValidators = [
            upload.single("picture"),
            Validators.Required("password"),
            Validators.Required("username"),
            Validators.Required("email"), 
            Validators.validEmail("email")];
        router.post(apiUrl, ...onCreateValidators, createCustomer);
        
        /**
         * @route PUT /customers/{accountId}
         * @group customers - customers operations
         * @param {string} accountId.query.required - Account id required
         * @returns {object} 200 - Updated customer
         * @returns {Error}  500 - Unexpected error
         */
        const onUpdateValidators = [
            upload.single("picture"),
            Validators.Required("userToken"),
            Validators.validToken("userToken"),
            Validators.validEmail("email")];
        router.put(apiUrl + '/:accountId', ...onUpdateValidators, updateCustomer);
       
        /**
         * @route DELETE /customers/{accountId}
         * @group customers - customers operations
         * @param {string} accountId.query.required - Account id required
         * @returns {object} 200 - Deleted customer
         * @returns {Error}  401 - Authentication failed
         * @returns {Error}  404 - Customer not found
         * @returns {Error}  500 - Unexpected error deleting customer
         */
        const onDeleteValidators = [
            Validators.Required("userToken"),
            Validators.validToken("userToken")
        ];
        router.delete(apiUrl + '/:accountId', ...onDeleteValidators, deleteCustomer);
    }
}

module.exports = CustomerRoutes;
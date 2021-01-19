const { Router } = require('express');
const multer = require("multer")
const upload = multer({ dest: "" })


const { getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer_controller');

class CustomerRoutes {
    constructor(apiPrefix, router) {
        const apiUrl = apiPrefix + "/customers"; 
        /////////////// Swagger Model Definition /////////////////
            /**
             * @typedef Customer
             * @property {string} pictureUrl
             * @property {string} address
             */

        /////////////// Routes /////////////////
        /**
         * @route GET /customers/{accountId}
         * @group customers - customers operations
         * @param {string} id.query.required - Account id required
         * @returns {object} 200 - The customer with given account id
         * @returns {Error}  500 - Unexpected error
         */
        router.get(apiUrl + '/:accountId', getCustomer);

        /**
         * @route POST /customers
         * @group customers - customers operations
         * @returns {object} 201 - customer created
         * @returns {Error}  500 - Unexpected error creating a customer
         */
        router.post(apiUrl, upload.single("picture"), createCustomer);
        
        /**
         * @route PUT /customers/{accountId}
         * @group customers - customers operations
         * @param {string} id.query.required - Account id required
         * @returns {object} 200 - Updated customer
         * @returns {Error}  500 - Unexpected error
         */
        router.put(apiUrl + '/:accountId', upload.single("picture"), updateCustomer);
       
        /**
         * @route DELETE /customers/{accountId}
         * @group customers - customers operations
         * @param {string} id.query.required - Account id required
         * @returns {object} 200 - Deleted customer
         * @returns {Error}  404 - Unexpected error
         */
        router.delete(apiUrl + '/:accountId', deleteCustomer);
    }
}

module.exports = CustomerRoutes;
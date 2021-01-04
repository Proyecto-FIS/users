const { Router } = require('express');
const router = Router();
const multer = require("multer")
const upload = multer({ dest: "" })

const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer_controller');

/////////////// Swagger Model Definition /////////////////
/**
 * @typedef Customer
 * @property {string} pictureUrl
 * @property {string} address
 */

/////////////// Routes /////////////////

/**
 * @route POST /customers
 * @group customers - customers operations
 * @returns {object} 201 - customer created
 * @returns {Error}  500 - Unexpected error creating a customer
 */
router.route('/').post(upload.single("picture"), createCustomer);


/**
 * @route GET /customers/{accountId}
 * @group customers - customers operations
 * @param {string} id.query.required - Account id required
 * @returns {object} 200 - The customer with given account id
 * @returns {Error}  500 - Unexpected error
 */
router.route('/:accountId').get(getCustomer);

/**
 * @route PUT /customers/{id}
 * @group customers - customers operations
 * @param {string} id.query.required - customer id required
 * @returns {object} 200 - Updated customer
 * @returns {Error}  500 - Unexpected error
 */
router.route('/:accountId').put(updateCustomer);


/**
 * @route DELETE /customers/{id}
 * @group customers - customers operations
 * @param {string} id.query.required - customer id required
 * @returns {object} 200 - Deleted customer
 * @returns {Error}  404 - Unexpected error
 */
router.route('/:id').delete(deleteCustomer);


module.exports = router;
const { Router } = require('express')
const router = Router()

const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer_controller')

/////////////// Swagger Model Definition /////////////////
/**
 * @typedef Customer
 * @property {string} pictureUrl
 * @property {string} address
 */

/////////////// Routes /////////////////
/**
 * @route GET /customers
 * @group customers - customers operations
 * @returns {object} 200 - A complete list of customers
 * @returns {Error}  500 - Unexpected error
 */
router.route('/').get(getCustomers)

/**
 * @route POST /customers
 * @group customers - customers operations
 * @returns {object} 201 - customer created
 * @returns {Error}  500 - Unexpected error creating a customer
 */
router.route('/').post(createCustomer)


/**
 * @route GET /customers/{id}
 * @group customers - customers operations
 * @param {string} id.query.required - customer id required
 * @returns {object} 200 - The customer with given id
 * @returns {Error}  500 - Unexpected error
 */
router.route('/:id').get(getCustomer)

/**
 * @route PUT /customers/{id}
 * @group customers - customers operations
 * @param {string} id.query.required - customer id required
 * @returns {object} 200 - Updated customer
 * @returns {Error}  500 - Unexpected error
 */
router.route('/:id').put(updateCustomer)


/**
 * @route DELETE /customers/{id}
 * @group customers - customers operations
 * @param {string} id.query.required - customer id required
 * @returns {object} 200 - Deleted customer
 * @returns {Error}  404 - Unexpected error
 */
router.route('/:id').delete(deleteCustomer)


module.exports = router 
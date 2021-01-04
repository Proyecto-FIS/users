const { Router } = require('express')
const router = Router()
const multer = require("multer")
const upload = multer({ dest: "" })

const { getToaster, getToasters, createToaster, updateToaster, deleteToaster } = require('../controllers/toaster_controller')

/////////////// Swagger Model Definition /////////////////
/**
 * @typedef Toaster
 * @property {string} name.required
 * @property {string} description.required
 * @property {string} address
 * @property {string} phoneNumber
 * @property {string} pictureUrl
 * @property {Array.<String>} socialNetworks 
 */


/////////////// Routes /////////////////
/**
 * @route GET /toasters
 * @group toasters - Toasters operations
 * @returns {object} 200 - A complete list of toasters
 * @returns {Error}  500 - Unexpected error
 */
router.route('/').get(getToasters)

/**
 * @route POST /toasters
 * @group toasters - Toasters operations
 * @returns {object} 201 - Toaster created
 * @returns {Error}  500 - Unexpected error creating a toaster
 */
router.route('/').post(upload.single("picture"), createToaster)


/**
 * @route GET /toasters/{accountId}
 * @group toasters - Toasters operations
 * @param {string} id.query.required - account Id required
 * @returns {object} 200 - The toaster with given accountId
 * @returns {Error}  500 - Unexpected error
 */
router.route('/:accountId').get(getToaster)

/**
 * @route PUT /toasters/{accountId}
 * @group toasters - Toasters operations
 * @param {string} id.query.required - account Id required
 * @returns {object} 200 - Updated toaster
 * @returns {Error}  404 - Unexpected error
 */
router.route('/:accountId').put(updateToaster)

/**
 * @route DELETE /toasters/{id}
 * @group toasters - Toasters operations
 * @param {string} id.query.required - toaster id required
 * @returns {object} 200 - Deleted toaster
 * @returns {Error}  404 - Unexpected error
 */
router.route('/:id').delete(deleteToaster)

module.exports = router; 
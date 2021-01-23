const { Router } = require('express')
const multer = require("multer")
const upload = multer({ dest: "" })
const Validators = require("../middleware/Validators");

class ToasterRoutes {
    constructor(apiPrefix, router) {
        const { getToaster, getToasters, createToaster, updateToaster, deleteToaster } = require('../controllers/toaster_controller')
        const apiUrl = apiPrefix + "/toasters"; 
        
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
        router.get(apiUrl, getToasters)

        /**
         * @route GET /toasters/{accountId}
         * @group toasters - Toasters operations
         * @param {string} id.query.required - account Id required
         * @returns {object} 200 - The toaster with given accountId
         * @returns {Error}  500 - Unexpected error
         */
        router.get(apiUrl + '/:accountId', getToaster)

        /**
         * @route POST /toasters
         * @group toasters - Toasters operations
         * @returns {object} 201 - Toaster created
         * @returns {Error}  500 - Unexpected error creating a toaster
         */
        const onCreateValidators = [
            Validators.Required("password"),
            Validators.Required("username"),
            Validators.Required("email"),
            Validators.Required("name"), 
            Validators.Required("description"),
            Validators.validEmail("email"),
            Validators.isURL("facebookUrl"),
            Validators.isURL("twitterUrl"),
            Validators.isURL("instagramUrl")
        ];
        router.post(apiUrl, ...onCreateValidators, upload.single("picture"), createToaster)

        /**
         * @route PUT /toasters/{accountId}
         * @group toasters - Toasters operations
         * @param {string} id.query.required - account Id required
         * @returns {object} 200 - Updated toaster
         * @returns {Error}  404 - Unexpected error
         */
        const onUpdateValidators = [
            Validators.Required("userToken"),
            Validators.validEmail("email"),
            Validators.isURL("facebookUrl"),
            Validators.isURL("twitterUrl"),
            Validators.isURL("instagramUrl"),
            Validators.validToken("userToken")
        ];
        router.put(apiUrl + '/:accountId', ...onUpdateValidators, upload.single("picture"), updateToaster)

        /**
         * @route DELETE /toasters/{id}
         * @group toasters - Toasters operations
         * @param {string} id.query.required - toaster id required
         * @returns {object} 200 - Deleted toaster
         * @returns {Error}  404 - Unexpected error
         */
        const onDeleteValidators = [
            Validators.Required("userToken"),
            Validators.validToken("userToken")
        ];
        router.delete(apiUrl + '/:id',...onDeleteValidators, deleteToaster);
    }
}

module.exports = ToasterRoutes;
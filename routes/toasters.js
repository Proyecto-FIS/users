const express = require('express');
const router = express.Router();

const Toaster = require('../models/toasters.js');

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
router.get("/", (req, res) => {
    Toaster.find({}, (err, toasters) => {
        if(err){
            console.log(Date() + "-" + err);
            res.sendStatus(500);
        } else {
            res.send(toasters);
        }
    });
});

/**
 * @route POST /toasters
 * @group toasters - Toasters operations
 * @returns {object} 201 - Toaster created
 * @returns {Error}  501 - Unexpected error creating a toaster
 */
router.post("/", (req, res) => {
    var toaster = req.body;

    Toaster.create(toaster, (err) => {
        if (err){
            toaster.log(Date() + "-" + err);
            res.sendStatus(501);
        } else {
            res.sendStatus(201);
        }
    });

});


/**
 * @route GET /toasters/{id}
 * @group toasters - Toasters operations
 * @param {string} id.query.required - toaster id required
 * @returns {object} 200 - The toaster with given id
 * @returns {Error}  500 - Unexpected error
 */
router.get("/:id", (req, res) => {
    // TODO
});


/**
 * @route PUT /toasters/{id}
 * @group toasters - Toasters operations
 * @param {string} id.query.required - toaster id required
 * @returns {object} 200 - Updated toaster
 * @returns {Error}  404 - Unexpected error
 */
router.put("/:id", (req, res) => {
    // TODO
});


/**
 * @route DELETE /toasters/{id}
 * @group toasters - Toasters operations
 * @param {string} id.query.required - toaster id required
 * @returns {object} 200 - Deleted toaster
 * @returns {Error}  404 - Unexpected error
 */
router.delete("/:id", (req, res) => {
    // TODO
});



module.exports = router; 
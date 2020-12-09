const express = require('express');
const router = express.Router();

var dataStore = require('nedb');

var DB_FILE_NAME = __dirname + "/../toasters.json";

//Inicialización de DB
var db = new dataStore({
    filename: DB_FILE_NAME,
    autoload: true
});


/////////////// Routes /////////////////
/**
 * @route GET /toasters
 * @group Toasters - Toasters operations
 * @returns {object} 200 - A complete list of toasters
 * @returns {Error}  500 - Unexpected error
 */
router.get("/", (req, res) => {
    db.find({}, (err, toasters) => {
        if(err){
            console.log(Date() + "-" + err);
            res.sendStatus(500);
        } else {
            res.send(toasters.map((toaster) => {
                delete toaster._id;
                return toaster;
            }));
        }
    });
});

/**
 * @route POST /toasters
 * @group Toasters - Toasters operations
 * @returns {object} 201 - Toaster created
 * @returns {Error}  501 - Unexpected error creating a toaster
 */
router.post("/", (req, res) => {
    var toaster = req.body;

    db.insert(toaster, (err) => {
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
 * @group Toasters - Toasters operations
 * @param {string} id.query.required - toaster id required
 * @returns {object} 200 - The toaster with given id
 * @returns {Error}  500 - Unexpected error
 */
router.get("/:id", (req, res) => {
    // TODO
});


/**
 * @route PUT /toasters/{id}
 * @group Toasters - Toasters operations
 * @param {string} id.query.required - toaster id required
 * @returns {object} 200 - Updated toaster
 * @returns {Error}  404 - Unexpected error
 */
router.put("/:id", (req, res) => {
    // TODO
});


/**
 * @route DELETE /toasters/{id}
 * @group Toasters - Toasters operations
 * @param {string} id.query.required - toaster id required
 * @returns {object} 200 - Deleted toaster
 * @returns {Error}  404 - Unexpected error
 */
router.delete("/:id", (req, res) => {
    // TODO
});


module.exports = router; 
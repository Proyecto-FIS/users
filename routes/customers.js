const express = require('express');
const router = express.Router();

var dataStore = require('nedb');

var DB_FILE_NAME = __dirname + "/../customers.json";

//Inicialización de DB
var db = new dataStore({
    filename: DB_FILE_NAME,
    autoload: true
});

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
router.get("/", (req, res) => {
    db.find({}, (err, customers) => {
        if(err){
            console.log(Date() + "-" + err);
            res.sendStatus(500);
        } else {
            res.send(customers.map((customer) => {
                delete customer._id;
                return customer;
            }));
        }
    });
});

/**
 * @route POST /customers
 * @group customers - customers operations
 * @returns {object} 201 - customer created
 * @returns {Error}  501 - Unexpected error creating a customer
 */
router.post("/", (req, res) => {
    var customer = req.body;

    db.insert(customer, (err) => {
        if (err){
            customer.log(Date() + "-" + err);
            res.sendStatus(501);
        } else {
            res.sendStatus(201);
        }
    });

});


/**
 * @route GET /customers/{id}
 * @group customers - customers operations
 * @param {string} id.query.required - customer id required
 * @returns {object} 200 - The customer with given id
 * @returns {Error}  500 - Unexpected error
 */
router.get("/:id", (req, res) => {
    // TODO
});


/**
 * @route PUT /customers/{id}
 * @group customers - customers operations
 * @param {string} id.query.required - customer id required
 * @returns {object} 200 - Updated customer
 * @returns {Error}  404 - Unexpected error
 */
router.put("/:id", (req, res) => {
    // TODO
});


/**
 * @route DELETE /customers/{id}
 * @group customers - customers operations
 * @param {string} id.query.required - customer id required
 * @returns {object} 200 - Deleted customer
 * @returns {Error}  404 - Unexpected error
 */
router.delete("/:id", (req, res) => {
    // TODO
});


module.exports = router; 
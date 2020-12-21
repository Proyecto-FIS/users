const express = require('express');
const Account = require('../models/accounts');
const jwt = require('jsonwebtoken');
const cfg = require('config');
const Bcrypt = require("bcryptjs");

const router = express.Router();
/////////////// Swagger Model Definition /////////////////
/**
 * Toasters y Customers heredarían las propiedades de este tipo.
 * @typedef Account
 * @property {string} userName.required
 * @property {string} password.required
 * @property {string} email.required
 * @property {boolean} isCustomer.required - Autogenerado
 * @property {Date} updated - Última fecha en que se actualizó el perfil
 */


/**
 * @route POST /auth/login
 * @group authentication - login/logout
 * @returns {object} 201 - Logged user
 * @returns {Error}  401 - Error while logging user
 */
router.post("/login", async (req, res) => {

    const { username, password } = req.body;
    try { 
        const account = await Account.findOne({username});

        if(!account){
            return res.status(400).json( { errors:[{msg:"Invalid login"}] });
        }

        const isMatched = await Bcrypt.compare(password, account.password);

        if(!isMatched){
            return res.status(400).json( { errors:[{msg:"Invalid login"}] });
        }

        const payload = {
            account: {
                id: account.id,
                isCustomer: account.isCustomer
                }
            };
        //TODO cambiar el expires a 3600 en producción
        jwt.sign(payload, cfg.get("jwttoken"), {expiresIn:3600000}, (err, token) => {
            if(err) {
                throw err;
            } else {
                res.json({token});
            }
        });

    } catch(err){
        console.log(err.message);
        res.status(500);
    }
});

/**
 * @route GET /auth/{token}
 * @group authentication - login/logout
 * @param {string} token.query.required - JWT token
 * @returns {object} 201 - Authenticated user, giving user id
 * @returns {Error}  401 - Error while checking token
 */
router.get("/:token", async (req, res) => {

    const token = req.params.token;

    if(!token){
        return res.status(401);
    }
    //Verificación del token
    try {
        const decoded = jwt.verify(token, cfg.get("jwttoken"));
        //Añadimos a la cabecera el usuario identificado
        var account = decoded.account;
    } catch(err) {
        res.status(401);
    }

    try {
        acc = await Account.findById(account.id);
        res.status(201);
        res.json({"account_id": acc.id, "isCustomer":acc.isCustomer});
    } catch(err) {
        console.error(err.message);
        res.status(500).json({ error:"Invalid token"});
    }

    });


module.exports = router; 
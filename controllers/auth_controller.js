const express = require('express');
const Account = require('../models/accounts');
const jwt = require('jsonwebtoken');
const cfg = require('config');
const Bcrypt = require("bcryptjs");

const authCtrl = {};

/**
 * @route POST /auth/login
 * @group authentication - login/logout
 * @returns {object} 200 - Logged user info and token
 * @returns {Error}  400 - Error while logging user
 */
authCtrl.login = async (req, res) => {

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

        jwt.sign({id: account.id}, cfg.get("jwttoken"), {expiresIn:parseInt(process.env.TOKEN_EXPIRATION_TIME) || 3600000}, (err, token) => {
            if(err) {
                throw err;
            } else {
                res.json({
                    _id: account.id,
                    username: account.username,
                    email: account.email,
                    isCustomer: account.isCustomer,
                    token: token});
            }
        });

    } catch(err){
        console.log(err.message);
        res.status(500);
    }
};

/**
 * @route GET /auth
 * @group authentication - login/logout
 * @returns {object} 200 - Get account by stored token (used for frontend)
 * @returns {Error}  500 - Server error
 */

authCtrl.getAuth = async (req, res) => {
    try {
      const account = await Account.findById(req.accountId).select('-password');
      res.json(account);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };


/**
 * @route GET /auth/{token}
 * @group authentication - login/logout
 * @param {string} token.query.required - JWT token
 * @returns {object} 201 - Authenticated user, giving user id
 * @returns {Error}  401 - Error while checking token
 * @returns {Error}  500 - Invalid token
 */
authCtrl.getAccountByToken = async (req, res) => {

    const token = req.params.token;

    if(!token){
        return res.status(401);
    }
    //Verificación del token
    try {
        const decoded = jwt.verify(token, cfg.get("jwttoken"));

        var accountId = decoded.id;
    } catch(err) {
        return res.status(401).json({ error:err.message});
    }

    try {
        acc = await Account.findById(accountId);
        res.status(201);
        res.json({"account_id": acc.id, "username":acc.username, "isCustomer":acc.isCustomer});
    } catch(err) {
        console.error(err.message);
        res.status(500).json({ error:"Invalid token"});
    }

    };


module.exports = authCtrl; 
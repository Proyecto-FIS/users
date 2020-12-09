const express = require('express');
const router = express.Router();

/**
 * @route POST /auth/login
 * @group authentication - login/logout
 * @returns {object} 201 - Logged user
 * @returns {Error}  401 - Error while logging user
 */
router.post("/login", (req, res) => {
// TODO
});

/**
 * @route GET /auth/{token}
 * @group authentication - login/logout
 * @param {string} token.query.required - JWT token
 * @returns {object} 201 - Authenticated user, giving user id
 * @returns {Error}  401 - Error while checking token
 */
router.get("/:token", (req, res) => {
    // TODO
    });


/**
 * @route GET /auth/logout
 * @group authentication - login/logout
 * @returns {object} 201 - Loggout user
 * @returns {Error}  500 - Unexpected error
 */
router.get("/logout", (req, res) => {
    //TODO
});

module.exports = router; 
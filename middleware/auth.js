const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    //Obtención del token desde el header
    const token = req.header('x-auth-token');

    if(!token){
        return res.status(401);
    }

    //Verificación del token
    try {
        const decoded = jwt.verify(token, config.get("jwttoken"));
        //Añadimos a la cabecera el usuario identificado
        req.accountId = decoded.id;
        next();
    } catch(err) {
        res.status(401);
    }
}
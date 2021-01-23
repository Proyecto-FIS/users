/**
 * @typedef ValidationError
 * @property {string} reason   - User-friendly reason message
 */

class Validators {

    static Required(fieldName) {
        return (req, res, next) => {
            if(req.body && req.body.hasOwnProperty(fieldName) || req.query && req.query.hasOwnProperty(fieldName)) {
                next();
            } else {
                res.status(400).json({ reason: "Missing fields" });
            }
        }
    }

    static isURL(fieldName) {
        return (req, res, next) => {
            const field = req.body[fieldName] || req.query[fieldName];
            if(!field || /^$|^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(field)) {
                next();
            } else {
                res.status(400).json({ reason: "Incorrect URL" });
            }
        }
    }

    static validEmail(fieldName) {
        return (req, res, next) => {
            const field = req.body[fieldName] || req.query[fieldName];
            if(!field || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(field)) {
                next();
            } else {
                res.status(400).json({ reason: "The email format is not valid" });
            }
        }
    }


}

module.exports = Validators;
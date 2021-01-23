const request = require("supertest");
const express = require("express");
const port = process.env.PORT || 3000;
const Validators = require("../middleware/Validators");

module.exports.makeRequest = () => request(`http://localhost:${port}`);

module.exports.mockMiddlewareInput = (req) => {

    let res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);

    return {
        req: req,
        res: res,
        next: jest.fn()
    };
}

module.exports.mockedRouter = () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
});

module.exports.createCustomerTestExpressApp = (controller, path) => {
    const app = express();
    const router = express.Router();
    const { getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer_controller');
    const { login, getAccountByToken } = require('../controllers/auth_controller');

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(router);

    const onCreateValidators = [
        Validators.Required("password"),
        Validators.Required("username"),
        Validators.Required("email"), 
        Validators.validEmail("email")];
    
    const onUpdateValidators = [
        Validators.validEmail("email")];
    
    const onDeleteValidators = [];

    //Customer methods
    router.post(path, ...onCreateValidators, createCustomer.bind(controller));
    router.get(path + '/:accountId', getCustomer.bind(controller));
    router.put(path + '/:accountId', onUpdateValidators, updateCustomer.bind(controller));
    router.delete(path + '/:accountId', onDeleteValidators, deleteCustomer.bind(controller));
    
    //Auth methods
    router.post('auth/login', login.bind(controller));
    router.get('auth/:token', getAccountByToken.bind(controller));
    return app;
};

module.exports.createToasterTestExpressApp = (controller, path) => {
    const app = express();
    const router = express.Router();
    const { getToaster, getToasters, createToaster, updateToaster, deleteToaster } = require('../controllers/toaster_controller')
    const { login, getAccountByToken } = require('../controllers/auth_controller');
    
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(router);
    
    //Auth methods
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

    const onUpdateValidators = [
        Validators.validEmail("email"),
        Validators.isURL("facebookUrl"),
        Validators.isURL("twitterUrl"),
        Validators.isURL("instagramUrl")
    ];

    const onDeleteValidators = [];

    router.post(path, ...onCreateValidators, createToaster.bind(controller));
    router.get(path, getToasters.bind(controller));
    router.get(path + '/:accountId', getToaster.bind(controller));
    router.put(path + '/:accountId', ...onUpdateValidators, updateToaster.bind(controller));
    router.delete(path + '/:accountId', ...onDeleteValidators, deleteToaster.bind(controller));
    //Auth methods
    router.post('auth/login', login.bind(controller));
    router.get('auth/:token', getAccountByToken.bind(controller));

    return app;
};


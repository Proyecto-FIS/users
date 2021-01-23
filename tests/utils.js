const request = require("supertest");
const express = require("express");
const port = process.env.PORT || 3000;

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

module.exports.createCustomerTestExpressApp = (controller, path, ...middlewares) => {
    const app = express();
    const router = express.Router();
    const { getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer_controller');
    const { login, getAccountByToken } = require('../controllers/auth_controller');

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(router);
    
    //Customer methods
    router.post(path, ...middlewares, createCustomer.bind(controller));
    router.get(path + '/:accountId', ...middlewares, getCustomer.bind(controller));
    router.put(path + '/:accountId', ...middlewares, updateCustomer.bind(controller));
    router.delete(path + '/:accountId', ...middlewares, deleteCustomer.bind(controller));
    
    //Auth methods
    router.post('auth/login',...middlewares, login.bind(controller));
    router.get('auth/:token',...middlewares, getAccountByToken.bind(controller));
    return app;
};

module.exports.createToasterTestExpressApp = (controller, path, ...middlewares) => {
    const app = express();
    const router = express.Router();
    const { getToaster, getToasters, createToaster, updateToaster, deleteToaster } = require('../controllers/toaster_controller')
    const { login, getAccountByToken } = require('../controllers/auth_controller');
    
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(router);
    
    //Auth methods
    router.post(path, ...middlewares, createToaster.bind(controller));
    router.get(path, ...middlewares, getToasters.bind(controller));
    router.get(path + '/:accountId', ...middlewares, getToaster.bind(controller));
    router.put(path + '/:accountId', ...middlewares, updateToaster.bind(controller));
    router.delete(path + '/:accountId', ...middlewares, deleteToaster.bind(controller));
    //Auth methods
    router.post('auth/login',...middlewares, login.bind(controller));
    router.get('auth/:token',...middlewares, getAccountByToken.bind(controller));

    return app;
};


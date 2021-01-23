const Validators = require("../../middleware/Validators");
const utils = require("../utils");

describe("Validators", () => {

    test("Required OK", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myField: "myValue"
            }
        });

        const validator = Validators.Required("myField");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(1);
        expect(res.status.mock.calls.length).toBe(0);
        expect(res.json.mock.calls.length).toBe(0);

        return expect(true).toBe(true);
    });

    test("Required missing field", () => {
        
        const { req, res, next } = utils.mockMiddlewareInput({
            body: {}
        });

        const validator = Validators.Required("myField");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(0);
        expect(res.status.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toMatchObject({ reason: "Missing fields" });
    });

    test("isUrl OK", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myField: "http://www.google.es"
            }
        });

        const validator = Validators.isURL("myField");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(1);
        expect(res.status.mock.calls.length).toBe(0);
        expect(res.json.mock.calls.length).toBe(0);

        return expect(true).toBe(true);
    });

    test("isUrl Invalid", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myField: "wrong URL"
            }
        });

        const validator = Validators.isURL("myField");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(0);
        expect(res.status.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toMatchObject({ reason: "Incorrect URL" });

        return expect(true).toBe(true);
    });

    test("email format OK", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myField: "coffaine@gmail.com"
            }
        });

        const validator = Validators.validEmail("myField");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(1);
        expect(res.status.mock.calls.length).toBe(0);
        expect(res.json.mock.calls.length).toBe(0);

        return expect(true).toBe(true);
    });

    test("email format Invalid", () => {

        const { req, res, next } = utils.mockMiddlewareInput({
            body: {
                myField: "wrongmail"
            }
        });

        const validator = Validators.validEmail("myField");
        validator(req, res, next);

        expect(next.mock.calls.length).toBe(0);
        expect(res.status.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(400);
        expect(res.json.mock.calls[0][0]).toMatchObject({ reason: "The email format is not valid" });

        return expect(true).toBe(true);
    });
});
const app = require("../server.js");
const request = require('supertest');
const Toaster = require("../models/toasters.js");
const Account = require("../models/accounts.js");

describe("Users API", () => {
    describe("GET /", () => {
        it("should return an HTML document", () => {
            return request(app).get("/").then((response) => {
                expect(response.status).toBe(200)
            });
        });
    });
    describe("GET /toasters", () => {
        it("should return all toasters", () => {
            const toasters = [
                new Toaster({ 
                    "name": "toaster", "description": "toaster test", 
                    "phoneNumber": "662130560", "pictureUrl": "", 
                    "address": "calle el testing", "instagramUrl": "", 
                    "facebookUrl": "", "twitterUrl": "", 
                    "account": "" }),
                new Toaster({ 
                    "name": "toaster2", "description": "toaster test2", 
                    "phoneNumber": "662130561", "pictureUrl": "", 
                    "address": "calle el segundo testing", "instagramUrl": "", 
                    "facebookUrl": "", "twitterUrl": "", 
                    "account": "" })
            ];
            dbFind = jest.spyOn(Toaster, "find");
            dbFind.mockImplementation(() => {
                return toasters
            });
            return request(app).get("/api/v1/toasters").then((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
            });
        });
    });
    // describe("POST /toasters", () => {
    //     it("should create a toaster if everything its fine", () => {
    //         var newAccount = new Account({
    //             "username": "testAccount",
    //             "password": "testAccount",
    //             "email": "test@gmail.com",
    //             "isCustomer": false
    //         })
    //         const toaster = new Toaster({ 
    //             "name": "toaster", "description": "toaster test",
    //             "phoneNumber": "662130560", "pictureUrl": "",
    //             "address": "calle el testing", "instagramUrl": "",
    //             "facebookUrl": "", "twitterUrl": "",
    //             "account": account
    //         });
    //         dbSave = jest.spyOn(Toaster.prototype, "save");
    //         dbSave.mockImplementation((t) => {
    //             return true
    //         });
    //         return request(app).post("/api/v1/toasters").send(toaster).then((response) => {
    //             expect(response).toBe(201);
    //             expect(dbSave).toBeCalledWith(toaster);
    //         });
    //     }); 
    // });
});
const DatabaseConnection = require("../../db");
const CustomerController = require("../../routes/Customer");
const mongoose = require("mongoose");
const utils = require("../utils");
const request = require("supertest");

describe("CustomerController", () => {
    const testURL = "/customers";
    const db = new DatabaseConnection();
    let app;

    beforeAll(() => {
        const controller = new CustomerController(testURL, utils.mockedRouter());
        app = utils.createCustomerTestExpressApp(controller, testURL);
        return db.setup();
    });

    beforeEach(done => 
        mongoose.connection.dropCollection("customers", err => {
            mongoose.connection.dropCollection("accounts", error => done())
        })
    );

    afterAll(() => db.close());

    // ---------------- TESTS POSTIVOS ----------------
    // CREATE
    test("Can create a customer with valid input", async ()  => {
        let url;
        const entry = {
            username: "customerTest",
            password: "Testpassword",
            email: 'customerTest@gmail.com',
            address: "calle con mas de 20 caracteres"
        }
        
        //Intentamos Guardar el nuevo customer
        await request(app)
            .post(testURL)
            .send(entry)
            .expect(201)
            .then( async response => {
                url = testURL + '/' + response.body._id
             })
        
        //Obtenemos el nuevo customer a partir de su ID
        return request(app)
            .get(url)
            .expect(200)
            .then( async res => {
               await expect(res.body.account.username).toBe(entry.username);
               await expect(res.body.account.email).toBe(entry.email);
               await expect(res.body.address).toBe(entry.address);
               await expect(res.body.account.isCustomer).toBe(true);
            })
    });

    // UPDATE
    test("Can update the customer info", async ()  => {
        let url;
        const entry = {
            username: "customerTest",
            password: "Testpassword",
            email: 'customerTest@gmail.com',
            address: "calle con mas de 20 caracteres"
        }

        const modified = {
            email: 'nuevocustomerTest@gmail.com',
            address: "otra calle distinta pero con 20 caracteres"
        }
        
        //Intentamos Guardar el nuevo customer
        await request(app)
            .post(testURL)
            .send(entry)
            .expect(201)
            .then( async response => {
                url = testURL + '/' + response.body._id
             })
        
        //Actualizamos la información del customer
        await request(app)
             .put(url)
             .send(modified)
             .expect(200)
             .then( async response => {
               await expect(response);
              })
        
        //Obtenemos el nuevo customer y comprobamos si se ha actualizado
        return await request(app)
            .get(url)
            .expect(200)
            .then( async res => {
               await expect(res.body.account.email).toBe(modified.email);
               await expect(res.body.address).toBe(modified.address);
            })
    });

    // ---------------- TESTS NEGATIVOS ----------------
    test("Create customer with missing parameters", async ()  => {
        const entry = {
            email: 'customerTest@gmail.com',
            address: "calle con mas de 20 caracteres",
            //missing password and email
        }
        
        //Intentamos Guardar el nuevo customer
        return await request(app)
            .post(testURL)
            .send(entry)
            .expect(400)
            .then( async res => {
                await expect(res.body.reason).toBe('Missing fields');
            })
    });

    test("Create customer with short password", async ()  => {
        const entry = {
            username: "customerTest",
            password: "short",
            email: 'customerTest@gmail.com',
            address: "calle con mas de 20 caracteres"
        }
        
        //Intentamos Guardar el nuevo customer
        return await request(app)
            .post(testURL)
            .send(entry)
            .expect(500)
            .then( async res => {
               await expect(res.body.errors.password.kind).toBe('minlength');
            })
    });

    test("Create customer with short username", async ()  => {
        const entry = {
            username: "aa",
            password: "customerPassword",
            email: 'customerTest@gmail.com',
            address: "calle con mas de 20 caracteres"
        }
        
        //Intentamos Guardar el nuevo customer
        return await request(app)
            .post(testURL)
            .send(entry)
            .expect(500)
            .then( async res => {
               await expect(res.body.errors.username.kind).toBe('minlength');
            })
    });

    test("Create customer with invalid email", async ()  => {
        const entry = {
            username: "customerTest",
            password: "customerPassword",
            email: 'wrongmail',
            address: "just a street"
        }
        
        //Intentamos Guardar el nuevo customer
        return await request(app)
            .post(testURL)
            .send(entry)
            .expect(400)
            .then( async res => {
                await expect(res.body.reason).toBe('The email format is not valid');
            })
    });

    test("Create two customers with the same username", async ()  => {
        const entry = {
            username: "customerTest",
            password: "Testpassword",
            email: 'customerTest@gmail.com',
            address: "calle con mas de 20 caracteres"
        }

        const repeatedEntry = {
            username: "customerTest",
            password: "TestCopied",
            email: 'customerTest2@gmail.com',
            address: "otra calle con mas de 20 caracteres"
        }
        
        //Guardamos el primer customer
        await request(app)
            .post(testURL)
            .send(entry)
            .expect(201)
        
        //Intentamos guardar otro customer
        return await request(app)
            .post(testURL)
            .send(repeatedEntry)
            .expect(400)
            .then( async res => {
               await expect(res.body.errors[0].msg).toBe("Account already exists");
            })
    });
});
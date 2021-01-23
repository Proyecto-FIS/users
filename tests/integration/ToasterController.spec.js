const DatabaseConnection = require("../../db");
const ToasterController = require("../../routes/Toaster");
const mongoose = require("mongoose");
const utils = require("../utils");
const request = require("supertest");

describe("ToasterController", () => {
    const testURL = "/toasters";
    const db = new DatabaseConnection();
    let app;

    beforeAll(() => {
        const controller = new ToasterController(testURL, utils.mockedRouter());
        app = utils.createToasterTestExpressApp(controller, testURL);
        return db.setup();
    });

    beforeEach(done => 
        mongoose.connection.dropCollection("toasters", err => {
            mongoose.connection.dropCollection("accounts", error => done())
        })
    );

    afterAll(() => db.close());

    // ---------------- TESTS POSTIVOS ----------------
    // CREATE
    test("Can create a toaster with valid input", async ()  => {
        let url;
        const entry = {
            username: "toasterTest",
            password: "Testpassword",
            email: 'toasterTest@gmail.com',
            address: "calle con mas de 20 caracteres",
            name: "toasterTest",
            description: "descripción con más de 20 caracteres"
        }
        
        //Intentamos Guardar el nuevo toaster
        await request(app)
            .post(testURL)
            .send(entry)
            .expect(201)
            .then(async response => {
                url = testURL + '/' + response.body._id
             })
        
        //Obtenemos el nuevo toaster a partir de su ID
        return request(app)
            .get(url)
            .expect(200)
            .then(async res => {
               await expect(res.body.account.username).toBe(entry.username);
               await expect(res.body.account.email).toBe(entry.email);
               await expect(res.body.address).toBe(entry.address);
               await expect(res.body.account.isCustomer).toBe(false);
            })
    });

        // UPDATE
    test("Can update the toaster info", async ()  => {
        let url;
        const entry = {
            username: "toasterTest",
            password: "Testpassword",
            email: 'toasterTest@gmail.com',
            address: "calle con mas de 20 caracteres",
            name: "toasterTest",
            description: "descripción con más de 20 caracteres"
        }

        const modified = {
            email: 'nuevotoasterTest@gmail.com',
            address: "otra calle distinta pero con 20 caracteres",
            name: "new name toaster Test",
            description: "new description also > 20 characters"
        }
        
        //Intentamos Guardar el nuevo toaster
        await request(app)
            .post(testURL)
            .send(entry)
            .expect(201)
            .then( async response => {
                url = testURL + '/' + response.body._id
             })
        
        //Actualizamos la información del toaster
        await request(app)
             .put(url)
             .send(modified)
             .expect(200)
             .then( async response => {
               await expect(response);
              })
        
        //Obtenemos el nuevo toaster y comprobamos si se ha actualizado
        return await request(app)
            .get(url)
            .expect(200)
            .then( async res => {
               await expect(res.body.account.email).toBe(modified.email);
               await expect(res.body.address).toBe(modified.address);
               await expect(res.body.name).toBe(modified.name);
               await expect(res.body.description).toBe(modified.description);
            })
    });

    // ---------------- TESTS NEGATIVOS ----------------
    test("Creating a toaster with missing parameters ", async () => {
        const missingEntry = {
            email: 'toasterTest@gmail.com',
            address: "calle con mas de 20 caracteres",
            //missing password and email
        }
        
        //Esperamos que detecte la falta de parámetros
        return request(app)
            .post(testURL)
            .send(missingEntry)
            .expect(400)
            .then(async res => {
                await expect(res.body.reason).toBe('Missing fields');
            })
    });

    test("Create toaster with short password", async ()  => {
        const entry = {
            username: "toasterTest",
            password: "short",
            email: 'toasterTest@gmail.com',
            address: "calle con mas de 20 caracteres",
            name: "toasterTest",
            description: "descripción con más de 20 caracteres"
        }
        
        //Intentamos Guardar el nuevo toaster
        return await request(app)
            .post(testURL)
            .send(entry)
            .expect(500)
            .then( async res => {
               await expect(res.body.errors.password.kind).toBe('minlength');
            })
    });

    test("Create toaster with short username", async ()  => {
        const entry = {
            username: "aa",
            password: "toasterPassword",
            email: 'toasterTest@gmail.com',
            address: "calle con mas de 20 caracteres",
            name: "toasterTest",
            description: "descripción con más de 20 caracteres"
        }
        
        //Intentamos Guardar el nuevo toaster
        return await request(app)
            .post(testURL)
            .send(entry)
            .expect(500)
            .then( async res => {
               await expect(res.body.errors.username.kind).toBe('minlength');
            })
    });

    test("Create toaster with invalid email", async ()  => {
        const entry = {
            username: "toasterTest",
            password: "toasterPassword",
            email: 'wrongmail',
            address: "just a street",
            name: "toasterTest",
            description: "descripción con más de 20 caracteres"
        }
        
        //Intentamos Guardar el nuevo toaster
        return await request(app)
            .post(testURL)
            .send(entry)
            .expect(400)
            .then( async res => {
                await expect(res.body.reason).toBe('The email format is not valid');
            })
    });

    test("Create two toasters with the same username", async ()  => {
        const entry = {
            username: "toasterTest",
            password: "Testpassword",
            email: 'toasterTest@gmail.com',
            address: "calle con mas de 20 caracteres",
            name: "toasterTest",
            description: "descripción con más de 20 caracteres"
        }

        const repeatedEntry = {
            username: "toasterTest",
            password: "TestCopied",
            email: 'toasterTest2@gmail.com',
            address: "otra calle con mas de 20 caracteres",
            name: "toasterTest 2",
            description: "descripción con más de 20 caracteres"
        }
        
        //Guardamos el primer toaster
        await request(app)
            .post(testURL)
            .send(entry)
            .expect(201)
        
        //Intentamos guardar otro toaster
        return await request(app)
            .post(testURL)
            .send(repeatedEntry)
            .expect(400)
            .then( async res => {
               await expect(res.body.errors[0].msg).toBe("Account already exists");
            })
    });

    test("Create toaster with invalid social network URL", async ()  => {
        const entry = {
            username: "toasterTest",
            password: "toasterPassword",
            email: 'toasterTest@gmail.com',
            address: "just a street",
            name: "toasterTest",
            description: "descripción con más de 20 caracteres",
            facebookUrl: "wrongurl"
        }
        
        //Intentamos Guardar el nuevo toaster
        return await request(app)
            .post(testURL)
            .send(entry)
            .expect(400)
            .then( async res => {
                await expect(res.body.reason).toBe('Incorrect URL');
            })
    });
});
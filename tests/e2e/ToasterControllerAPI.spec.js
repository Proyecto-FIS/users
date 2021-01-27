const mongoose = require("mongoose");
const Toaster = require("../../models/toasters");
const utils = require("../utils");
const makeRequest = utils.makeRequest;
const DatabaseConnection = require("../../db");

describe("ToasterController API", () => {

    const testURL = "/api/v1/toasters";
    const db = new DatabaseConnection();
    let entry;

    beforeAll(async () => {
        await db.setup();
        entry = {
            username: "toasterTest",
            password: "Toasterpassword",
            email: 'toasterTest@gmail.com',
            address: "calle con mas de 20 caracteres",
            name: "toaster name",
            description: "Toaster Description with 20 characters"
        }
    });

    afterAll(() => db.close());

    beforeEach(done => 
        mongoose.connection.dropCollection("toasters", err => {
            mongoose.connection.dropCollection("accounts", error => done())
        })
    );

    // ---------------- TESTS POSTIVOS ----------------
    //GET CREATE & UPDATE
    test("Create and Update Toaster", async () => {
        let url, token;
        
        //Intentamos Guardar el nuevo toaster
        await makeRequest()
            .post(testURL)
            .send(entry)
            .expect(201)
            .then(async response => {
                url = testURL + '/' + response.body._id;
             })
        
        //Comprobamos que se ha guardado correctamente
        await makeRequest()
             .get(url)
             .expect(200)
             .then(async response => {
               await expect(response.body.account.username).toBe(entry.username);
               await expect(response.body.account.email).toBe(entry.email);
               await expect(response.body.account.isCustomer).toBe(false);
               await expect(response.body.address).toBe(entry.address);
               await expect(response.body.name).toBe(entry.name);
               await expect(response.body.description).toBe(entry.description);
              })
        
        //Nos logeamos con los credenciales del nuevo toaster para obtener el token
        await makeRequest()
                .post('/api/v1/auth/login')
                .send({
                    "username": entry.username,
                    "password": entry.password
                })
                .then(async response => {
                    token = response.body.token
                 })
        
        const modified = {
            email: 'nuevotoasterTest@gmail.com',
            address: "otra calle distinta pero con 20 caracteres",
            name: "new toaster name",
            description: "new Toaster Descriptions",
            userToken: token
        }
        
        //Actualizamos la información del toaster
        await makeRequest()
            .put(url)
            .send(modified)
            .expect(200)
            .then(async response => {
               await expect(response);
            })
        
        //Lo obtenemos de nuevo y comprobamos si se ha actualizado
        return await makeRequest()
            .get(url)
            .expect(200)
            .then(async response => {
               await expect(response.body.account.email).toBe(modified.email);
               await expect(response.body.account.isCustomer).toBe(false);
               await expect(response.body.address).toBe(modified.address);
               await expect(response.body.name).toBe(modified.name);
               await expect(response.body.description).toBe(modified.description);
             })
    });

    //GET ALL
    test("Returns all existing toasters", async () => {
        const entry2 = {
            username: "toasterTest2",
            password: "Toasterpassword2",
            email: 'toasterTest2@gmail.com',
            address: "calle con mas de 22 caracteres",
            name: "toaster name 2",
            description: "Toaster Description with 22 characters"
        }

        //Comprobamos que no hay ningun toaster
        await makeRequest()
            .get(testURL)
            .expect(200)
            .then(async response => {
               await expect(response.body.length).toBe(0);
            })
        
        //Intentamos Guardar un toaster
        await makeRequest()
            .post(testURL)
            .send(entry)
            .expect(201)

        //Comprobamos que get ALL devuelve 1 toaster
        await makeRequest()
            .get(testURL)
            .expect(200)
            .then(async response => {
                await expect(response.body.length).toBe(1);
        })

        //Intentamos Guardar un segundo toaster
        await makeRequest()
                .post(testURL)
                .send(entry2)
                .expect(201)
                .then(async response => {
                    url = testURL + '/' + response.body._id;
                 })

        //Comprobamos que get ALL devuelve 2 toasters
        return await makeRequest()
            .get(testURL)
            .expect(200)
            .then(async response => {
                await expect(response.body.length).toBe(2);
        })
        
    });

    // //AWS and alex.coffee APIs call
    test("Random coffee image creation", async () => {
        //Expresión regular para comprobar si es el servidor de coffaine en s3
        var regex = /http(s)?:\/\/(?=(?:....)?coffaine)\S+s3.eu-west-3.amazonaws.com\/(.*?)\w*.png\b/
        //Intentamos Guardar un toaster
        await makeRequest()
            .post(testURL)
            .send(entry)
            .expect(201)
            .then(async response => {
                url = testURL + '/' + response.body._id;
            })

        //Comprobamos que se ha generado una imagen de café y se ha guardado en amazon s3
        return await makeRequest()
            .get(url)
            .expect(200)
            .then(async response => {
               await expect(regex.test(response.body.pictureUrl)).toBe(true);
            })
           
        });

    // ---------------- TESTS NEGATIVOS ----------------
    test("Create a toaster with missing parameters ", async () => {
        const missingEntry = {
            email: 'toasterTest@gmail.com',
            address: "calle con mas de 20 caracteres",
            //missing password and email
        }
        
        //Esperamos que detecte la falta de parámetros
        return await makeRequest()
            .post(testURL)
            .send(missingEntry)
            .expect(400)
            .then(async res => {
                await expect(res.body.reason).toBe('Missing fields');
            })
    });

    test("Create two toasters with the same username", async ()  => {
        const repeatedEntry = {
            username: "toasterTest",
            password: "NewToasterpassword",
            email: 'NewtoasterTest@gmail.com',
            address: "the new street of the new toaster",
            name: "toaster name 2",
            description: "Toaster Description with 20 characters"
        }
        
        //Guardamos el primer toaster
        await makeRequest()
            .post(testURL)
            .send(entry)
            .expect(201)
        
        //Intentamos guardar otro toaster
        return await makeRequest()
            .post(testURL)
            .send(repeatedEntry)
            .expect(400)
            .then(async res => {
               await expect(res.body.errors[0].msg).toBe("Account already exists");
            })
    });
});
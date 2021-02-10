const mongoose = require("mongoose");
const Customer = require("../../models/customers");
const utils = require("../utils");
const makeRequest = utils.makeRequest;
const DatabaseConnection = require("../../db");
require("dotenv").config({ path: __dirname + "/../.env" });

describe("CustomerController API", () => {

    const testURL = "/api/v1/customers";
    const App = require("../../server");
    const db = new DatabaseConnection();
    let entry;

    beforeAll(async () => {
        jest.setTimeout(30000)
        await db.setup();
        global.server = new App();
        await global.server.run();
        entry = {
            username: "customerTest",
            password: "Customerpassword",
            email: 'customerTest@gmail.com',
            address: "calle con mas de 20 caracteres",

        }
    });

    afterAll(async () => { 
        db.close();
        await global.server.stop();
    })
    
    beforeEach(done => 
        mongoose.connection.dropCollection("customers", err => {
            mongoose.connection.dropCollection("accounts", error => done())
        })
    );

    // ---------------- TESTS POSTIVOS ----------------
    //GET CREATE & UPDATE
    test("Create and Update Customer", async () => {
        let url, token;
        
        //Intentamos Guardar el nuevo customer
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
                await expect(response.body.account.isCustomer).toBe(true);
                await expect(response.body.address).toBe(entry.address);
              })
        
        //Nos logeamos con los credenciales del nuevo customer para obtener el token
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
            email: 'nuevocustomerTest@gmail.com',
            address: "otra calle distinta pero con 20 caracteres",
            userToken: token
        }
        
        //Actualizamos la información del customer
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
                await expect(response.body.account.isCustomer).toBe(true);
                await expect(response.body.address).toBe(modified.address);
             })
    });

    // //AWS and  kitten APIs call
    test("Random kitten image creation", async () => {
        //Expresión regular para comprobar si es el servidor de coffaine en s3
        var regex = /http(s)?:\/\/(?=(?:....)?coffaine)\S+s3.eu-west-3.amazonaws.com\/(.*?)\w*.png\b/
        //Intentamos Guardar un customer
        await makeRequest()
            .post(testURL)
            .send(entry)
            .expect(201)
            .then(async response => {
                url = testURL + '/' + response.body._id;
            })

        //Comprobamos que se ha generado una imagen de gatito y se ha guardado en amazon s3
        return await makeRequest()
            .get(url)
            .expect(200)
            .then(async response => {
                await expect(regex.test(response.body.pictureUrl)).toBe(true);
            })
           
        });

    // ---------------- TESTS NEGATIVOS ----------------
    test("Create a customer with missing parameters ", async () => {
        const missingEntry = {
            email: 'customerTest@gmail.com',
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

    test("Create two customers with the same username", async ()  => {
        const repeatedEntry = {
            username: "customerTest",
            password: "NewCustomerpassword",
            email: 'NewcustomerTest@gmail.com',
            address: "the new street of the new customer"
        }
        
        //Guardamos el primer customer
        await makeRequest()
            .post(testURL)
            .send(entry)
            .expect(201)
        
        //Intentamos guardar otro customer
        return await makeRequest()
            .post(testURL)
            .send(repeatedEntry)
            .expect(400)
            .then(async res => {
                await expect(res.body.errors[0].msg).toBe("Account already exists");
            })
    });
});
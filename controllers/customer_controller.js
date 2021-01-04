const customerCtrl = {};
const jwt = require('jsonwebtoken');
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
const cfg = require('config');
const Customer = require('../models/customers');
const Account = require('../models/accounts');

require('dotenv/config')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

customerCtrl.getCustomers = async (req, res) => {
    try { 
        const customers =  await Customer.find();
        Account.populate(customers, {path: "account"},function(err, customers){
            res.status(200).json(customers);
        });
    } catch (err) {
        console.log(Date() + "-" + err);
        res.sendStatus(500);
    }
}

customerCtrl.getCustomer = async (req, res) => {
    try{ 
        const customer =  await Customer.findById(req.params.id)
        Account.populate(customer, {path: "account"},function(err, customer){
            res.status(200).json(customer);
        });
    } catch (err) {
        console.log(Date() + "-" + err);
        res.sendStatus(404);
    }
}

customerCtrl.createCustomer = async (req, res) => {
    const { username, password, email, address } = req.body;
    let  myFile = req.file.originalname.split(".")
    const fileType = myFile[myFile.length - 1]

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: req.file.buffer
    }
    const S3 = new AWS.S3({
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET_NAME,
        sessionToken: process.env.AWS_SESSION_TOKEN
    })

    try{
        var s3upload = S3.upload(params).promise();
        await s3upload
            .then(function(data) {
                pictureUrl = data.Location
            });
    } catch(err) {
        console.log(Date() + "-" + err)
        pictureUrl = ''
    }
    const newAccount = new Account({ username, password, email });
    try { 
        const account = await newAccount.save();
        try{
            const newCustomer = new Customer({ pictureUrl, address, account });
            await newCustomer.save();

            const payload = {
                account: {
                    id: account.id
                    }
                };
            jwt.sign(payload, cfg.get("jwttoken"), {expiresIn: process.env.TOKEN_EXPIRATION_TIME || 3600000}, (err, token) => {
                if(err) {
                    console.log(Date() + "-" + err)
                    res.sendStatus(500)
                } else {
                    res.json({token});
                }
            });

        } catch (err) {
            // TODO: quitar esto e implementar rollback
            await Account.deleteOne( {"_id": account})
            console.log(Date() + "-" + err)
            res.sendStatus(500) 
        }
    }
    catch (err) {
        console.log(Date() + "-" + err);
        res.sendStatus(500);
    }
 }

customerCtrl.updateCustomer = async (req, res) => {
    const { username, email, pictureUrl, address } = req.body
    try {
        const customer = await Customer.findById(req.params.id)
        await Customer.updateOne(customer, { pictureUrl, address })
       
        await Account.findOneAndUpdate({"_id": customer.account}, { username, email })
        res.status(200).json({message: "Customer updated"})
    } catch (err) {
        console.log(Date() + "-" + err)
        res.sendStatus(500)
    }
}

customerCtrl.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOneAndDelete(req.params.id)
        await Account.deleteOne( {"_id": customer.account})
        res.status(200).json({message: 'customer deleted'})
    } catch(err) {
        console.log(Date() + "-" + err)
        res.sendStatus(500)
    }
}


module.exports = customerCtrl
const customerCtrl = {};
const jwt = require('jsonwebtoken');
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
const cfg = require('config');
const Customer = require('../models/customers');
const Account = require('../models/accounts');
const Bcrypt = require("bcryptjs");
require('dotenv/config')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const createCircuitBreaker =  require('../circuitBreaker.js').createCircuitBreaker
const axios = require("axios");

const awscommand = createCircuitBreaker({
    name: "AWS calls",
    errorThreshold: 20,
    timeout: 4000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (S3function) => S3function,
    fallback: (err, args) => {
      console.log(Date() + "-"  + err)
      throw {
        response: {
          status: 503,
        },
      };
    },
});
  
const removeHistoryCommand = createCircuitBreaker({
    name: "Coffaine Sales MS Calls",
    errorThreshold: 20,
    timeout: 8000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (id) => axios.get("https://jsonplaceholder.typicode.com/todos/1"),
    fallback: (err, args) => {
      if (err && err.isAxiosError) throw err;
      throw {
        response: {
          status: 503,
        },
      };
    },
  });

customerCtrl.getCustomer = async (req, res) => {
    try{ 
        const customer = await Customer.findOne( {account: req.params.accountId} );
        
        Account.populate(customer, {path: "account"}, function(err, customer){
            if (err) return handleError(err);

            res.status(200).json(customer);
        });
    } catch (err) {
        console.log(Date() + "-" + err);
        res.status(404).json(err);
    }
}

customerCtrl.createCustomer = async (req, res) => {
    const { username, password, email, address } = req.body;
    const isCustomer = true;

    if(req.file){
        pictureUrl = await imgUpload(req.file)
    } else {
        pictureUrl = ''
    }
    const newAccount = new Account({ username, password, email, isCustomer });
    try { 
        accountExists = await Account.findOne({username});
        
        if(accountExists){
            return res.status(400).json( { errors:[{msg:"Account already exists"}] });
        }

        const account = await newAccount.save();
        const newCustomer = new Customer({ pictureUrl, address, account });
        
        try {
            await newCustomer.save();
            jwt.sign({id: account.id}, cfg.get("jwttoken"), {expiresIn:parseInt(process.env.TOKEN_EXPIRATION_TIME) || 3600000}, (err, token) => {
                if(err) {
                    throw err;
                } else {
                    res.status(201).json({
                    _id: account.id,
                    username: account.username,
                    email: account.email,
                    isCustomer: account.isCustomer,
                    token: token});
                }
            });

        } catch (err) {
            // TODO: quitar esto e implementar rollback
            await Account.deleteOne( {"_id": account})
            console.log(Date() + "-" + err)
            res.status(500).json(err);
        }
    }
    catch (err) {
        console.log(Date() + "-" + err);
        res.status(500).json(err);
    }
}

customerCtrl.updateCustomer = async (req, res) => {
    var { email, address, password } = req.body
    try {
        const customer = await Customer.findOne( {account: req.params.accountId} );
        if(req.file){
            pictureUrl = await imgUpload(req.file)
            await imgDelete(customer.pictureUrl)
        }
        else{
            pictureUrl = customer.pictureUrl
        }

        var oldPictureUrl = customer.pictureUrl;
        if(pictureUrl === oldPictureUrl){
            pictureUrl = oldPictureUrl;
        }
        var oldAddress = customer.address;
        if(address === oldAddress){
            address = oldAddress;
        }

        await Customer.updateOne(customer, { pictureUrl, address }, { runValidators: true })
       
        const account = await Account.findOne({"_id": customer.account});

        account.email = email;

        if(password){
            account.password = password;
        }

        await account.save();

        res.status(200).json({message: "Customer updated"})
    } catch (err) {
        console.log(Date() + "-" + err)
        res.status(500).json(err);
    }
}

customerCtrl.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne( {account: req.params.accountId} );
        await imgDelete(customer.pictureUrl)
        //removeHistoryCommand.execute(customer.account._id)
        await Account.deleteOne( {"_id": customer.account})
        await Customer.deleteOne(customer)
        res.status(200).json({message: 'customer deleted'})
    } catch(err) {
        console.log(Date() + "-" + err)
        res.status(500).json(err)
    }
}

async function imgDelete(pictureUrl){
    try{
        const S3 = new AWS.S3({
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET_NAME,
            sessionToken: process.env.AWS_SESSION_TOKEN
        });
        const fileurl = pictureUrl.split("/");
        const key = fileurl[fileurl.length - 1];
        const params = { Bucket: process.env.AWS_BUCKET_NAME, Key: key };

        var s3function = S3.deleteObject(params).promise();
        await awscommand.execute(s3function)
            .catch(err => {
                console.log(Date() + "-" + err)
        })
    } catch(err){
        console.log(Date() + "-" + err);
    }
}

async function imgUpload(file){
    let url;
    try{
        let  filename = file.originalname.split(".");
        const fileType = filename[filename.length - 1]
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${uuidv4()}.${fileType}`,
            Body: file.buffer
        }
        const S3 = new AWS.S3({
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET_NAME,
            sessionToken: process.env.AWS_SESSION_TOKEN
        })
        var s3function = S3.upload(params).promise();
        
        await awscommand.execute(s3function)
            .then(function(data) {
                url = data.Location	
            })
            .catch(err => {
                console.log(Date() + "-" + err)
                url = ''
        })
    } catch(err) {	
        console.log(Date() + "-" + err)
        url = ''
    }
    return url
}

module.exports = customerCtrl
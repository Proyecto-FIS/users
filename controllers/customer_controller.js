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
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
    name: "Sales MS Delete History Calls",
    errorThreshold: 20,
    timeout: 8000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (token) => axios.delete(`${process.env.SALES_MS}history?userToken=${token}`),
    fallback: (err, args) => {
      if (err && err.isAxiosError) throw err;
      throw {
        response: {
          status: 503,
        },
      };
    },
  });        
  
const removeSubscriptionCommand = createCircuitBreaker({
    name: "Sales MS Delete Subscription Calls",
    errorThreshold: 20,
    timeout: 8000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (token) => axios.delete(`${process.env.SALES_MS}all-subscription?userToken=${token}`),
    fallback: (err, args) => {
      if (err && err.isAxiosError) throw err;
      throw {
        response: {
          status: 503,
        },
      };
    },
  });

const getKittenCommand = createCircuitBreaker({
    name: "placekitten Calls",
    errorThreshold: 20,
    timeout: 8000,
    healthRequests: 5,
    sleepTimeMS: 100,
    maxRequests: 0,
    errorHandler: (err) => false,
    request: (url) => axios.request({
        url: url,
        method: 'GET',
        responseType: 'arraybuffer'
    }),
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
        try {
            const url = 'https://placekitten.com/g/'+ Math.floor(Math.random() * 450 + 450) + '/' + Math.floor(Math.random() * 450 + 450);
            await getKittenCommand.execute(url).then(async (response) => {
                var file = {
                    originalname: "newImage.png",
                    buffer: response.data
                }
                pictureUrl = await imgUpload(file)
            });
        } catch(err) {
            pictureUrl = ''
        }
    }

    const newAccount = new Account({ username, password, email, isCustomer });
    try {
        accountExists = await Account.findOne({username});
        
        if(accountExists){
            return res.status(400).json( { errors:[{msg:"Account already exists"}] });
        }
        const account = await newAccount.save();
        // Guardo en customer el objeto que devuelve stripe
        const stripe_customer = await stripe.customers.create({
            name: account.username,
            email: account.email
        });
        const stripe_id = stripe_customer.id

        const newCustomer = new Customer({pictureUrl, address, stripe_id, account });

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
        const token = req.body.userToken || req.query.userToken;
        
        const customer = await Customer.findOne( {account: req.params.accountId} );
        if(!customer){
            res.status(404).json({message: 'customer not found'})
        } else {
            if(customer.pictureUrl){
                await imgDelete(customer.pictureUrl);
            }
            await removeHistoryCommand.execute(token).catch((err) => {
                console.log(err)
                res.status(500).json(err); 
            });

            await removeSubscriptionCommand.execute(token).catch((err) => {
                console.log(err)
                res.status(500).json(err); 
            });

            await Account.deleteOne( {"_id": customer.account});
            await Customer.deleteOne(customer);
            res.status(200).json({message: 'customer deleted'});
        }
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
            region: process.env.REGION
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
            Body: file.buffer,
            ACL: "public-read-write"
        }
        const S3 = new AWS.S3({
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET_NAME,
            region: process.env.REGION
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

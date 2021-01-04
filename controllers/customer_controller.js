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

customerCtrl.getCustomer = async (req, res) => {
    try{ 
        const customer = await Customer.findOne( {account: req.params.accountId} );
        
        Account.populate(customer, {path: "account"}, function(err, customer){
            if (err) return handleError(err);

            res.status(200).json(customer);
        });
    } catch (err) {
        console.log(Date() + "-" + err);
        res.sendStatus(404);
    }
}

customerCtrl.createCustomer = async (req, res) => {
    const { username, password, email, address } = req.body;
    const isCustomer = true;

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

            jwt.sign({id: account.id}, cfg.get("jwttoken"), {expiresIn:process.env.TOKEN_EXPIRATION_TIME || 3600000}, (err, token) => {
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
            res.sendStatus(500)    
        }
    }
    catch (err) {
        console.log(Date() + "-" + err);
        res.sendStatus(500);
    }
}

customerCtrl.updateCustomer = async (req, res) => {
    var { email, pictureUrl, address, password } = req.body

    try {
        const customer = await Customer.findOne( {account: req.params.accountId} );

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

        var oldEmail = account.email;
        if(email === oldEmail){
            email = oldEmail;
        }
        var oldPassword = account.password;
        if(!password){
            password = oldPassword;
        } else {
            password = Bcrypt.hashSync(password, 10);
        }

        await Account.updateOne(account, { email, password }, { runValidators: true });

        res.status(200).json({message: "Customer updated"})
    } catch (err) {
        console.log(Date() + "-" + err)
        res.status(500).json({errors:err})
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
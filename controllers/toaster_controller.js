const toasterCtrl = {}
const jwt = require('jsonwebtoken');
const cfg = require('config');
const Toaster = require('../models/toasters')
const Account = require('../models/accounts')
require('dotenv/config')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

toasterCtrl.getToasters = async (req, res) => {
    try{ 
        const toasters =  await Toaster.find()
        Account.populate(toasters, {path: "account"},function(err, toasters){
            res.status(200).json(toasters);
        }) 
    } catch (err) {
        console.log(Date() + "-" + err)
        res.sendStatus(500).json(err);
    }
}

toasterCtrl.getToaster = async (req, res) => {
    try{ 
        const toaster = await Toaster.findOne( {account: req.params.accountId} );

        Account.populate(toaster, {path: "account"},function(err, toaster){
            if (err) return handleError(err);

            res.status(200).json(toaster);
        }) 
    } catch (err) {
        console.log(Date() + "-" + err)
        res.sendStatus(404).json(err);
    }
}

toasterCtrl.createToaster = async (req, res) => {
    const { username, password, email, name, description, phoneNumber, 
        address, instagramUrl, facebookUrl, twitterUrl } = req.body;
    const isCustomer = false;

    try{     
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
        var s3upload = S3.upload(params).promise();
        await s3upload
            .then(function(data) {
                pictureUrl = data.Location
            });
    } catch(err) {
        console.log(Date() + "-" + err)
        pictureUrl = req.body.pictureUrl
    }

    const newAccount = new Account({ username, password, email, isCustomer });
    try { 
        accountExists = await Account.findOne({username});
        
        if(accountExists){
            return res.status(400).json( { errors:[{msg:"Account already exists"}] });
        }

        const account = await newAccount.save();
        const newToaster = new Toaster({ name, description, phoneNumber, pictureUrl, address, 
                                                instagramUrl, facebookUrl, twitterUrl, account });
        try {
            await newToaster.save();

            jwt.sign({id: account.id}, cfg.get("jwttoken"), {expiresIn: process.env.TOKEN_EXPIRATION_TIME || 3600000}, (err, token) => {
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
            await Account.deleteOne( {"_id": account});
            console.log(Date() + "-" + err);
            res.status(500).json(err);;
        }
    }
    catch (err) {
        console.log(Date() + "-" + err);
        res.status(500).json(err);
    }
}

toasterCtrl.updateToaster = async (req, res) => {
    var { email, name, description, phoneNumber, pictureUrl, 
        address, instagramUrl, facebookUrl, twitterUrl, password } = req.body

    try {
        const toaster = await Toaster.findOne( {account: req.params.accountId} );

        var oldName = toaster.name;
        if(name === oldName){
            name = oldName;
        }
        var oldDescription = toaster.description;
        if(description === oldDescription){
            description = oldDescription;
        }
        var oldPhoneNumber = toaster.phoneNumber;
        if(phoneNumber === oldPhoneNumber){
            phoneNumber = oldPhoneNumber;
        }
        var oldPictureUrl = toaster.pictureUrl;
        if(pictureUrl === oldPictureUrl){
            pictureUrl = oldPictureUrl;
        }
        var oldAddress = toaster.address;
        if(address === oldAddress){
            address = oldAddress;
        }
        var oldInstagramUrl = toaster.instagramUrl;
        if(instagramUrl === oldInstagramUrl){
            instagramUrl = oldInstagramUrl;
        }
        var oldFacebookUrl = toaster.facebookUrl;
        if(facebookUrl === oldFacebookUrl){
            facebookUrl = oldFacebookUrl;
        }
        var oldTwitterUrl = toaster.twitterUrl;
        if(twitterUrl === oldTwitterUrl){
            twitterUrl = oldTwitterUrl;
        }

        await Toaster.updateOne(toaster, { name, description, phoneNumber, pictureUrl, 
                                        address, instagramUrl, facebookUrl, twitterUrl },
                                        { runValidators: true });

                                    
        const account = await Account.findOne({"_id": toaster.account});

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

        res.status(200).json({message: "Toaster updated"})
    } catch (err) {
        console.log(Date() + "-" + err)
        res.status(500).json(err);
    }
}

toasterCtrl.deleteToaster = async (req, res) => {
    try {
        const toaster = await Toaster.findOneAndDelete(req.params.id)
        await Account.deleteOne( {"_id": toaster.account})
        res.status(200).json({message: 'toaster deleted'})
    } catch(err) {
        console.log(Date() + "-" + err)
        res.sendStatus(500).json(err);
    }
}


module.exports = toasterCtrl
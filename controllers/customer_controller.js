const customerCtrl = {};
const jwt = require('jsonwebtoken');
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
const cfg = require('config');
const Customer = require('../models/customers');
const Account = require('../models/accounts');
const Bcrypt = require("bcryptjs");


customerCtrl.getCustomer = async (req, res) => {
    try { 
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
    const { username, password, email, pictureUrl, address } = req.body;
    const isCustomer = true;
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

            //TODO cambiar el expires a 3600 en producción
            jwt.sign({id: account.id}, cfg.get("jwttoken"), {expiresIn:3600000}, (err, token) => {
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
        res.status(500).json(err);
    }
}

customerCtrl.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne( {account: req.params.accountId} );

        await Account.deleteOne( {"_id": customer.account})
        await Customer.deleteOne(customer)
        res.status(200).json({message: 'Customer deleted'})
    } catch(err) {
        console.log(Date() + "-" + err)
        res.status(500).json(err)
    }
}


module.exports = customerCtrl
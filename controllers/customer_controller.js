const customerCtrl = {};
const jwt = require('jsonwebtoken');
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
const cfg = require('config');
const Customer = require('../models/customers');
const Account = require('../models/accounts');

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
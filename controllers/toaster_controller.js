const toasterCtrl = {}
const jwt = require('jsonwebtoken');
const cfg = require('config');
const Toaster = require('../models/toasters')
const Account = require('../models/accounts')

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
        const toaster =  await Toaster.findById(req.params.id)
        Account.populate(toaster, {path: "account"},function(err, toaster){
            res.status(200).json(toaster);
        }) 
    } catch (err) {
        console.log(Date() + "-" + err)
        res.sendStatus(404).json(err);
    }
}

toasterCtrl.createToaster = async (req, res) => {
    const { username, password, email, name, description, phoneNumber, pictureUrl, address, socialNetworks } = req.body;
    const isCustomer = false;
    const newAccount = new Account({ username, password, email, isCustomer });
    try { 
        accountExists = await Account.findOne({username});
        
        if(accountExists){
            return res.status(400).json( { errors:[{msg:"Account already exists"}] });
        }

        const account = await newAccount.save();
        const newToaster = new Toaster({ name, description, phoneNumber, pictureUrl, address, socialNetworks, account });
        try {
            await newToaster.save();

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
    const { username, email, name, description, phoneNumber, pictureUrl, address, socialNetworks } = req.body
    try {
        const toaster = await Toaster.findById(req.params.id)
        await Toaster.update(toaster, { name, description, phoneNumber, pictureUrl, address, socialNetworks })
        await Account.findOneAndUpdate({"_id": toaster.account}, { username, email })
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
const toasterCtrl = {}

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
        res.sendStatus(500)
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
        res.sendStatus(404)
    }
}

toasterCtrl.createToaster = async (req, res) => {
    const { username, password, email, name, description, phoneNumber, pictureUrl, address, socialNetworks } = req.body
    const newAccount = new Account({ username, password, email })
    try { 
        const account = await newAccount.save()
        const newToaster = new Toaster({ name, description, phoneNumber, pictureUrl, address, socialNetworks, account })
        try {
            await newToaster.save()
            res.json({message: "Toaster created"})
        } catch (err) {
            // TODO: quitar esto e implementar rollback
            await Account.deleteOne( {"_id": account})
            console.log(Date() + "-" + err)
            res.sendStatus(500)    
        }
    }
    catch (err) {
        console.log(Date() + "-" + err)
        res.sendStatus(500)
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
        res.sendStatus(500)
    }
}

toasterCtrl.deleteToaster = async (req, res) => {
    try {
        const toaster = await Toaster.findOneAndDelete(req.params.id)
        await Account.deleteOne( {"_id": toaster.account})
        res.status(200).json({message: 'toaster deleted'})
    } catch(err) {
        console.log(Date() + "-" + err)
        res.sendStatus(500)
    }
}


module.exports = toasterCtrl
const customerCtrl = {}

const Customer = require('../models/customers')
const Account = require('../models/accounts')

customerCtrl.getCustomers = async (req, res) => {
    try{ 
        const customers =  await Customer.find()
        Account.populate(customers, {path: "account"},function(err, customers){
            res.status(200).json(customers);
        }) 
    } catch (err) {
        console.log(Date() + "-" + err)
        res.sendStatus(500)
    }
}

customerCtrl.getCustomer = async (req, res) => {
    try{ 
        const customer =  await Customer.findById(req.params.id)
        Account.populate(customer, {path: "account"},function(err, customer){
            res.status(200).json(customer);
        }) 
    } catch (err) {
        console.log(Date() + "-" + err)
        res.sendStatus(404)
    }
}

customerCtrl.createCustomer = async (req, res) => {
    const { username, password, email, pictureUrl, address } = req.body
    const newAccount = new Account({ username, password, email })
    try { 
        const account = await newAccount.save()
        const newCustomer = new Customer({ pictureUrl, address, account })
        try {
            await newCustomer.save()
            res.json({message: "Customer created"})
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
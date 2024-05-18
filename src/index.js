const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    const customerAlredyExists = customers.some((customer) => customer.cpf === cpf);

    if (customerAlredyExists) {
        return res.status(400).json({ error: 'Customer alredy exists!' });
    }

    customers.push({ cpf, name, id: uuidv4(), statement: [] });

    return res.status(201).send();
});

app.get('/statement/:cpf', (req, res) => {
    const { cpf } = req.params;

    const customer = customers.find((customer) => customer.cpf === cpf);

    return res.json(customer.statement);
});

app.listen(8181, () => console.log('Server is Running'));

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

// Middlewares
function verifyIfExistsAccountCPF(req, res, next) {
    const { cpf } = req.headers;
    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ error: 'Customer not found' });
    }

    req.customer = customer; // pass the customer thought the req, to my route

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);
    return balance;
}

app.post('/account', (req, res) => {
    const { cpf, name } = req.body;
    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

    if (customerAlreadyExists) {
        return res.status(400).json({ error: 'Customer already exists!' });
    }

    customers.push({ cpf, name, id: uuidv4(), statement: [] });
    return res.status(201).send();
});

app.post('/deposit', verifyIfExistsAccountCPF, (req, res) => {
    const { description, amount } = req.body;
    const { customer } = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit',
    };

    customer.statement.push(statementOperation);

    return res.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => {
    const { amount } = req.body;
    const { customer } = req;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return res.status(400).json({ error: 'Insufficient founds!' });
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit',
    };

    customer.statement.push(statementOperation);

    return res.json(201).send();
});

// app.use(verifyIfExistsAccountCPF) dessa forma toda rota a baixo tera o middleware

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
    const { customer } = req;
    return res.json(customer.statement);
});

app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const formatDate = new Date(date + ' 00:00');

    const statement = customer.statement.filter(
        (statement) => statement.created_at.toDateString() === new Date(formatDate).toDateString(),
    );

    return res.json(statement);
});

app.listen(8181, () => console.log('Server is Running'));

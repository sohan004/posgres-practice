const express = require('express');
const app = express();
const port = 3000
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const pool = require('./db')

app.use(cors())
app.use(express.json())


app.get('/', async (req, res) => {
    res.send('hello world')
})

app.post('/user', async (req, res) => {
    const _id = await uuidv4()
    const { name, email, phone } = await req.body
    try {
        const inserUser = await pool.query(
            `INSERT INTO users 
            (_id, name, email, phone) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`,
            [_id, name, email, phone]);

        res.send({ message: 'data create success fully', data: inserUser.rows })

    } catch (error) {
        console.log('error=======>>>', error)
    }
})


app.get('/user', async (req, res) => {
    try {
        const allUsers = await pool.query(
            `SELECT *
            FROM users`,
            // WHERE users.name ILIKE $1 OR users.email ILIKE $1`, -------------(case insessitive )
            // [`%buyyan%`] -------------(search by word)
            // LIMIT $1 OFFSET $2;--------------  (limit, skip)
            // ORDER BY created_at ASC------------ (sorting assending)
            // ORDER BY created_at DESC------------ (sorting dessanding)
        );
        res.send({ allUsers: allUsers.rows })
    } catch (error) {
        console.log(error)
    }
})

app.get('/user/:id', async (req, res) => {
    const id = await req.params.id
    console.log(id)
    try {
        const allUsers = await pool.query(
            `SELECT name, email
            FROM users
            WHERE _id = $1`,
            [id]
        );
        res.send({ allUsers: allUsers.rows })
    } catch (error) {
        console.log(error)
    }
})

app.post('/todos', async (req, res) => {
    try {
        const { todos_name, owner } = await req.body
        const _id = await uuidv4()
        const createTodos = await pool.query(
            `INSERT INTO todos 
            (_id, todos_name, owner) 
            VALUES ($1, $2, $3) 
            RETURNING *`,
            [
                _id,
                todos_name,
                owner
            ]);
        res.send({ todo: createTodos.rows })
    } catch (error) {
        console.log(error)
    }
})

app.get('/todos', async (req, res) => {
    try {
        const allTodos = await pool.query(`
        SELECT
        todos.todos_name , 
        todos._id ,
        users.name AS owner_name,
        users.email AS owner_email
        FROM todos
        JOIN users ON todos.owner = users._id
        `);
        res.send({ todos: allTodos.rows })
    } catch (error) {
        console.log(error)
    }
})

app.put('/todos/:id', async (req, res) => {
    const id = await req.params.id
    const name = await req.body.name
    try {
        const allTodos = await pool.query(`
        UPDATE
        todos
        SET
        todos_name = $1
        WHERE todos._id = $2
        RETURNING *
        `, [
            name,
            id
        ]);
        res.send({ todos: allTodos.rows })
    } catch (error) {
        console.log(error)
    }
})








app.listen(port)
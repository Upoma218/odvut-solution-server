const express = require('express');
const cors = require('cors');
const port = process.env.local || 5000;
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Odvut Solution is running on port 5000')
})
app.listen(port, () => {
    console.log(`Odvut solution is running on ${port}`)
})
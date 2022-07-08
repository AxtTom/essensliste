import * as http from 'http';
import express from 'express';
import { MongoClient } from 'mongodb';

(async () => {
    console.log('Connecting to DB...');
    const mongo = new MongoClient('mongodb://127.0.0.1:27017');
    await mongo.connect();
    console.log('Connected to DB!');

    const essen = mongo.db('website').collection('essen');

    const app = express()
    .disable('x-powered-by')
    .use(express.json());
    const server = http.createServer(app);

    app.get('/api', (req, res) => {
        essen.find({}).toArray().then(data => {
            console.log(data);
            res.end(JSON.stringify(data.map(item => {
                return {
                    name: item.name,
                    list: item.list
                }
            })));
        });
    });

    app.post('/api', (req, res) => {
        essen.insertOne(req.body);
        res.end();
    });

    app.use('/', express.static('html'));

    server.listen(8999, 'localhost', () => {
        console.log('Server running!');
    })
})();
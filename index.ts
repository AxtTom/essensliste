import * as http from 'http';
import express from 'express';
import { MongoClient } from 'mongodb';

(async () => {
    console.log('Connecting to DB...');
    const mongo = new MongoClient('mongodb://127.0.0.1:27017');
    await mongo.connect();
    console.log('Connected to DB!');

    const essen = mongo.db('website').collection('essen');
    const fooders = mongo.db('website').collection('fooders');

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

    app.post('/api', async (req, res) => {
        if (req.body.pin && req.body.list) {
            const user = await fooders.findOne({ pin: req.body.pin });
            if (user?.name) {
                essen.insertOne({
                    name: user.name,
                    list: req.body.list
                });
            }
        } 
        res.end();
    });

    app.delete('/api', (req, res) => {
        if (req.body.pin && req.body.pin == '1517')
        essen.deleteMany({});
        res.end();
    });

    app.use('/', express.static(`${__dirname}/html`));

    server.listen(8999, 'localhost', () => {
        console.log('Server running!');
    });

    process.on('uncaughtException', (err) => {
        console.error(err);
    });
})();
const express = require('express');
const r = require('rethinkdb');
const WebSocket = require('ws');

const app = express();

app.use('/', express.static('public'));

r.connect( {host: 'localhost', port: 28015}, (err, connection) => {
    if (err) throw err;

    const wss = new WebSocket.Server({ port: 3001 });
    wss.on('connection', ws => {
        ws.on('message', raw => {
            var data = JSON.parse(raw);
            r.db('chat').table('messages').insert({
                time: Date.now(),
                from: data.from,
                message: data.message
            }).run(connection, err => {
                if (err) throw err;
            });
        });
    });

    r.db('chat').table('messages').changes().run(connection, (err, cursor) => {
        if (err) throw err;
        cursor.each((err, row) => {
            if (err) throw err;

            if(row.new_val) {
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(row.new_val));
                    }
                });
            }
        });
    });

    app.get('/old-messages', (req, res) => {
        r.db('chat').table('messages').orderBy(r.desc('time')).limit(10).run(connection, (err, cursor) => {
            if (err) throw err;

            cursor.toArray((err, result) => {
                if (err) throw err;

                res.send(result);
            });
        });
    });

});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});

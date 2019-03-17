#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

var SimpleHashTable = require('simple-hashtable');
var Connections = new SimpleHashTable();

const host = require('os').hostname();

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});


server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});


wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}


wsServer.on('request', function(request) {
    // if (!originIsAllowed(request.origin)) {
    //   // Make sure we only accept requests from an allowed origin
    //   request.reject();
    //   console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    //   return;
    // }
    
    

    // var connection = request.accept('echo-protocol', request.origin);

    var connection = request.accept();
    console.log(request.remoteAddress + "  : " +  request.key);
    console.log((new Date()) + ' Connection accepted from origin : ' + request.origin );
    connection.on('message', function(message) {
        if (message.type === 'utf8') {

            if (!connection.Authenticated)
            {
                if (message.utf8Data != 'Hello')
                {
                    connection.sendUTF('Invalid Request : Connection Closed By Server');
                    return;
                }
                connection.Authenticated = true;
                console.log('Hello Recieved');
                connection.sendUTF('Hello Accepted' + ' from server : ' + host);
                return;
            }

            if (!connection.Bank)
            {
                connection.Bank = message.utf8Data;
                console.log(connection.Bank + ' is connected' );
                connection.sendUTF('Bank Name Accepted' + ' from server : ' + host);

                Connections.put(connection.Bank , connection);

                return;
            }

            console.log('Received Message: ' + message.utf8Data + ' from : ' + connection.Bank);
            connection.sendUTF('Reply to "' + message.utf8Data + '" from server : ' + host);
        }
        // else if (message.type === 'binary') {
        //     console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        //     connection.sendBytes(message.binaryData);
        // }
    });

    connection.on('close', function(reasonCode, description) {
        // console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        console.log((new Date()) + ' Peer ' + connection.Bank + ' disconnected.');
        Connections.remove(connection.Bank);

    });
});


// setTimeout(() => {

//     console.log(Connections);
//     Connections.get('BankA').sendUTF('you have a message from BankB');
//     Connections.get('BankC').sendUTF('you have a message from BankA');

// } , 10000);
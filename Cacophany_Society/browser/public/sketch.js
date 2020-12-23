/*
    p5.js MQTT Client example
    This example uses p5.js: https://p5js.org/
    and the Eclipse Paho MQTT client library: https://www.eclipse.org/paho/clients/js/
    to create an MQTT client that sends and receives MQTT messages.
    The client is set up for use on the shiftr.io test MQTT broker (https://next.shiftr.io/try),
    but has also been tested on https://test.mosquitto.org

    created 12 June 2020
    modified 20 Aug 2020
    by Tom Igoe
*/

// MQTT client details:
let broker = {
    hostname: 'testxmas.cloud.shiftr.io',
    port: 443 //this needs to be 443 even if shiftr says to use 1883 because we need WSS
};
// MQTT client:
let client;
// client credentials:
let creds = {
    clientID: 'p5Client',
    userName: 'testxmas',
    password: 'vdF5lNt8iXnz1UVR'
}
// topic to subscribe to when you connect:
let topic = 'distraction';
// let kitchen = "kitchen";

// a pushbutton to send messages
let sendButton;
let localDiv;
let remoteDiv;

// intensity of the circle in the middle
let intensity = 255;

let canvas;

//chaos mode toggle
let isChaos = false;
let chaosSlider;

function setup() {
    // canvas = createCanvas(400, 400);
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvasContainer");
    // Create an MQTT client:
    client = new Paho.MQTT.Client(broker.hostname, Number(broker.port), creds.clientID);
    // set callback handlers for the client:
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    // connect to the MQTT broker:
    client.connect(
        {
            onSuccess: onConnect,       // callback function for when you connect
            userName: creds.userName,   // username
            password: creds.password,   // password
            useSSL: true                // use SSL
        }
    );
    // create the send button:
    sendButton = createButton('ALL ROOMS');
    sendButton.size(200, 100);
    sendButton.position(20, 20);
    sendButton.style('background-color', 'black');
    sendButton.style('color', 'white');
    sendButton.mousePressed(sendMsgToAll);
    // create a div for local messages:
    localDiv = createDiv('local messages will go here');
    localDiv.position(400, 50);
    localDiv.style('color', '#fff');
    // create a div for the response:
    remoteDiv = createDiv('waiting for messages');
    remoteDiv.position(400, 80);
    remoteDiv.style('color', '#fff');

    // the room buttons
    kitchenButton = createButton('KITCHEN');
    kitchenButton.size(200, 100);
    kitchenButton.position(20, 120);
    kitchenButton.style('background-color', 'black');
    kitchenButton.style('color', 'white');
    kitchenButton.mousePressed(sendMsgToKitchen);
    ashtonButton = createButton('ASHTON');
    ashtonButton.size(200, 100);
    ashtonButton.position(20, 220);
    ashtonButton.style('background-color', 'black');
    ashtonButton.style('color', 'white');
    ashtonButton.mousePressed(sendMsgToAshton);
    jacksonButton = createButton('JACKSON');
    jacksonButton.size(200, 100);
    jacksonButton.position(20, 320);
    jacksonButton.style('background-color', 'black');
    jacksonButton.style('color', 'white');
    jacksonButton.mousePressed(sendMsgToJackson);
    masiButton = createButton('MASI');
    masiButton.size(200, 100);
    masiButton.position(20, 420);
    masiButton.style('background-color', 'black');
    masiButton.style('color', 'white');
    masiButton.mousePressed(sendMsgToMasi);
    chaosButton = createButton('CHAOS TOGGLE');
    chaosButton.size(200, 100);
    chaosButton.position(20, 520);
    chaosButton.style('background-color', 'black');
    chaosButton.style('color', 'white');
    chaosButton.mousePressed(()=>{
        isChaos = !isChaos;
    });

    //chaos frequency slider
    chaosSlider = createSlider(0,.5,.1, .01);
    chaosSlider.size(200, 100);
    chaosSlider.position(250, 530);
}

function draw() {
    background(0); //dark for stealth

    //chaos mode
    if(isChaos){
        if (client.isConnected()) {
            let randTopic = random();
            let randRate = random();
            if(randRate >= chaosSlider.value()){ //limits the rate with the slider
                return;
            }
            //1-.9 = all, .9-.8 = kitchen, .8-.7 = ashton, .7-.6 = jackson, .6-.5 = masi
            if(randTopic >= .9){
                let msg = String(round(random(15)));
                message = new Paho.MQTT.Message(msg);
                message.destinationName = topic;
                client.send(message);
                localDiv.html('I sent: ' + message.payloadString);
            } else if (randTopic >= .8){
                let msg = String(round(random(15)));
                message = new Paho.MQTT.Message(msg);
                message.destinationName = "kitchen";
                client.send(message);
                localDiv.html('I sent: ' + message.payloadString);
            } else if (randTopic >= .7){
                let msg = String(round(random(15)));
                message = new Paho.MQTT.Message(msg);
                message.destinationName = "ashton";
                client.send(message);
                localDiv.html('I sent: ' + message.payloadString);
            } else if (randTopic >= .6){
                let msg = String(round(random(15)));
                message = new Paho.MQTT.Message(msg);
                message.destinationName = "jackson";
                client.send(message);
                localDiv.html('I sent: ' + message.payloadString);
            } else if (randTopic >= .5){
                let msg = String(round(random(15)));
                message = new Paho.MQTT.Message(msg);
                message.destinationName = "masi";
                client.send(message);
                localDiv.html('I sent: ' + message.payloadString);
            }
        }
    }



    // draw a circle whose brightness changes when a message is received:
    // fill(intensity);
    // circle(width/2, height/2, width/2);
    // subtract one from the brightness of the circle:
    // if (intensity > 0) {
    //     intensity--;
    // }
}

// called when the client connects
function onConnect() {
    localDiv.html('client is connected');
    client.subscribe(topic);
    client.subscribe("kitchen");
    client.subscribe("ashton");
    client.subscribe("jackson");
    client.subscribe("masi");

}

// called when the client loses its connection
function onConnectionLost(response) {
    if (response.errorCode !== 0) {
        localDiv.html('onConnectionLost:' + response.errorMessage);
    }
}

// called when a message arrives
function onMessageArrived(message) {
    remoteDiv.html('I got a message:' + message.payloadString);
    let  incomingNumber = parseInt(message.payloadString);
    if (incomingNumber > 0) {
        intensity = 255;
    }
}

function sendMsgToAll() {
    if (client.isConnected()) {
        let msg = String(round(random(15)));
        message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        client.send(message);
        localDiv.html('I sent: ' + message.payloadString);
    }
}

function sendMsgToKitchen() {
    if (client.isConnected()) {
        let msg = String(round(random(15)));
        message = new Paho.MQTT.Message(msg);
        message.destinationName = "kitchen";
        client.send(message);
        localDiv.html('I sent: ' + message.payloadString);
    }
}

function sendMsgToAshton() {
    if (client.isConnected()) {
        let msg = String(round(random(15)));
        message = new Paho.MQTT.Message(msg);
        message.destinationName = "ashton";
        client.send(message);
        localDiv.html('I sent: ' + message.payloadString);
    }
}

function sendMsgToJackson() {
    if (client.isConnected()) {
        let msg = String(round(random(15)));
        message = new Paho.MQTT.Message(msg);
        message.destinationName = "jackson";
        client.send(message);
        localDiv.html('I sent: ' + message.payloadString);
 
    }
}

function sendMsgToMasi() {
    if (client.isConnected()) {
        let msg = String(round(random(15)));
        message = new Paho.MQTT.Message(msg);
        message.destinationName = "masi";
        client.send(message);
        localDiv.html('I sent: ' + message.payloadString);
    }
}
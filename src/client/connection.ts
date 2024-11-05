import {Subject} from 'rxjs';
import {io} from 'socket.io-client';

export const socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
});

export const sendMessage = (message: Message) => {
    socket.emit('message', message);
};

export const serverMessages$ = new Subject<Message>();

socket.on('message', (message) => {
    console.log('Received message:', message);
    message.action = "received";
    serverMessages$.next(message as Message);
});


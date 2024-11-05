import { fromEvent, map, tap, merge, shareReplay } from 'rxjs';
import {serverMessages$, sendMessage} from "./connection";

/* http://localhost:3006/ */

const form = document.getElementById("form")!;

const submitEvents$ = fromEvent<FormDataEvent>(form, 'submit')

const userMessages$ = submitEvents$.pipe(
    // Prevent the default form submission behavior (page reload)
    tap((e) => e.preventDefault()),
    // Get the message input from the form and clear it after reading the value
    map((e: FormDataEvent) => {
        const messageInput: HTMLInputElement = (e.currentTarget as HTMLFormElement).querySelector('input[name="message"]')!;
        const message = messageInput.value;
        messageInput.value = "";
        return message;
    }),
    // Map the string message to a full Message object with a timestamp and action
    map((message: string): Message => {
        return {data: message, action: "sent", timestamp: new Date()};
    }),
    shareReplay()
);

const messages$ = merge(userMessages$, serverMessages$);

messages$.subscribe(message => {
    console.log("message", message)
    const newMessage = document.createElement("li");
    newMessage.innerHTML = `
        <div>
            <p class="message-text">${message.data}</p>
            <p class="message-date">${message.action} ${new Date(message.timestamp).toLocaleString()}</p>
        </div>
    `;
    newMessage.classList.add(message.action);
    document.getElementById("messages")!.appendChild(newMessage);
});

userMessages$.subscribe(message => {
    console.log("message2", message)
    sendMessage(message)
});



/*
// Observable for user messages (when the user submits a form)
const userMessages$ = submitEvents$.pipe(
    // Send the message to the WebSocket server
    tap((message) => {
        sendMessage(message); // Send to WebSocket server
    }),
    shareReplay() // Share the message stream between all subscribers
);

// Observable for merged messages (user's sent and received messages)
const messages$ = merge(userMessages$, serverMessages$).pipe(
    // Ensuring messages are shared between subscribers
    shareReplay()
);

// Subscribe to messages$ and update the UI with new messages
messages$.subscribe((message) => {
    const newMessage = document.createElement("li");
    newMessage.innerHTML = `
        <div>
            <p class="message-text">${message.data}</p>
            <p class="message-date">${message.action} ${new Date(message.timestamp).toLocaleString()}</p>
        </div>
    `;
    newMessage.classList.add(message.action); // Add class based on action (sent/received)
    document.getElementById("messages")!.appendChild(newMessage);
});*/
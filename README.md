# sync-async

A small library for synchronizing asynchronous messaging.

With features such as publish and wait for a reply.

## installation

A simple

```
npm -i sync-async
```

should do the trick

## usage

The most simple use case is just publishing and listening on a topic
```ts
import {Topic} from "sync-async";
//fetch a topic to listen and publish on
let topic = Topic.getTopic<any>("test.topic");
//register a listener
topic.listen(v => console.log(`recieved message ${JSON.stringify(v)}`))
//publish a message on the topic
topic.publish({data: {a: 'b'}})

// outputs "recieved message {data: {a: 'b'}}"
```

sync-async allows you to also specify what message you want to return.

```ts
import {Topic} from "sync-async";
//fetch a topic to listen and publish on
let topic = Topic.getTopic<any>("test.topic");
//publish a message on the topic
topic.publishAndWait(
    { data: { a: "b" } }, //the data that we push to topic
    topic, //the topic that we listen for a reply on (same as the one we publish in this case)
    { b: "c" }, // The filter that we apply on the received message
    (v) => console.log(`got an object message in reply with a property named b, with value "c"`) // the callback function
);
```

Note that `publishAndWait` registeres a filtered listener that will only be activated once. Any future messages matching the filter will not trigger the callback

`publishAndWait` is also an async method so this is valid
```ts
await topic.publishAndWait(
    { data: { a: "b" } }, 
    topic, 
    { b: "c" }, 
    (v) => console.log(`hello`) 
);
```
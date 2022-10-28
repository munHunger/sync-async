/*
 * A message queue topic
 */
export class Topic<T> {
  static topicList: Array<Topic<any>> = [];
  /**
   * Get or create topic
   * @param name the name of the topic to search for
   * @returns a topic with the specified name. If it did not exist it will be created and globally discoverable
   */
  static getTopic<T>(name: string): Topic<T> {
    let existing = Topic.topicList.find((v) => v.name === name);
    if (existing) return existing;
    let newTopic = new Topic<T>(name);
    Topic.topicList.push(newTopic);
    return newTopic;
  }

  messages: Array<Message<T>> = []
  listeners: Array<(data: T) => void> = [];
  filteredListeners: Array<{ filter: Partial<T>; fn: (data: T) => void }> = [];

  name: string;
  constructor(name: string) {
    this.name = name;
  }

  /**
   * push a new message to the topic.
   * This will notify all listeners that there is a message to read
   * @param message the message to publish
   */
  publish(message: Message<any>) {
    this.messages.push(message);
    console.log(`publishing ${JSON.stringify(message)} on ${this.name}`);
    new Promise((resolve, reject) => {
      console.log(`invoking ${this.listeners.length} normal listeners`);
      this.listeners.forEach((l) => l.call({}, message));
    });

    new Promise((resolve, reject) => {
      let matchFun = (v: { filter: Partial<T>; fn: (data: T) => void }) => {
        let before = {};
        Object.assign(before, message.data);
        let after = {}
        Object.assign(after, message.data, v.filter);
        return JSON.stringify(before) === JSON.stringify(after)
      }
      let matches = this.filteredListeners.filter(matchFun);
      this.filteredListeners = this.filteredListeners.filter(v => !matchFun(v));
      console.log(
        `invoking ${matches.length} filtered listeners`
      );
      matches.forEach((l) => {
        l.fn.call({}, message);
      });
    });
  }
  /**
   * add a generic listener to the topic.
   * This listener will be triggered on all messages pushed to the topic
   * @param cb the callback function to invoke when a new message is published
   */
  listen(cb: (data: T) => void) {
    this.listeners.push(cb);
  }

  /**
   * publishes a message on the topic and listen for a specific reply on a topic.
   * Note that the listener will be removed after the first message has been received
   * @param message the message to publish
   * @param topicName the topic name to listen to
   * @param filter a filter to get only messages matching the filter
   * @param cb the method to invoke when a message has been published to the topic matching filter
   */
  publishAndWait<B>(
    message: Message<T>,
    topic: Topic<B>,
    filter: Partial<B>,
    cb: (data: B) => void
  ) {
    topic.filteredListeners.push({
      filter,
      fn: cb,
    });
    this.publish(message);
  }
}
class Message<T> {
  data: T;
}

export default {
  Topic,
};

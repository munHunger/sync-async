import Sync from "./"

async function waitForCondition(con: () => boolean, maxWait: number, start?: number): Promise<any> {
  if(con())
    return;
  await new Promise(resolve => setTimeout(resolve, 10));
  return waitForCondition(con, maxWait, 0)
}

test("you can listen to a topic", async () => {
  let topic = Sync.Topic.getTopic<any>("test1")
  let data: any;
  topic.listen(v => data = v)
  topic.publish({data: {a: 'b'}});
  await waitForCondition(() => data !== undefined, 100, 0)
  expect(data).toEqual({data: {a: 'b'}});
});

test("you can publish and wait for a specific response", async () => {
  let topic = Sync.Topic.getTopic<any>("test2")
  let topic2 = Sync.Topic.getTopic<any>("test2b")
  let data: any;
  topic.listen(v => {
    topic2.publish({data: {b:'c'}})
  })
  topic.publishAndWait({data: {a: 'b'}}, topic2, {b: 'c'}, v => data = v);
  await waitForCondition(() => data !== undefined, 100, 0)
  expect(data).toEqual({data: {b: 'c'}});
});

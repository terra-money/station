import { relayInit } from "./relay"

let relay = relayInit("wss://relay.damus.io/")

beforeAll(() => {
  relay.connect()
})

afterAll(() => {
  relay.close()
})

test("connectivity", () => {
  return expect(
    new Promise((resolve) => {
      relay.on("connect", () => {
        resolve(true)
      })
      relay.on("error", () => {
        resolve(false)
      })
    })
  ).resolves.toBe(true)
})

test("querying", async () => {
  var resolve1: (value: boolean) => void
  var resolve2: (value: boolean) => void

  let sub = relay.sub([
    {
      ids: ["d7dd5eb3ab747e16f8d0212d53032ea2a7cadef53837e5a6c66d42849fcb9027"],
    },
  ])
  sub.on("event", (event) => {
    expect(event).toHaveProperty(
      "id",
      "d7dd5eb3ab747e16f8d0212d53032ea2a7cadef53837e5a6c66d42849fcb9027"
    )
    resolve1(true)
  })
  sub.on("eose", () => {
    resolve2(true)
  })

  let [t1, t2] = await Promise.all([
    new Promise<boolean>((resolve) => {
      resolve1 = resolve
    }),
    new Promise<boolean>((resolve) => {
      resolve2 = resolve
    }),
  ])

  expect(t1).toEqual(true)
  expect(t2).toEqual(true)
}, 10000)

test("async iterator", async () => {
  let sub = relay.sub([
    {
      ids: ["d7dd5eb3ab747e16f8d0212d53032ea2a7cadef53837e5a6c66d42849fcb9027"],
    },
  ])

  for await (const event of sub.events) {
    expect(event).toHaveProperty(
      "id",
      "d7dd5eb3ab747e16f8d0212d53032ea2a7cadef53837e5a6c66d42849fcb9027"
    )
    break
  }
})

test("get()", async () => {
  let event = await relay.get({
    ids: ["d7dd5eb3ab747e16f8d0212d53032ea2a7cadef53837e5a6c66d42849fcb9027"],
  })

  expect(event).toHaveProperty(
    "id",
    "d7dd5eb3ab747e16f8d0212d53032ea2a7cadef53837e5a6c66d42849fcb9027"
  )
})

test("list()", async () => {
  let events = await relay.list([
    {
      authors: [
        "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
      ],
      kinds: [1],
      limit: 2,
    },
  ])

  expect(events.length).toEqual(2)
})

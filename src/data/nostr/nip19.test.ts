import { RawKey } from "@terra-money/feather.js"
import {
  decode,
  naddrEncode,
  nprofileEncode,
  npubEncode,
  nrelayEncode,
  nsecEncode,
  type AddressPointer,
  type ProfilePointer,
} from "./nip19"

test("encode and decode nsec", () => {
  const privateKey = Buffer.from(
    "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
    "hex"
  )
  const rawKey = new RawKey(privateKey)
  let nsec = nsecEncode(rawKey)
  expect(nsec).toMatch(/nsec1\w+/)
  let { type, data } = decode(nsec)
  expect(type).toEqual("nsec")
  expect(data).toEqual(privateKey)
})

test("encode and decode npub", () => {
  const privateKey = Buffer.from(
    "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
    "hex"
  )
  const rawKey = new RawKey(privateKey)
  let npub = npubEncode(rawKey)
  expect(npub).toMatch(/npub1\w+/)
  let { type, data } = decode(npub)
  expect(type).toEqual("npub")
  expect(data).toEqual(privateKey.toString("hex"))
})

test("encode and decode nprofile", () => {
  const privateKey = Buffer.from(
    "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
    "hex"
  )
  const rawKey = new RawKey(privateKey)
  let relays = [
    "wss://relay.nostr.example.mydomain.example.com",
    "wss://nostr.banana.com",
  ]
  let nprofile = nprofileEncode({
    pubkey: rawKey.getSchnorrPubKey().toString("hex"),
    relays,
  })
  expect(nprofile).toMatch(/nprofile1\w+/)
  let { type, data } = decode(nprofile)
  expect(type).toEqual("nprofile")
  const pointer = data as ProfilePointer
  expect(pointer.pubkey).toEqual(rawKey.getSchnorrPubKey().toString("hex"))
  expect(pointer.relays).toContain(relays[0])
  expect(pointer.relays).toContain(relays[1])
})

test("decode nprofile without relays", () => {
  expect(
    decode(
      nprofileEncode({
        pubkey:
          "97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322",
        relays: [],
      })
    ).data
  ).toHaveProperty(
    "pubkey",
    "97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322"
  )
})

test("encode and decode naddr", () => {
  const privateKey = Buffer.from(
    "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
    "hex"
  )
  const rawKey = new RawKey(privateKey)
  let relays = [
    "wss://relay.nostr.example.mydomain.example.com",
    "wss://nostr.banana.com",
  ]
  let naddr = naddrEncode({
    pubkey: rawKey.getSchnorrPubKey().toString("hex"),
    relays,
    kind: 30023,
    identifier: "banana",
  })
  expect(naddr).toMatch(/naddr1\w+/)
  let { type, data } = decode(naddr)
  expect(type).toEqual("naddr")
  const pointer = data as AddressPointer
  expect(pointer.pubkey).toEqual(rawKey.getSchnorrPubKey().toString("hex"))
  expect(pointer.relays).toContain(relays[0])
  expect(pointer.relays).toContain(relays[1])
  expect(pointer.kind).toEqual(30023)
  expect(pointer.identifier).toEqual("banana")
})

test("decode naddr from habla.news", () => {
  let { type, data } = decode(
    "naddr1qq98yetxv4ex2mnrv4esygrl54h466tz4v0re4pyuavvxqptsejl0vxcmnhfl60z3rth2xkpjspsgqqqw4rsf34vl5"
  )
  expect(type).toEqual("naddr")
  const pointer = data as AddressPointer
  expect(pointer.pubkey).toEqual(
    "7fa56f5d6962ab1e3cd424e758c3002b8665f7b0d8dcee9fe9e288d7751ac194"
  )
  expect(pointer.kind).toEqual(30023)
  expect(pointer.identifier).toEqual("references")
})

test("decode naddr from go-nostr with different TLV ordering", () => {
  let { type, data } = decode(
    "naddr1qqrxyctwv9hxzq3q80cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsxpqqqp65wqfwwaehxw309aex2mrp0yhxummnw3ezuetcv9khqmr99ekhjer0d4skjm3wv4uxzmtsd3jjucm0d5q3vamnwvaz7tmwdaehgu3wvfskuctwvyhxxmmd0zfmwx"
  )

  expect(type).toEqual("naddr")
  const pointer = data as AddressPointer
  expect(pointer.pubkey).toEqual(
    "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"
  )
  expect(pointer.relays).toContain(
    "wss://relay.nostr.example.mydomain.example.com"
  )
  expect(pointer.relays).toContain("wss://nostr.banana.com")
  expect(pointer.kind).toEqual(30023)
  expect(pointer.identifier).toEqual("banana")
})

test("encode and decode nrelay", () => {
  let url = "wss://relay.nostr.example"
  let nrelay = nrelayEncode(url)
  expect(nrelay).toMatch(/nrelay1\w+/)
  let { type, data } = decode(nrelay)
  expect(type).toEqual("nrelay")
  expect(data).toEqual(url)
})

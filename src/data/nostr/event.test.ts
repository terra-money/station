import { RawKey } from "@terra-money/feather.js"
import {
  getBlankEvent,
  serializeEvent,
  getEventHash,
  validateEvent,
  verifySignature,
  getSignature,
  Kind,
  verifiedSymbol,
  finishEvent,
} from "./event"

describe("Event", () => {
  describe("getBlankEvent", () => {
    it("should return a blank event object", () => {
      expect(getBlankEvent()).toEqual({
        kind: 255,
        content: "",
        tags: [],
        created_at: 0,
      })
    })

    it("should return a blank event object with defined kind", () => {
      expect(getBlankEvent(Kind.Text)).toEqual({
        kind: 1,
        content: "",
        tags: [],
        created_at: 0,
      })
    })
  })

  describe("finishEvent", () => {
    it("should create a signed event from a template", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const template = {
        kind: Kind.Text,
        tags: [],
        content: "Hello, world!",
        created_at: 1617932115,
      }

      const event = finishEvent(template, rawKey)

      expect(event.kind).toEqual(template.kind)
      expect(event.tags).toEqual(template.tags)
      expect(event.content).toEqual(template.content)
      expect(event.created_at).toEqual(template.created_at)
      expect(event.pubkey).toEqual(rawKey.getRawPublicKey().toString("hex"))
      expect(typeof event.id).toEqual("string")
      expect(typeof event.sig).toEqual("string")
    })
  })

  describe("serializeEvent", () => {
    it("should serialize a valid event object", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const unsignedEvent = {
        pubkey: rawKey.getRawPublicKey().toString("hex"),
        created_at: 1617932115,
        kind: Kind.Text,
        tags: [],
        content: "Hello, world!",
      }

      const serializedEvent = serializeEvent(unsignedEvent)

      expect(serializedEvent).toEqual(
        JSON.stringify([
          0,
          rawKey.getRawPublicKey().toString("hex"),
          unsignedEvent.created_at,
          unsignedEvent.kind,
          unsignedEvent.tags,
          unsignedEvent.content,
        ])
      )
    })

    it("should throw an error for an invalid event object", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const invalidEvent = {
        kind: Kind.Text,
        tags: [],
        created_at: 1617932115,
        pubkey: rawKey.getRawPublicKey(), // missing content
      }

      expect(() => {
        // @ts-expect-error
        serializeEvent(invalidEvent)
      }).toThrow("can't serialize event with wrong or missing properties")
    })
  })

  describe("getEventHash", () => {
    it("should return the correct event hash", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const unsignedEvent = {
        kind: Kind.Text,
        tags: [],
        content: "Hello, world!",
        created_at: 1617932115,
        pubkey: rawKey.getRawPublicKey().toString("hex"),
      }

      const eventHash = getEventHash(unsignedEvent)

      expect(typeof eventHash).toEqual("string")
      expect(eventHash.length).toEqual(64)
    })
  })

  describe("validateEvent", () => {
    it("should return true for a valid event object", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const unsignedEvent = {
        kind: Kind.Text,
        tags: [],
        content: "Hello, world!",
        created_at: 1617932115,
        pubkey: rawKey.getRawPublicKey().toString(),
      }

      const isValid = validateEvent(unsignedEvent)

      expect(isValid).toEqual(true)
    })

    it("should return false for a non object event", () => {
      const nonObjectEvent = ""

      const isValid = validateEvent(nonObjectEvent)

      expect(isValid).toEqual(false)
    })

    it("should return false for an event object with missing properties", () => {
      const invalidEvent = {
        kind: Kind.Text,
        tags: [],
        created_at: 1617932115, // missing content and pubkey
      }

      const isValid = validateEvent(invalidEvent)

      expect(isValid).toEqual(false)
    })

    it("should return false for an empty object", () => {
      const emptyObj = {}

      const isValid = validateEvent(emptyObj)

      expect(isValid).toEqual(false)
    })

    it("should return false for an object with invalid properties", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const invalidEvent = {
        kind: 1,
        tags: [],
        created_at: "1617932115", // should be a number
        pubkey: rawKey.getRawPublicKey(),
      }

      const isValid = validateEvent(invalidEvent)

      expect(isValid).toEqual(false)
    })

    it("should return false for an object with an invalid public key", () => {
      const invalidEvent = {
        kind: 1,
        tags: [],
        content: "Hello, world!",
        created_at: 1617932115,
        pubkey: "invalid_pubkey",
      }

      const isValid = validateEvent(invalidEvent)

      expect(isValid).toEqual(false)
    })

    it("should return false for an object with invalid tags", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const invalidEvent = {
        kind: 1,
        tags: {}, // should be an array
        content: "Hello, world!",
        created_at: 1617932115,
        pubkey: rawKey.getRawPublicKey().toString("hex"),
      }

      const isValid = validateEvent(invalidEvent)

      expect(isValid).toEqual(false)
    })
  })

  describe("verifySignature", () => {
    it("should return true for a valid event signature", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const event = finishEvent(
        {
          kind: Kind.Text,
          tags: [],
          content: "Hello, world!",
          created_at: 1617932115,
        },
        rawKey
      )

      const isValid = verifySignature(event, rawKey)

      expect(isValid).toEqual(true)
    })

    it("should return false for an invalid event signature", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const { [verifiedSymbol]: _, ...event } = finishEvent(
        {
          kind: Kind.Text,
          tags: [],
          content: "Hello, world!",
          created_at: 1617932115,
        },
        rawKey
      )

      // tamper with the signature
      event.sig = event.sig.replace(/^.{3}/g, "666")

      const isValid = verifySignature(event, rawKey)

      expect(isValid).toEqual(false)
    })

    it("should return false when verifying an event with a different private key", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const privateKey2 = Buffer.from(
        "5b4a34f4e4b23c63ad55a35e3f84a3b53d96dbf266edf521a8358f71d19cbf67",
        "hex"
      )
      const rawKey2 = new RawKey(privateKey2)

      const { [verifiedSymbol]: _, ...event } = finishEvent(
        {
          kind: Kind.Text,
          tags: [],
          content: "Hello, world!",
          created_at: 1617932115,
        },
        rawKey
      )

      // verify with different private key
      const isValid = verifySignature(
        {
          ...event,
          pubkey: rawKey2.getRawPublicKey().toString("hex"),
        },
        rawKey
      )

      expect(isValid).toEqual(false)
    })

    it("should return false for an invalid event id", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const { [verifiedSymbol]: _, ...event } = finishEvent(
        {
          kind: 1,
          tags: [],
          content: "Hello, world!",
          created_at: 1617932115,
        },
        rawKey
      )

      // tamper with the id
      event.id = event.id.replace(/^.{3}/g, "666")

      const isValid = verifySignature(event, rawKey)

      expect(isValid).toEqual(false)
    })
  })

  describe("getSignature", () => {
    it("should produce the correct signature for an event object", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)
      const publicKey = rawKey.getRawPublicKey().toString("hex")

      const unsignedEvent = {
        kind: Kind.Text,
        tags: [],
        content: "Hello, world!",
        created_at: 1617932115,
        pubkey: publicKey,
      }

      const sig = getSignature(unsignedEvent, rawKey)

      // verify the signature
      const isValid = verifySignature(
        {
          ...unsignedEvent,
          id: getEventHash(unsignedEvent),
          sig,
        },
        rawKey
      )

      expect(typeof sig).toEqual("string")
      expect(sig.length).toEqual(128)
      expect(isValid).toEqual(true)
    })

    it("should not sign an event with different private key", () => {
      const privateKey = Buffer.from(
        "4804e2bdce36d413206ccf47cc4c64db2eff924e7cc9e90339fa7579d2bd9d5b",
        "hex"
      )
      const rawKey = new RawKey(privateKey)

      const privateKey2 = Buffer.from(
        "5b4a34f4e4b23c63ad55a35e3f84a3b53d96dbf266edf521a8358f71d19cbf67",
        "hex"
      )
      const wrongRawKey = new RawKey(privateKey2)

      const unsignedEvent = {
        kind: Kind.Text,
        tags: [],
        content: "Hello, world!",
        created_at: 1617932115,
        pubkey: rawKey.getRawPublicKey().toString("hex"),
      }

      const sig = getSignature(unsignedEvent, wrongRawKey)

      // verify the signature
      // @ts-expect-error
      const isValid = verifySignature({
        ...unsignedEvent,
        sig,
      })

      expect(typeof sig).toEqual("string")
      expect(sig.length).toEqual(128)
      expect(isValid).toEqual(false)
    })
  })
})

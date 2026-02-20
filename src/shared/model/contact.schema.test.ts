import { describe, expect, it } from "vitest";
import { ContactSchema } from "./contact.schema";

const expectValidationError = (
  result: ReturnType<typeof ContactSchema.safeParse>,
  field: string,
  expectedCode: string,
) => {
  expect(result.success).toBe(false);
  if (!result.success) {
    const error = result.error.issues.find((issue) =>
      issue.path.includes(field),
    );
    expect(error).toBeDefined();
    expect(error?.code).toBe(expectedCode);
  }
};

describe("ContactSchema Validation", () => {
  describe("Phone and WhatsApp channels", () => {
    it.each([
      ["phone", "en", "1234567890", true, null],
      ["phone", "en", "not-a-phone", false, "invalid_format"],
      ["whatsapp", "fr", "33123456789", true, null],
      ["whatsapp", "en", "invalid", false, "invalid_format"],
    ] as const)("should validate %s channel in %s locale (expected: %s)", (channel, locale, value, expected, expectedCode) => {
      const result = ContactSchema.safeParse({ channel, locale, value });
      expect(result.success).toBe(expected);
      if (!expected && expectedCode) {
        expectValidationError(result, "value", expectedCode);
      }
    });
  });

  describe("Telegram channel", () => {
    it.each([
      ["phone number", "1234567890", true, null],
      ["username without @", "my_handle", true, null],
      ["username with @", "@username", false, "invalid_format"],
      ["username too short", "abc", false, "invalid_format"],
      ["username too long", "a".repeat(33), false, "invalid_format"],
    ])("should validate %s correctly", (_, value, expected, expectedCode) => {
      const result = ContactSchema.safeParse({
        channel: "telegram",
        locale: "en",
        value,
      });
      expect(result.success).toBe(expected);
      if (!expected && expectedCode) {
        expectValidationError(result, "value", expectedCode);
      }
    });

    it.each([
      ["lowercase username", "myhandle", "myhandle"],
      ["uppercase username", "MyHandle", "myhandle"],
      ["mixed case username", "MyUsername123", "myusername123"],
      ["all caps username", "USERNAME", "username"],
    ])("should normalise %s to lowercase", (_, input, expected) => {
      const result = ContactSchema.safeParse({
        channel: "telegram",
        locale: "en",
        value: input,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe(expected);
      }
    });
  });

  describe("Discriminated union behavior", () => {
    it.each([
      [
        "phone with null label is accepted",
        { channel: "phone", locale: "en", value: "1234567890", label: null },
        true,
      ],
      [
        "phone rejects non-phone value",
        { channel: "phone", locale: "en", value: "@username" },
        false,
      ],
      [
        "whatsapp rejects non-phone value",
        { channel: "whatsapp", locale: "en", value: "@username" },
        false,
      ],
    ] as const)("%s", (_, input, expected) => {
      expect(ContactSchema.safeParse(input).success).toBe(expected);
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  formatPhoneDisplay,
  formatTelegramDisplay,
  getContactUri,
} from "./links";

describe("formatPhoneDisplay", () => {
  it.each([
    ["empty string", "", ""],
    ["valid US number", "12133734253", "+1 213-373-4253"],
    ["valid FR number", "33612345678", "+33 6 12 34 56 78"],
    ["invalid number with whitespace", "1 2 3", "+123"],
    ["partial number", "123", "+123"],
    ["very short number (nullish format)", "12", "+12"],
  ])("formats %s correctly", (_, input, expected) => {
    expect(formatPhoneDisplay(input)).toBe(expected);
  });
});

describe("formatTelegramDisplay", () => {
  it.each([
    ["empty string", "", ""],
    ["valid username", "username123", "@username123"],
    ["short string (invalid username)", "abc", "abc"],
    ["long string (invalid username)", "a".repeat(40), "a".repeat(40)],
  ])("formats %s correctly", (_, input, expected) => {
    expect(formatTelegramDisplay(input)).toBe(expected);
  });
});

describe("getContactUri", () => {
  describe("phone channel", () => {
    it.each([
      ["basic number", "123", "tel:+123"],
      ["full number", "1234567890", "tel:+1234567890"],
      ["number with whitespace", "1 234 567", "tel:+1234567"],
    ])("handles %s", (_, value, expected) => {
      expect(getContactUri({ channel: "phone", value, locale: "en" })).toBe(
        expected,
      );
    });
  });

  describe("whatsapp channel", () => {
    it.each([
      ["basic number", "123456", "https://wa.me/123456"],
      ["number with whitespace", "1 234 567", "https://wa.me/1234567"],
    ])("handles %s", (_, value, expected) => {
      expect(getContactUri({ channel: "whatsapp", value, locale: "en" })).toBe(
        expected,
      );
    });
  });

  describe("telegram channel", () => {
    it.each([
      ["username", "username", "https://t.me/username"],
      ["phone number (short)", "9876", "https://t.me/+9876"],
      ["phone number (full)", "1234567890", "https://t.me/+1234567890"],
    ])("handles %s", (_, value, expected) => {
      expect(getContactUri({ channel: "telegram", value, locale: "en" })).toBe(
        expected,
      );
    });
  });
});

import { test, expect } from "bun:test";
import { canPlayContent, subscriptionIsActive } from "./playback-access";
import { buildContentNotifications } from "./content-notifications";

const access = { signedIn: true, active: true, admin: false, agent: false, agentOnly: false };
test("signed-out visitors cannot play", () => expect(canPlayContent({ ...access, signedIn: false })).toBe(false));
test("inactive subscribers cannot play", () => expect(canPlayContent({ ...access, active: false })).toBe(false));
test("activation unlocks regular content", () => expect(canPlayContent(access)).toBe(true));
test("agent episodes require an active agent plan", () => {
  expect(canPlayContent({ ...access, agentOnly: true })).toBe(false);
  expect(canPlayContent({ ...access, agentOnly: true, agent: true })).toBe(true);
});
test("future expiry alone does not activate a subscription", () => expect(subscriptionIsActive({ active: false, endDate: "2026-10-12T00:00:00Z" }, Date.parse("2026-10-11T00:00:00Z"))).toBe(false));
test("expired subscriptions remain locked", () => expect(subscriptionIsActive({ active: true, endDate: "2026-10-10T00:00:00Z" }, Date.parse("2026-10-11T00:00:00Z"))).toBe(false));
test("episode alerts target the exact season and episode with series poster", () => {
  const alerts = buildContentNotifications("series", { abc: { title: "Series", image: "poster.jpg", createdAt: "2026-10-01", updatedAt: "2026-10-11T12:00:00Z", episodes: { one: { season: 2, episodeNumber: 3 } } } }, Date.parse("2026-10-11T16:00:00Z"));
  expect(alerts[0]?.href).toBe("/play/abc?type=series&season=2&ep=3");
  expect(alerts[0]?.image).toBe("poster.jpg");
});
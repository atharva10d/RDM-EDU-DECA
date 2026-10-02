import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  APP_PERSIST_NAME,
  APP_PERSIST_VERSION,
  mergeAppPersist,
  migrateAppPersist,
  partializeAppPersist,
} from "./persistSlice";

const dirty = {
  user: {
    id: "user_dev_01",
    name: "Student Whiz",
    email: "a@b.com",
    classGrade: "Class 12",
    institution: "St Xavier",
    state: "Telangana",
    city: "Hyderabad",
    selectedTrack: "B" as const,
    referralCode: "EDUD1000",
    level4Consent: true,
    scienceStream: true,
  },
  selectedTrack: "B" as const,
  pendingPathTrack: "A" as const,
  disciplines: ["phy", "chem"],
  campaignLevel: 2,
  todayCompleted: true,
  freeZoneComplete: false,
  trialsRemaining: 4,
  streak: 3,
  rdmBalance: 120,
  level: 2,
  quizzesCompleted: 9,
  referredContacts: [{ id: "x", name: "Dummy" }],
  isGuestOrDevAuthenticated: true,
};

describe("partializeAppPersist", () => {
  it("writes only the live keys", () => {
    const out = partializeAppPersist(dirty);
    assert.deepEqual(Object.keys(out).sort(), [
      "campaignLevel",
      "disciplines",
      "freeZoneComplete",
      "level",
      "pendingPathTrack",
      "rdmBalance",
      "selectedTrack",
      "streak",
      "todayCompleted",
      "trialsRemaining",
      "user",
    ]);
    assert.deepEqual(Object.keys(out.user).sort(), [
      "city",
      "classGrade",
      "email",
      "id",
      "institution",
      "referralCode",
      "selectedTrack",
      "state",
    ]);
  });

  it("strips dummy id, referral, name, and referredContacts", () => {
    const out = partializeAppPersist(dirty);
    assert.equal(out.user.id, "");
    assert.equal(out.user.referralCode, "");
    assert.equal("name" in out.user, false);
    assert.equal("referredContacts" in out, false);
    assert.equal(out.user.email, "a@b.com");
    assert.equal(out.campaignLevel, 2);
  });

  it("strips local_user the same as user_dev_01", () => {
    const out = partializeAppPersist({
      ...dirty,
      user: { ...dirty.user, id: "local_user" },
    });
    assert.equal(out.user.id, "");
  });

  it("keeps a minted referral code and a real uuid", () => {
    const out = partializeAppPersist({
      ...dirty,
      user: {
        ...dirty.user,
        id: "11111111-2222-4333-8444-555555555555",
        referralCode: "ED-267K2M9Q4A",
      },
    });
    assert.equal(out.user.id, "11111111-2222-4333-8444-555555555555");
    assert.equal(out.user.referralCode, "ED-267K2M9Q4A");
  });
});

describe("migrateAppPersist", () => {
  it("drops unknown keys from an old blob", () => {
    const out = migrateAppPersist(dirty, 0);
    assert.equal("referredContacts" in out, false);
    assert.equal(out.user.referralCode, "");
    assert.equal(APP_PERSIST_NAME, "edudeca-user-storage");
    assert.equal(APP_PERSIST_VERSION, 2);
  });
});

describe("mergeAppPersist", () => {
  it("overlays persisted user fields onto the current profile defaults", () => {
    const current = {
      user: {
        id: "",
        name: "Student",
        email: "",
        classGrade: "Class 11",
        scienceStream: true,
        institution: "",
        state: "",
        city: "",
        level4Consent: false,
        selectedTrack: "A" as const,
        level: 0,
        streak: 0,
        rdmBalance: 0,
        quizzesCompleted: 0,
        referralCode: "",
      },
      quizzesCompleted: 0,
      signOut: () => undefined,
    };
    const merged = mergeAppPersist(
      {
        user: {
          id: "11111111-2222-4333-8444-555555555555",
          email: "a@b.com",
          classGrade: "Class 12",
          institution: "St Xavier",
          state: "Telangana",
          city: "Hyderabad",
          selectedTrack: "B",
          referralCode: "ED-267K2M9Q4A",
        },
        selectedTrack: "B",
        disciplines: ["phy"],
        campaignLevel: 2,
        todayCompleted: true,
        freeZoneComplete: false,
        trialsRemaining: 4,
        streak: 3,
        rdmBalance: 120,
        level: 2,
      },
      current,
    );
    assert.equal(merged.user.name, "Student");
    assert.equal(merged.user.level4Consent, false);
    assert.equal(merged.user.email, "a@b.com");
    assert.equal(merged.user.referralCode, "ED-267K2M9Q4A");
    assert.equal(typeof merged.signOut, "function");
  });
});

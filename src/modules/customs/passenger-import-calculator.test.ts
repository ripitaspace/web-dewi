import { describe, expect, it } from "vitest";
import { calculatePassengerImport, emptyScenario, EXAMPLE_SCENARIOS, type ShoppingItem } from "./passenger-import-calculator";

const item = (value: string, ownerId = "passenger-1"): ShoppingItem => ({
  id: `item-${value}-${ownerId}`,
  name: "Barang pribadi",
  category: "general",
  quantity: 1,
  unitPrice: value,
  discount: "0",
  currency: "USD",
  ownerId,
  status: "purchased-abroad",
});

describe("passenger import calculator", () => {
  it.each(["450", "500"])("does not charge a personal item worth USD %s", (value) => {
    const scenario = emptyScenario();
    scenario.rates.idrPerUnit.USD = "16000";
    scenario.items = [item(value)];
    expect(calculatePassengerImport(scenario).totalLevyUsd).toBe(0);
  });

  it("calculates the published USD 700 illustration", () => {
    const scenario = emptyScenario();
    scenario.rates.idrPerUnit.USD = "16000";
    scenario.items = [item("700")];
    const result = calculatePassengerImport(scenario);
    expect(result.importDutyUsd).toBe(20);
    expect(result.vatUsd).toBe(24.2);
    expect(result.totalLevyUsd).toBe(44.2);
    expect(result.totalLevyIdr).toBe(707200);
  });

  it("ships varied example journeys with valid manual rates", () => {
    expect(EXAMPLE_SCENARIOS).toHaveLength(6);
    for (const example of EXAMPLE_SCENARIOS) {
      expect(calculatePassengerImport(example.scenario).isReady).toBe(true);
      expect(example.scenario.items.length).toBeGreaterThan(1);
    }
  });

  it("applies the allowance per passenger instead of aggregating it", () => {
    const scenario = emptyScenario();
    scenario.passengers.push({ id: "passenger-2", name: "Penumpang 2" });
    scenario.rates.idrPerUnit.USD = "16000";
    scenario.items = [item("400"), item("400", "passenger-2")];
    expect(calculatePassengerImport(scenario).totalLevyUsd).toBe(0);
  });

  it("does not let a low-spend passenger transfer their allowance", () => {
    const scenario = emptyScenario();
    scenario.passengers.push({ id: "passenger-2", name: "Penumpang 2" });
    scenario.rates.idrPerUnit.USD = "16000";
    scenario.items = [item("700"), item("100", "passenger-2")];
    const result = calculatePassengerImport(scenario);
    expect(result.passengers[0]?.totalLevyUsd).toBe(44.2);
    expect(result.passengers[1]?.totalLevyUsd).toBe(0);
  });

  it("converts a manually entered foreign-currency rate", () => {
    const scenario = emptyScenario();
    scenario.rates.idrPerUnit.USD = "16000";
    scenario.rates.idrPerUnit.JPY = "100";
    scenario.items = [{ ...item("100000"), currency: "JPY" }];
    expect(calculatePassengerImport(scenario).totalShoppingUsd).toBe(625);
  });

  it("flags commercial and unconfirmed IMEI goods for review", () => {
    const scenario = emptyScenario();
    scenario.rates.idrPerUnit.USD = "16000";
    scenario.items = [
      { ...item("700"), category: "commercial" },
      { ...item("900"), id: "phone", category: "mobile-device", imeiAtArrival: false },
    ];
    const result = calculatePassengerImport(scenario);
    expect(result.reviews).toHaveLength(2);
    expect(result.totalLevyUsd).toBe(0);
  });
});

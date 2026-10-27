export const SUPPORTED_CURRENCIES = ["USD", "SGD", "JPY", "KRW", "MYR", "THB", "CNY", "EUR", "GBP", "IDR"] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];
export type ItemCategory = "general" | "mobile-device" | "alcohol-tobacco" | "luxury" | "commercial";
export type ItemStatus = "purchased-abroad" | "preowned" | "review";

export type Passenger = { id: string; name: string };

export type ShoppingItem = {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unitPrice: string;
  discount: string;
  currency: Currency;
  ownerId: string;
  status: ItemStatus;
  imeiAtArrival?: boolean;
};

export type RateInput = {
  idrPerUnit: Partial<Record<Currency, string>>;
  period: string;
  source: string;
  mode: "manual";
};

export type TravelScenario = {
  originCountry: string;
  arrivalDate: string;
  passengers: Passenger[];
  items: ShoppingItem[];
  rates: RateInput;
};

export type ReviewFlag = { itemId: string; itemName: string; message: string };
export type PassengerBreakdown = {
  passengerId: string;
  eligibleValueUsd: number;
  allowanceUsd: number;
  dutiableUsd: number;
  importDutyUsd: number;
  vatUsd: number;
  totalLevyUsd: number;
  allowanceUsedPercent: number;
};

export type CalculationResult = {
  isReady: boolean;
  errors: string[];
  reviews: ReviewFlag[];
  totalShoppingIdr: number;
  eligibleShoppingIdr: number;
  totalShoppingUsd: number;
  allowanceUsd: number;
  dutiableUsd: number;
  importDutyUsd: number;
  vatUsd: number;
  ppnbmUsd: number;
  totalLevyUsd: number;
  totalLevyIdr: number;
  totalCostIdr: number;
  passengers: PassengerBreakdown[];
};

export const PASSENGER_IMPORT_RULES = {
  version: "PMK 34/PMK.04/2025 · dasar estimasi MVP",
  effectiveFrom: "2025-06-06",
  passengerAllowanceUsd: 500,
  importDutyRate: 0.1,
  effectiveVatRate: 0.11,
  pph22Rate: 0,
} as const;

const SCALE = BigInt(1_000_000);
const ZERO = BigInt(0);

function parseDecimal(value: string | number | undefined): bigint | null {
  const normalized = String(value ?? "").trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const fractionScaled = `${fraction}000000`.slice(0, 6);
  return BigInt(whole) * SCALE + BigInt(fractionScaled);
}

function scaledToNumber(value: bigint): number {
  return Number(value) / Number(SCALE);
}

function multiply(value: bigint, factor: bigint): bigint {
  return value * factor / SCALE;
}

function validQuantity(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function itemReview(item: ShoppingItem): string | null {
  if (item.status === "preowned") return "Barang yang sudah dimiliki sebelum perjalanan perlu bukti kepemilikan dan peninjauan petugas.";
  if (item.status === "review") return "Status barang memerlukan peninjauan sebelum dapat dihitung sebagai barang pribadi.";
  if (item.category === "commercial") return "Barang untuk dijual kembali atau jastip tidak otomatis mendapat fasilitas barang pribadi.";
  if (item.category === "luxury") return "Barang mewah dapat memiliki PPnBM atau perlakuan tarif yang berbeda.";
  if (item.category === "alcohol-tobacco") return "Alkohol dan tembakau memiliki batasan serta ketentuan cukai khusus.";
  if (item.category === "mobile-device" && !item.imeiAtArrival) return "Perangkat perlu dikonfirmasi untuk registrasi IMEI pada saat kedatangan; fasilitas tidak dihitung otomatis.";
  return null;
}

function itemValueIdr(item: ShoppingItem, rates: RateInput, errors: string[]): bigint {
  const unitPrice = parseDecimal(item.unitPrice);
  const discount = parseDecimal(item.discount);
  const rate = parseDecimal(rates.idrPerUnit[item.currency]);
  if (!validQuantity(item.quantity)) {
    errors.push(`Jumlah ${item.name || "barang"} harus minimal 1.`);
    return ZERO;
  }
  if (unitPrice === null || unitPrice < ZERO || discount === null || discount < ZERO) {
    errors.push(`Harga atau diskon ${item.name || "barang"} tidak valid.`);
    return ZERO;
  }
  if (rate === null || rate <= ZERO) {
    errors.push(`Kurs ${item.currency} untuk ${item.name || "barang"} belum diisi.`);
    return ZERO;
  }
  const subtotal = unitPrice * BigInt(item.quantity);
  const afterDiscount = subtotal > discount ? subtotal - discount : ZERO;
  return multiply(afterDiscount, rate);
}

export function calculatePassengerImport(scenario: TravelScenario): CalculationResult {
  const errors: string[] = [];
  const reviews: ReviewFlag[] = [];
  const usdRate = parseDecimal(scenario.rates.idrPerUnit.USD);
  if (usdRate === null || usdRate <= ZERO) errors.push("Kurs USD ke IDR harus diisi lebih dari 0.");
  if (!scenario.passengers.length) errors.push("Tambahkan minimal satu penumpang.");

  const itemValues = new Map<string, bigint>();
  let totalShoppingIdr = ZERO;
  let eligibleShoppingIdr = ZERO;
  for (const item of scenario.items) {
    const valueIdr = itemValueIdr(item, scenario.rates, errors);
    itemValues.set(item.id, valueIdr);
    totalShoppingIdr += valueIdr;
    const review = itemReview(item);
    if (review) reviews.push({ itemId: item.id, itemName: item.name || "Barang tanpa nama", message: review });
    else eligibleShoppingIdr += valueIdr;
  }

  const allowance = BigInt(PASSENGER_IMPORT_RULES.passengerAllowanceUsd) * SCALE;
  const dutyRate = BigInt(Math.round(PASSENGER_IMPORT_RULES.importDutyRate * Number(SCALE)));
  const vatRate = BigInt(Math.round(PASSENGER_IMPORT_RULES.effectiveVatRate * Number(SCALE)));
  const passengerBreakdowns: PassengerBreakdown[] = [];
  let dutiableUsd = ZERO;
  let importDutyUsd = ZERO;
  let vatUsd = ZERO;

  for (const passenger of scenario.passengers) {
    let eligibleValueIdr = ZERO;
    for (const item of scenario.items) {
      if (item.ownerId === passenger.id && !itemReview(item)) eligibleValueIdr += itemValues.get(item.id) ?? ZERO;
    }
    const eligibleValueUsd = usdRate && usdRate > ZERO ? eligibleValueIdr * SCALE / usdRate : ZERO;
    const taxable = eligibleValueUsd > allowance ? eligibleValueUsd - allowance : ZERO;
    const duty = multiply(taxable, dutyRate);
    const vat = multiply(taxable + duty, vatRate);
    dutiableUsd += taxable;
    importDutyUsd += duty;
    vatUsd += vat;
    passengerBreakdowns.push({
      passengerId: passenger.id,
      eligibleValueUsd: scaledToNumber(eligibleValueUsd),
      allowanceUsd: PASSENGER_IMPORT_RULES.passengerAllowanceUsd,
      dutiableUsd: scaledToNumber(taxable),
      importDutyUsd: scaledToNumber(duty),
      vatUsd: scaledToNumber(vat),
      totalLevyUsd: scaledToNumber(duty + vat),
      allowanceUsedPercent: Math.min(100, Math.round(scaledToNumber(eligibleValueUsd) / PASSENGER_IMPORT_RULES.passengerAllowanceUsd * 100)),
    });
  }

  const totalLevyUsd = importDutyUsd + vatUsd;
  const totalLevyIdr = usdRate && usdRate > ZERO ? multiply(totalLevyUsd, usdRate) : ZERO;
  const totalShoppingUsd = usdRate && usdRate > ZERO ? eligibleShoppingIdr * SCALE / usdRate : ZERO;
  const isReady = errors.length === 0;
  return {
    isReady,
    errors,
    reviews,
    totalShoppingIdr: scaledToNumber(totalShoppingIdr),
    eligibleShoppingIdr: scaledToNumber(eligibleShoppingIdr),
    totalShoppingUsd: scaledToNumber(totalShoppingUsd),
    allowanceUsd: scenario.passengers.length * PASSENGER_IMPORT_RULES.passengerAllowanceUsd,
    dutiableUsd: scaledToNumber(dutiableUsd),
    importDutyUsd: scaledToNumber(importDutyUsd),
    vatUsd: scaledToNumber(vatUsd),
    ppnbmUsd: 0,
    totalLevyUsd: scaledToNumber(totalLevyUsd),
    totalLevyIdr: scaledToNumber(totalLevyIdr),
    totalCostIdr: scaledToNumber(totalShoppingIdr + totalLevyIdr),
    passengers: passengerBreakdowns,
  };
}

export function emptyScenario(): TravelScenario {
  return {
    originCountry: "",
    arrivalDate: "",
    passengers: [{ id: "passenger-1", name: "Penumpang 1" }],
    items: [{ id: "item-1", name: "", category: "general", quantity: 1, unitPrice: "", discount: "0", currency: "USD", ownerId: "passenger-1", status: "purchased-abroad" }],
    rates: { idrPerUnit: { USD: "", IDR: "1" }, period: "", source: "Kurs manual · cek NDPBM Bea Cukai", mode: "manual" },
  };
}

export const EXAMPLE_SCENARIOS: { title: string; scenario: TravelScenario }[] = [
  {
    title: "Jepang · skincare & sneakers",
    scenario: {
      originCountry: "Jepang", arrivalDate: "", passengers: [{ id: "passenger-1", name: "Penumpang 1" }],
      items: [
        { id: "jp-skincare", name: "Skincare Jepang", category: "general", quantity: 3, unitPrice: "8500", discount: "0", currency: "JPY", ownerId: "passenger-1", status: "purchased-abroad" },
        { id: "jp-sneakers", name: "Sneakers", category: "general", quantity: 1, unitPrice: "18000", discount: "0", currency: "JPY", ownerId: "passenger-1", status: "purchased-abroad" },
        { id: "jp-snacks", name: "Oleh-oleh matcha", category: "general", quantity: 1, unitPrice: "6000", discount: "0", currency: "JPY", ownerId: "passenger-1", status: "purchased-abroad" },
      ],
      rates: { idrPerUnit: { USD: "16000", JPY: "100", IDR: "1" }, period: "Contoh ilustrasi", source: "Contoh, bukan kurs yang berlaku", mode: "manual" },
    },
  },
  {
    title: "Singapura · ponsel & koper",
    scenario: {
      originCountry: "Singapura", arrivalDate: "", passengers: [{ id: "passenger-1", name: "Penumpang 1" }],
      items: [
        { id: "sg-phone", name: "Ponsel baru", category: "mobile-device", quantity: 1, unitPrice: "1400", discount: "0", currency: "SGD", ownerId: "passenger-1", status: "purchased-abroad", imeiAtArrival: true },
        { id: "sg-luggage", name: "Koper kabin", category: "general", quantity: 1, unitPrice: "280", discount: "0", currency: "SGD", ownerId: "passenger-1", status: "purchased-abroad" },
      ],
      rates: { idrPerUnit: { USD: "16000", SGD: "12000", IDR: "1" }, period: "Contoh ilustrasi", source: "Contoh, bukan kurs yang berlaku", mode: "manual" },
    },
  },
  {
    title: "Korea Selatan · beauty haul",
    scenario: {
      originCountry: "Korea Selatan", arrivalDate: "", passengers: [{ id: "passenger-1", name: "Penumpang 1" }],
      items: [
        { id: "kr-skincare", name: "Paket skincare Korea", category: "general", quantity: 3, unitPrice: "120000", discount: "0", currency: "KRW", ownerId: "passenger-1", status: "purchased-abroad" },
        { id: "kr-jacket", name: "Jaket musim dingin", category: "general", quantity: 1, unitPrice: "250000", discount: "0", currency: "KRW", ownerId: "passenger-1", status: "purchased-abroad" },
        { id: "kr-shoes", name: "Sepatu olahraga", category: "general", quantity: 1, unitPrice: "180000", discount: "0", currency: "KRW", ownerId: "passenger-1", status: "purchased-abroad" },
      ],
      rates: { idrPerUnit: { USD: "16000", KRW: "12", IDR: "1" }, period: "Contoh ilustrasi", source: "Contoh, bukan kurs yang berlaku", mode: "manual" },
    },
  },
  {
    title: "Thailand · belanja berdua",
    scenario: {
      originCountry: "Thailand", arrivalDate: "", passengers: [{ id: "passenger-1", name: "Penumpang 1" }, { id: "passenger-2", name: "Penumpang 2" }],
      items: [
        { id: "th-bag", name: "Tas tangan", category: "general", quantity: 1, unitPrice: "16000", discount: "0", currency: "THB", ownerId: "passenger-1", status: "purchased-abroad" },
        { id: "th-clothes", name: "Pakaian liburan", category: "general", quantity: 1, unitPrice: "9000", discount: "0", currency: "THB", ownerId: "passenger-2", status: "purchased-abroad" },
        { id: "th-snacks", name: "Oleh-oleh Thailand", category: "general", quantity: 1, unitPrice: "3000", discount: "0", currency: "THB", ownerId: "passenger-2", status: "purchased-abroad" },
      ],
      rates: { idrPerUnit: { USD: "16000", THB: "450", IDR: "1" }, period: "Contoh ilustrasi", source: "Contoh, bukan kurs yang berlaku", mode: "manual" },
    },
  },
  {
    title: "Prancis · tas desainer",
    scenario: {
      originCountry: "Prancis", arrivalDate: "", passengers: [{ id: "passenger-1", name: "Penumpang 1" }],
      items: [
        { id: "fr-bag", name: "Tas desainer", category: "luxury", quantity: 1, unitPrice: "1200", discount: "0", currency: "EUR", ownerId: "passenger-1", status: "purchased-abroad" },
        { id: "fr-perfume", name: "Parfum", category: "general", quantity: 1, unitPrice: "140", discount: "0", currency: "EUR", ownerId: "passenger-1", status: "purchased-abroad" },
      ],
      rates: { idrPerUnit: { USD: "16000", EUR: "18000", IDR: "1" }, period: "Contoh ilustrasi", source: "Contoh, bukan kurs yang berlaku", mode: "manual" },
    },
  },
  {
    title: "Amerika Serikat · elektronik",
    scenario: {
      originCountry: "Amerika Serikat", arrivalDate: "", passengers: [{ id: "passenger-1", name: "Penumpang 1" }],
      items: [
        { id: "us-tablet", name: "Tablet", category: "mobile-device", quantity: 1, unitPrice: "799", discount: "0", currency: "USD", ownerId: "passenger-1", status: "purchased-abroad", imeiAtArrival: true },
        { id: "us-headphones", name: "Headphone", category: "general", quantity: 1, unitPrice: "249", discount: "0", currency: "USD", ownerId: "passenger-1", status: "purchased-abroad" },
        { id: "us-sneakers", name: "Sneakers", category: "general", quantity: 1, unitPrice: "160", discount: "0", currency: "USD", ownerId: "passenger-1", status: "purchased-abroad" },
      ],
      rates: { idrPerUnit: { USD: "16000", IDR: "1" }, period: "Contoh ilustrasi", source: "Contoh, bukan kurs yang berlaku", mode: "manual" },
    },
  },
];

export function exampleScenario(index = 0): TravelScenario {
  return structuredClone(EXAMPLE_SCENARIOS[index % EXAMPLE_SCENARIOS.length]!.scenario);
}

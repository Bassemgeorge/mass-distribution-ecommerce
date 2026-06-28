import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://niltkbrsuccfwlaistrz.supabase.co",
  "sb_publishable_vqGbSD64yqrc-kFECL0t9Q_ZrsYrw-k"
);

const BASE = "https://niltkbrsuccfwlaistrz.supabase.co/storage/v1/object/public/product-images/";

function img(filename) {
  if (!filename || filename === "null") return null;
  return BASE + encodeURIComponent(filename);
}

const products = [
  // ── PEPSI BOTTLES & CANS ─────────────────────────────────────────────────
  { name_en: "Pepsi 1L PET",           name_ar: "بيبسى 1 لتر",              brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 24.75,   carton_price: 148.50,  image_url: img("6223001366058 - Pepsi_PET- 1L_front.png") },
  { name_en: "Pepsi 1.5L PET",         name_ar: "بيبسى 1.5 لتر",            brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 34.75,   carton_price: 208.50,  image_url: img("6223001366379 - pepsi egypt.png") },
  { name_en: "Pepsi Diet 1.5L PET",    name_ar: "بيبسى دايت 1.5 لتر",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 34.75,   carton_price: 208.50,  image_url: img("PET_Pepsi  DIET 1.5 L- 6223001360209.png") },
  { name_en: "Pepsi 2.43L PET",        name_ar: "بيبسى 2.43 لتر",           brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 39.75,   carton_price: 238.50,  image_url: img("6223001366041 -PEPSI_2,43Ltr.png") },
  { name_en: "Pepsi 1.47L PET",        name_ar: "بيبسى 1.47 لتر",           brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 34.75,   carton_price: 208.50,  image_url: img("6223001366355 - PEPSI_1,47Ltr.png") },
  { name_en: "Pepsi 390ml PET",        name_ar: "بيبسى 390 مل",             brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 11.50,   carton_price: 138.00,  image_url: img("6223001361817 - PEPSI_390ml.png") },
  { name_en: "Diet Pepsi 390ml PET",   name_ar: "بيبسى دايت 390 مل",        brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 11.50,   carton_price: 138.00,  image_url: img("PET  Pepsi DIET 390-ML -6223001361824.png") },
  { name_en: "Pepsi 300ml NRB",        name_ar: "بيبسى 300 مل زجاج",        brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 14.75,   carton_price: 177.00,  image_url: img("6223001366386 - Pepsi 300ml_NRB_PCE_Label_Front.png") },
  { name_en: "Diet Pepsi 300ml NRB",   name_ar: "بيبسى دايت 300 مل زجاج",   brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 14.75,   carton_price: 177.00,  image_url: img("6223001367611 - Pepsi 300ml_NRB_Diet.png") },
  { name_en: "Pepsi 320ml Can",        name_ar: "بيبسى 320 مل كانز",        brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001362067_Pepsi_EG_Can355ml_front.png") },
  { name_en: "Pepsi Diet 320ml Can",   name_ar: "بيبسى دايت 320 مل كانز",   brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001362074 - PEPSI_Diet_355ml.png") },
  { name_en: "PEPSI 320 Diet Can",     name_ar: "بيبسى دايت 320 مل",        brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("PEPSI 320 DIET_6223001360186.png") },
  { name_en: "Pepsi 250ml Can",        name_ar: "بيبسى 250 مل كانز",        brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 13.50,   carton_price: 324.00,  image_url: img("Cans Pepsi 250 ml - 6223001361725.png") },
  { name_en: "Pepsi Night 355ml",      name_ar: "بيبسى نايت 355 مل",        brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001367710 - Pepsi Night_355ml_02_front.png") },
  { name_en: "Pepsi Fizz 1.47L",       name_ar: "بيبسي فيز 1.47 لتر",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 15.00,   carton_price: 90.00,   image_url: img("6223001366393 - PEPSI_FIZZ_EGY_1,47L.png") },
  { name_en: "Pepsi Fizz 250ml PET",   name_ar: "بيبسي فيز 250 مل",         brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 5.00,    carton_price: 60.00,   image_url: img("PET-Pepsi FIZZ 250 ML - 6223001366287.png") },

  // ── 7UP ──────────────────────────────────────────────────────────────────
  { name_en: "7UP 1L PET",             name_ar: "سفن اب 1 لتر",             brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 24.75,   carton_price: 148.50,  image_url: img("6223001367383 - 7UP_PET - 1L_eng.png") },
  { name_en: "7UP 1.5L PET",           name_ar: "سفن اب 1.5 لتر",           brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 34.75,   carton_price: 208.50,  image_url: img("6223001367086 - 7up 1.45Liter_.png") },
  { name_en: "7UP Diet 1.5L PET",      name_ar: "سفن اب دايت 1.5 لتر",      brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 34.75,   carton_price: 208.50,  image_url: img("6223001360612 - 7up_1.5L_diet.png") },
  { name_en: "7UP 2.43L PET",          name_ar: "سفن اب 2.43 لتر",          brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 39.75,   carton_price: 238.50,  image_url: img("6223001366751 - 7UP_2.43Ltr_Eng.png") },
  { name_en: "7UP 250ml PET",          name_ar: "سفن اب 250 مل بلاستيك",    brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 9.50,    carton_price: 114.00,  image_url: img("PET-7UP 250ML - 6223001362982.png") },
  { name_en: "7UP 285ml Can",          name_ar: "سفن اب 285 مل كانز",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001367123 - 7UP 285ML.png") },
  { name_en: "7UP 320ml Can",          name_ar: "سفن اب 320 مل كانز",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001367130_7UP_320ml.png") },
  { name_en: "7UP 355ml Can",          name_ar: "سفن اب 355 مل كانز",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001362081 - 7UP_355ml.png") },
  { name_en: "7UP Diet 355ml Can",     name_ar: "سفن اب دايت 355 مل",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001362098 - 7UP Diet_355ml.png") },
  { name_en: "7UP Diet 330ml Can",     name_ar: "سفن اب دايت 330 مل",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("Cans 7UP DIET 330 ml - 6223001360582.png") },
  { name_en: "7UP 250ml Can",          name_ar: "سفن اب 250 مل كانز",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 13.50,   carton_price: 324.00,  image_url: img("Cans 7up  250 ml -6223001361732.png") },
  { name_en: "7UP 300ml NRB",          name_ar: "سفن اب 300 مل زجاج",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 14.75,   carton_price: 177.00,  image_url: img("6223001367529_7UP_300ml_NRB.png") },
  { name_en: "7UP Diet 300ml NRB",     name_ar: "سفن اب دايت 300 مل زجاج",  brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 14.75,   carton_price: 177.00,  image_url: img("6223001367529 - 7UP Diet NRB 300ml-.png") },
  { name_en: "7UP Fizz 250ml PET",     name_ar: "سفن اب فيز 250 مل",        brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 5.00,    carton_price: 60.00,   image_url: img("PET- 7 UP FIZZ 250ML - 6223001366676.png") },

  // ── MIRINDA ───────────────────────────────────────────────────────────────
  { name_en: "Mirinda Orange 1L PET",          name_ar: "ميريندا برتقال 1 لتر",        brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 24.75,   carton_price: 148.50,  image_url: img("6223001367406 - Mirinda_PET - 1L_orange_eng.png") },
  { name_en: "Mirinda Orange 1.5L PET",        name_ar: "ميريندا برتقال 1.5 لتر",      brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 34.75,   carton_price: 208.50,  image_url: img("6223001367024 - mirinda orange 1.5.png") },
  { name_en: "Mirinda Plus 1.5L PET",          name_ar: "ميريندا بلس 1.5 لتر",         brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 34.75,   carton_price: 208.50,  image_url: img("PET- Miranda Plus 1.5 L- 6223001365433.png") },
  { name_en: "Mirinda Green Apple 1.5L PET",   name_ar: "ميريندا تفاح 1.5 لتر",        brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 34.75,   carton_price: 208.50,  image_url: img("6223001362050 - Mirinda green Apple 1.5 liter.png") },
  { name_en: "Mirinda Orange 2.43L PET",       name_ar: "ميريندا برتقال 2.43 لتر",     brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 39.75,   carton_price: 238.50,  image_url: img("6223001366737 - Miranda_Orange_EGY_2,43Ltr.png") },
  { name_en: "Mirinda Green Apple 2.43L PET",  name_ar: "ميريندا تفاح 2.43 لتر",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 6",  price: 39.75,   carton_price: 238.50,  image_url: img("6223001362050 - Miranda_Green Apple_2.43Ltr.png") },
  { name_en: "Mirinda Orange 250ml PET",       name_ar: "ميريندا برتقال 250 مل",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 9.50,    carton_price: 114.00,  image_url: img("PET-Miranda 250 ML- 6223001366713.png") },
  { name_en: "Mirinda Green Apple 250ml PET",  name_ar: "ميريندا تفاح 250 مل",         brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 9.50,    carton_price: 114.00,  image_url: img("6223001360339 - mirinda green apple 320ml_.png") },
  { name_en: "Mirinda Orange 285ml Can",       name_ar: "ميريندا برتقال 285 مل كانز",  brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001367062 - Mirinda Orange 285ML.png") },
  { name_en: "Mirinda Green Apple 285ml Can",  name_ar: "ميريندا تفاح 285 مل كانز",   brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001367468 - Mirinda Green Apple 285ML.png") },
  { name_en: "Mirinda Orange 320ml Can",       name_ar: "ميريندا برتقال 320 مل كانز",  brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001367079 - mirinda Orange 320ml.png") },
  { name_en: "Mirinda Mystery 320ml Can",      name_ar: "ميريندا ميستري 320 مل",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001367413 - Mirinda_EGY_Mystery_Can_320ml_front2.png") },
  { name_en: "Mirinda Orange 355ml Can",       name_ar: "ميريندا برتقال 355 مل كانز",  brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001362104 - Mirinda Orange_355ml.png") },
  { name_en: "Mirinda Green Apple 355ml Can",  name_ar: "ميريندا تفاح 355 مل كانز",   brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 14.50,   carton_price: 348.00,  image_url: img("6223001362111 - Mirinda Green Apple_CAN_355ml.png") },
  { name_en: "Mirinda Orange 390ml PET",       name_ar: "ميريندا برتقال 390 مل",       brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 11.50,   carton_price: 138.00,  image_url: img("6223001367031 - mirinda Orange 390ml Ara.png") },
  { name_en: "Mirinda Orange 250ml Can",       name_ar: "ميريندا برتقال 250 مل كانز",  brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 13.50,   carton_price: 324.00,  image_url: img("Cans  Miranda Orange 250 ml - 6223001361749.png") },
  { name_en: "Mirinda Green Apple 250ml Can",  name_ar: "ميريندا تفاح 250 مل كانز",   brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 24", price: 13.50,   carton_price: 324.00,  image_url: img("Cans Miranda Green_250 ml- 6223001362296.png") },
  { name_en: "Mirinda 300ml NRB",              name_ar: "ميريندا برتقال 300 مل زجاج",  brand: "Pepsi", category: "Soft Drinks",   pack_size: "Case of 12", price: 14.75,   carton_price: 177.00,  image_url: img("6223001367628 - Mirinda 300ml_NRB.png") },

  // ── AQUAFINA ─────────────────────────────────────────────────────────────
  { name_en: "Aquafina 330ml",              name_ar: "اكوافينا 330 مل",         brand: "Pepsi", category: "Water",         pack_size: "Case of 20", price: 5.00,    carton_price: 100.00,  image_url: img("AQF 330ml - 6223001365372.png") },
  { name_en: "Aquafina 600ml",              name_ar: "اكوافينا 600 مل",         brand: "Pepsi", category: "Water",         pack_size: "Case of 20", price: 5.00,    carton_price: 100.00,  image_url: img("AQF 600ml - 6223001360049.png") },
  { name_en: "Aquafina 1.5L",               name_ar: "اكوافينا 1.5 لتر",        brand: "Pepsi", category: "Water",         pack_size: "Case of 12", price: 8.33,    carton_price: 100.00,  image_url: img("AQF 1.5L - 6223001360056.png") },
  { name_en: "Aquafina Gallon 18.9L",       name_ar: "اكوافينا جالون 18.9 لتر", brand: "Pepsi", category: "Water",         pack_size: "Case of 1",  price: 82.50,   carton_price: 82.50,   image_url: img("AQF BULK2 - 6223001360742.png") },
  { name_en: "Aquafina Sparkling 250ml Can",name_ar: "اكوافينا سباركلينج 250 مل",brand: "Pepsi", category: "Water",        pack_size: "Case of 12", price: 15.00,   carton_price: 180.00,  image_url: img("AQF Sparkling cans 250 ml - 6223001365754.png") },

  // ── STING ─────────────────────────────────────────────────────────────────
  { name_en: "Sting NRB Gold 275ml",   name_ar: "ستينج جولد 275 مل زجاج", brand: "Pepsi", category: "Energy Drinks", pack_size: "Case of 12", price: 9.75,    carton_price: 117.00,  image_url: img("Sting_NRB_gold - 6223001366614.png") },
  { name_en: "Sting NRB Red 275ml",    name_ar: "ستينج ريد 275 مل زجاج",  brand: "Pepsi", category: "Energy Drinks", pack_size: "Case of 12", price: 9.75,    carton_price: 117.00,  image_url: img("Sting_NRB_RED_NEW - 6223001364986.png") },
  { name_en: "Sting Gold 250ml PET",   name_ar: "ستينج جولد 250 مل",      brand: "Pepsi", category: "Energy Drinks", pack_size: "Case of 12", price: 11.75,   carton_price: 141.00,  image_url: img("PET Sting gold 250ml- 6223001366591.png") },
  { name_en: "Sting Red 250ml PET",    name_ar: "ستينج ريد 250 مل",       brand: "Pepsi", category: "Energy Drinks", pack_size: "Case of 12", price: 11.75,   carton_price: 141.00,  image_url: img("PET- Sting Red_250 ml  - 6223001365686.png") },
  { name_en: "Sting Power Plus 500ml", name_ar: "ستينج باور بلس 500 مل",  brand: "Pepsi", category: "Energy Drinks", pack_size: "Case of 12", price: 11.75,   carton_price: 141.00,  image_url: img("6223001367642 - Sting Power Plus.png") },
  { name_en: "Sting 500ml PET Red",    name_ar: "ستينج 500 مل احمر",      brand: "Pepsi", category: "Energy Drinks", pack_size: "Case of 12", price: 11.75,   carton_price: 141.00,  image_url: img("PET-STING 500 ML red - 6223001366423.png") },
  { name_en: "Sting Malt 277ml",       name_ar: "ستينج مالت 277 مل",      brand: "Pepsi", category: "Energy Drinks", pack_size: "Case of 12", price: 9.75,    carton_price: 117.00,  image_url: img("6223001367277 - Sting Malt - NEW.png") },

  // ── TONIC ─────────────────────────────────────────────────────────────────
  { name_en: "Tonic 1L PET", name_ar: "ايفرفيس تونيك 1 لتر", brand: "Pepsi", category: "Tonic Water", pack_size: "Case of 6", price: 34.75, carton_price: 208.50, image_url: img("6223001367086 - 7up 1.45Liter_.png") },

  // ── BIB ───────────────────────────────────────────────────────────────────
  { name_en: "BIB Syrup", name_ar: "باجن بوكس", brand: "Pepsi", category: "BIB Syrup", pack_size: "Case of 1", price: 2000.00, carton_price: 2000.00, image_url: null },
];

// Add shared fields + sequential IDs starting at 238
const START_ID = 238;
const rows = products.map((p, i) => ({
  id: START_ID + i,
  ...p,
  case_count: (() => {
    const m = (p.pack_size ?? "").match(/\d+/);
    return m ? `${m[0]} pcs per carton` : null;
  })(),
  is_active: true,
  stock: 999,
}));

async function run() {
  console.log("Step 1 — Deleting all existing Pepsi products…");
  const { error: delErr, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .eq("brand", "Pepsi");
  if (delErr) { console.error("Delete error:", delErr.message); process.exit(1); }
  console.log(`  Deleted ${count} rows.`);

  console.log(`\nStep 2 — Inserting ${rows.length} new Pepsi products…`);
  const BATCH = 20;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const { error: insErr } = await supabase.from("products").insert(slice);
    if (insErr) { console.error(`  Insert error (batch ${i}):`, insErr.message); process.exit(1); }
    inserted += slice.length;
    console.log(`  ✓ ${inserted}/${rows.length}`);
  }

  console.log("\nStep 3 — Verifying count…");
  const { count: newCount, error: cntErr } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("brand", "Pepsi");
  if (cntErr) { console.error("Count error:", cntErr.message); process.exit(1); }
  console.log(`  Products in DB with brand = 'Pepsi': ${newCount}`);

  console.log("\nStep 4 — Total products in DB…");
  const { count: total } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log(`  Total products: ${total}`);

  console.log("\nDone.");
}

run().catch(console.error);

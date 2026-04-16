import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  SESSION: "messmate.session",
  VENDORS_BY_CITY: "messmate.cache.vendorsByCity",
  MENUS_BY_VENDOR_DATE: "messmate.cache.menusByVendorDate",
  STUDENT_DATA: "messmate.cache.studentData",
  VENDOR_DATA: "messmate.cache.vendorData"
};

export async function saveSession(session) {
  await AsyncStorage.setItem(KEYS.SESSION, JSON.stringify(session));
}

export async function loadSession() {
  const raw = await AsyncStorage.getItem(KEYS.SESSION);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(KEYS.SESSION);
}

async function readCache(key) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : {};
}

async function writeCache(key, data) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export async function setVendorsCache(city, vendors) {
  const current = await readCache(KEYS.VENDORS_BY_CITY);
  current[city] = vendors;
  await writeCache(KEYS.VENDORS_BY_CITY, current);
}

export async function getVendorsCache(city) {
  const current = await readCache(KEYS.VENDORS_BY_CITY);
  return current[city] || [];
}

export async function setMenuCache(vendorDateKey, menu) {
  const current = await readCache(KEYS.MENUS_BY_VENDOR_DATE);
  current[vendorDateKey] = menu;
  await writeCache(KEYS.MENUS_BY_VENDOR_DATE, current);
}

export async function getMenuCache(vendorDateKey) {
  const current = await readCache(KEYS.MENUS_BY_VENDOR_DATE);
  return current[vendorDateKey] || [];
}

export async function setStudentDataCache(data) {
  await writeCache(KEYS.STUDENT_DATA, data);
}

export async function getStudentDataCache() {
  return readCache(KEYS.STUDENT_DATA);
}

export async function setVendorDataCache(data) {
  await writeCache(KEYS.VENDOR_DATA, data);
}

export async function getVendorDataCache() {
  return readCache(KEYS.VENDOR_DATA);
}

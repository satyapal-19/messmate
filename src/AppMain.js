import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  addRating,
  createBooking,
  getMyBookings,
  getMySubscriptions,
  getPendingBookings,
  getPlans,
  getVendorMenu,
  getVendors,
  login,
  registerStudent,
  skipBooking,
  subscribe,
  verifyBooking
} from "./services/api";
import { API_BASE_URL } from "./config/env";
import {
  clearSession,
  getMenuCache,
  getStudentDataCache,
  getVendorDataCache,
  getVendorsCache,
  loadSession,
  saveSession,
  setMenuCache,
  setStudentDataCache,
  setVendorDataCache,
  setVendorsCache
} from "./services/storage";

const tabs = ["Explore", "Bookings", "Vendor", "Profile"];
const cityOptions = ["Sangli", "Kolhapur", "Pune"];
const today = new Date().toISOString().slice(0, 10);

export default function AppMain() {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", phone: "", city: "Sangli" });
  const [activeTab, setActiveTab] = useState("Explore");
  const [selectedCity, setSelectedCity] = useState("Sangli");
  const [role, setRole] = useState("student");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [menu, setMenu] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [ratingValue, setRatingValue] = useState("4.5");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [info, setInfo] = useState("Login to continue");

  const selectedVendor = useMemo(() => vendors.find((v) => v._id === selectedVendorId) || null, [vendors, selectedVendorId]);
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    loadVendors(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (selectedVendorId) {
      loadMenu(selectedVendorId);
      loadPlans(selectedVendorId);
    }
  }, [selectedVendorId]);

  const bootstrap = async () => {
    try {
      const session = await loadSession();
      if (session?.token) {
        setToken(session.token);
        setUser(session.user);
        setRole(session.role || "student");
        await hydrateRoleData(session.token, session.role || "student");
        setInfo("Session restored");
      }
    } catch (_error) {
      setInfo("Unable to restore session");
    } finally {
      setRestoring(false);
    }
  };

  const hydrateRoleData = async (authToken, userRole) => {
    if (userRole === "student") {
      const [b, s] = await Promise.all([getMyBookings(authToken), getMySubscriptions(authToken)]);
      setBookings(b);
      setSubscriptions(s);
      await setStudentDataCache({ bookings: b, subscriptions: s });
    } else {
      const p = await getPendingBookings(authToken);
      setPendingBookings(p);
      await setVendorDataCache({ pendingBookings: p });
    }
  };

  const loadVendors = async (city) => {
    try {
      const data = await getVendors(city);
      setVendors(data);
      if (data[0]) setSelectedVendorId(data[0]._id);
      await setVendorsCache(city, data);
    } catch (_error) {
      const cached = await getVendorsCache(city);
      setVendors(cached);
      if (cached[0]) setSelectedVendorId(cached[0]._id);
      setInfo("Using cached vendors");
    }
  };

  const loadMenu = async (vendorId) => {
    const key = `${vendorId}:${today}`;
    try {
      const data = await getVendorMenu(vendorId, today);
      setMenu(data);
      await setMenuCache(key, data);
    } catch (_error) {
      const cached = await getMenuCache(key);
      setMenu(cached);
      setInfo("Using cached menu");
    }
  };

  const loadPlans = async (vendorId) => {
    try {
      const data = await getPlans(vendorId);
      setPlans(data);
    } catch (_error) {
      setPlans([]);
    }
  };

  const submitLogin = async () => {
    try {
      setLoading(true);
      const data = await login(authForm.email.trim(), authForm.password);
      const session = { token: data.token, user: data.user, role: data.user.role };
      setToken(session.token);
      setUser(session.user);
      setRole(session.role);
      await saveSession(session);
      await hydrateRoleData(session.token, session.role);
      setInfo("Login successful");
    } catch (error) {
      if (authForm.email.includes("vendor")) {
        setInfo("Vendor login failed. Seed backend first.");
      } else {
        setInfo(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async () => {
    try {
      setLoading(true);
      await registerStudent({
        name: authForm.name,
        email: authForm.email,
        password: authForm.password,
        phone: authForm.phone,
        college: "Walchand College of Engineering, Sangli",
        preference: "both",
        city: authForm.city
      });
      setAuthMode("login");
      setInfo("Registered. Please login.");
    } catch (error) {
      setInfo(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await clearSession();
    setToken("");
    setUser(null);
    setRole("student");
    setBookings([]);
    setPendingBookings([]);
    setSubscriptions([]);
    setInfo("Logged out");
  };

  const loadFallbackDataIfNeeded = async () => {
    if (role === "student") {
      const cached = await getStudentDataCache();
      if (cached.bookings) setBookings(cached.bookings);
      if (cached.subscriptions) setSubscriptions(cached.subscriptions);
    } else {
      const cached = await getVendorDataCache();
      if (cached.pendingBookings) setPendingBookings(cached.pendingBookings);
    }
  };

  const handleCreateBooking = async (meal) => {
    if (!token || role !== "student") return setInfo("Login as student");
    try {
      const booking = await createBooking({ mealId: meal._id, date: today }, token);
      const updated = [booking, ...bookings];
      setBookings(updated);
      await setStudentDataCache({ bookings: updated, subscriptions });
      setInfo(`Booked. Code ${booking.bookingCode}`);
    } catch (error) {
      await loadFallbackDataIfNeeded();
      setInfo(error.message);
    }
  };

  const handleVerifyBooking = async () => {
    if (!token || role !== "vendor") return setInfo("Login as vendor");
    const target = pendingBookings.find((b) => b.bookingCode === verificationCode.trim().toUpperCase());
    if (!target) return setInfo("Code not found");
    try {
      await verifyBooking(target._id, verificationCode.trim().toUpperCase(), token);
      await hydrateRoleData(token, "vendor");
      setVerificationCode("");
      setInfo("Payment verified");
    } catch (error) {
      await loadFallbackDataIfNeeded();
      setInfo(error.message);
    }
  };

  const handleSkip = async (bookingId) => {
    try {
      await skipBooking(bookingId, token);
      await hydrateRoleData(token, "student");
    } catch (error) {
      await loadFallbackDataIfNeeded();
      setInfo(error.message);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      await subscribe(planId, token);
      await hydrateRoleData(token, "student");
      setInfo("Subscribed");
    } catch (error) {
      setInfo(error.message);
    }
  };

  const handleRate = async () => {
    if (!selectedVendor) return;
    const value = Number(ratingValue);
    if (Number.isNaN(value) || value < 1 || value > 5) return setInfo("Rating must be 1-5");
    try {
      await addRating({ vendorId: selectedVendor._id, score: value, hygieneScore: value, comment: "Tasty food" }, token);
      setInfo("Rating submitted");
      await loadVendors(selectedCity);
    } catch (error) {
      setInfo(error.message);
    }
  };

  if (restoring) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#f97316" />
        <Text style={styles.info}>Restoring session...</Text>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.hero}>
          <Text style={styles.title}>MessMate</Text>
          <Text style={styles.subtitle}>Zomato-style college mess app</Text>
        </View>
        <ScrollView style={styles.content}>
          <Card title={authMode === "login" ? "Login" : "Create Account"}>
            {authMode === "register" && (
              <TextInput value={authForm.name} onChangeText={(v) => setAuthForm((p) => ({ ...p, name: v }))} placeholder="Full Name" style={styles.input} />
            )}
            <TextInput value={authForm.email} onChangeText={(v) => setAuthForm((p) => ({ ...p, email: v }))} placeholder="Email" style={styles.input} autoCapitalize="none" />
            <TextInput value={authForm.password} onChangeText={(v) => setAuthForm((p) => ({ ...p, password: v }))} placeholder="Password" secureTextEntry style={styles.input} />
            {authMode === "register" && (
              <TextInput value={authForm.phone} onChangeText={(v) => setAuthForm((p) => ({ ...p, phone: v }))} placeholder="Phone" style={styles.input} />
            )}
            <TouchableOpacity style={styles.ctaBtn} onPress={authMode === "login" ? submitLogin : submitRegister}>
              <Text style={styles.ctaBtnText}>{authMode === "login" ? "Login" : "Register"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setAuthMode((m) => (m === "login" ? "register" : "login"))}>
              <Text style={styles.secondaryText}>{authMode === "login" ? "Need account? Register" : "Already have account? Login"}</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>Demo student: satyapal.gaikwad@walchand.edu.in / student123</Text>
            <Text style={styles.hint}>Demo vendor: vendor.datta@messmate.in / vendor123</Text>
          </Card>
          {loading && <ActivityIndicator color="#f97316" />}
          <Text style={styles.info}>API: {API_BASE_URL}</Text>
          <Text style={styles.info}>{info}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Text style={styles.title}>MessMate</Text>
        <Text style={styles.subtitle}>Fresh food, smart bookings, cash verified</Text>
      </View>
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.cityRow}>
          {cityOptions.map((city) => (
            <TouchableOpacity key={city} onPress={() => setSelectedCity(city)} style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}>
              <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>{city}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeTab === "Explore" && (
          <Card title="Vendors & Menu">
            {vendors.map((vendor) => (
              <TouchableOpacity key={vendor._id} style={[styles.row, vendor._id === selectedVendorId && styles.rowSelected]} onPress={() => setSelectedVendorId(vendor._id)}>
                <Text style={styles.bold}>{vendor.messName}</Text>
                <Text style={styles.vendorMeta}>{vendor.city} • {vendor.rating}</Text>
              </TouchableOpacity>
            ))}
            {menu.map((meal) => (
              <View key={meal._id} style={styles.row}>
                <Text>{meal.name} • Rs {meal.price}</Text>
                <TouchableOpacity style={styles.ctaBtnSmall} onPress={() => handleCreateBooking(meal)}>
                  <Text style={styles.ctaBtnText}>Book</Text>
                </TouchableOpacity>
              </View>
            ))}
            {role === "student" &&
              plans.map((plan) => (
                <View key={plan._id} style={styles.row}>
                  <Text>{plan.name} • Rs {plan.price}</Text>
                  <TouchableOpacity style={styles.greenBtnSmall} onPress={() => handleSubscribe(plan._id)}>
                    <Text style={styles.ctaBtnText}>Subscribe</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </Card>
        )}
        {activeTab === "Bookings" && role === "student" && (
          <Card title="My Bookings">
            {bookings.map((b) => (
              <View key={b._id} style={styles.row}>
                <View>
                  <Text style={styles.bold}>{b.mealId?.name || "Meal"}</Text>
                  <Text style={styles.vendorMeta}>{b.bookingCode} • {b.status}</Text>
                </View>
                {b.status === "PENDING" && (
                  <TouchableOpacity style={styles.warnBtnSmall} onPress={() => handleSkip(b._id)}>
                    <Text style={styles.ctaBtnText}>Skip</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Card>
        )}
        {activeTab === "Vendor" && role === "vendor" && (
          <Card title="Verify Cash">
            <TextInput value={verificationCode} onChangeText={setVerificationCode} placeholder="MM-XXXX" style={styles.input} autoCapitalize="characters" />
            <TouchableOpacity style={styles.greenBtn} onPress={handleVerifyBooking}>
              <Text style={styles.ctaBtnText}>Verify</Text>
            </TouchableOpacity>
            {pendingBookings.map((b) => (
              <Text key={b._id} style={styles.vendorMeta}>{b.bookingCode} • {b.studentId?.name}</Text>
            ))}
          </Card>
        )}
        {activeTab === "Profile" && (
          <Card title="Profile">
            <Text style={styles.vendorMeta}>Name: {user?.name}</Text>
            <Text style={styles.vendorMeta}>Role: {role}</Text>
            {role === "student" && (
              <>
                <TextInput value={ratingValue} onChangeText={setRatingValue} keyboardType="decimal-pad" style={styles.input} />
                <TouchableOpacity style={styles.ctaBtn} onPress={handleRate}>
                  <Text style={styles.ctaBtnText}>Rate Selected Vendor</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.secondaryBtn} onPress={logout}>
              <Text style={styles.secondaryText}>Logout</Text>
            </TouchableOpacity>
          </Card>
        )}
        {loading && <ActivityIndicator color="#f97316" />}
        <Text style={styles.info}>{info}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff7ed" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff7ed" },
  hero: { backgroundColor: "#ea580c", padding: 14 },
  title: { fontSize: 32, color: "#fff", fontWeight: "800" },
  subtitle: { color: "#ffedd5" },
  content: { padding: 12 },
  tabs: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  tab: { backgroundColor: "#fed7aa", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  activeTab: { backgroundColor: "#15803d" },
  tabText: { color: "#9a3412", fontWeight: "700", fontSize: 12 },
  activeTabText: { color: "#fff" },
  cityRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  cityChip: { backgroundColor: "#ffedd5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  cityChipActive: { backgroundColor: "#f97316" },
  cityChipText: { color: "#9a3412" },
  cityChipTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#fed7aa", padding: 12, marginBottom: 12 },
  cardTitle: { fontWeight: "800", color: "#9a3412", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#fdba74", borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: "#fff" },
  ctaBtn: { backgroundColor: "#f97316", borderRadius: 8, paddingVertical: 10 },
  greenBtn: { backgroundColor: "#166534", borderRadius: 8, paddingVertical: 10 },
  ctaBtnSmall: { backgroundColor: "#f97316", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  greenBtnSmall: { backgroundColor: "#166534", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  warnBtnSmall: { backgroundColor: "#f59e0b", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  ctaBtnText: { color: "#fff", fontWeight: "700", textAlign: "center", fontSize: 12 },
  secondaryBtn: { marginTop: 10, alignItems: "center" },
  secondaryText: { color: "#166534", fontWeight: "700" },
  row: { borderBottomWidth: 1, borderBottomColor: "#ffedd5", paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowSelected: { backgroundColor: "#f0fdf4" },
  bold: { fontWeight: "700", color: "#1f2937" },
  vendorMeta: { color: "#6b7280", fontSize: 12 },
  hint: { color: "#6b7280", fontSize: 11, marginTop: 4 },
  info: { textAlign: "center", color: "#92400e", marginBottom: 16 }
});

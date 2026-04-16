import { API_BASE_URL } from "../config/env";

async function request(path, options = {}, token) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function registerStudent(payload) {
  return request("/api/auth/register/student", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getVendors(city) {
  return request(`/api/vendors?city=${encodeURIComponent(city)}`);
}

export function getVendorMenu(vendorId, date) {
  return request(`/api/vendors/${vendorId}/menu?date=${date}`);
}

export function createBooking(payload, token) {
  return request("/api/bookings", { method: "POST", body: JSON.stringify(payload) }, token);
}

export function getMyBookings(token) {
  return request("/api/bookings/my", {}, token);
}

export function getPendingBookings(token) {
  return request("/api/bookings/pending", {}, token);
}

export function verifyBooking(bookingId, code, token) {
  return request(`/api/bookings/${bookingId}/verify`, { method: "POST", body: JSON.stringify({ code }) }, token);
}

export function skipBooking(bookingId, token) {
  return request(`/api/bookings/${bookingId}/skip`, { method: "POST" }, token);
}

export function getPlans(vendorId) {
  return request(`/api/subscriptions/plans?vendorId=${vendorId}`);
}

export function subscribe(planId, token) {
  return request("/api/subscriptions", { method: "POST", body: JSON.stringify({ planId }) }, token);
}

export function getMySubscriptions(token) {
  return request("/api/subscriptions/my", {}, token);
}

export function addRating(payload, token) {
  return request("/api/ratings", { method: "POST", body: JSON.stringify(payload) }, token);
}

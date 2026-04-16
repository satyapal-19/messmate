let bookingCounter = 1;
let ratingCounter = 1;

export function createBookingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "MM-";
  for (let i = 0; i < 4; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
}

export function nextBooking(payload) {
  const id = `book-${String(bookingCounter).padStart(3, "0")}`;
  bookingCounter += 1;
  return {
    id,
    ...payload,
    status: "PENDING",
    createdAt: new Date().toISOString()
  };
}

export function nextRating(payload) {
  const id = `rate-${String(ratingCounter).padStart(3, "0")}`;
  ratingCounter += 1;
  return {
    id,
    ...payload,
    createdAt: new Date().toISOString()
  };
}

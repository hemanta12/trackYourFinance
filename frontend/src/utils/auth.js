// src/utils/auth.js
import { jwtDecode } from "jwt-decode";

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    // JWT expiration is in seconds; compare with current time in seconds.
    return decoded.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
}

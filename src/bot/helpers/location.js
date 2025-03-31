import axios from "axios";

export async function getLocationInfo(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

  try {
    const response = await axios.get(url);
    return response.data.display_name || "Manzil topilmadi!";
  } catch (error) {
    console.error("Geocoding xatosi:", error);
    return "Manzil aniqlanmadi!";
  }
}

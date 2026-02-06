export interface CountryData {
    name: string;
    lat: number;
    lng: number;
    code: string;
}

export const COUNTRIES: Record<string, CountryData> = {
    "US": { name: "United States", lat: 37.0902, lng: -95.7129, code: "US" },
    "CN": { name: "China", lat: 35.8617, lng: 104.1954, code: "CN" },
    "RU": { name: "Russia", lat: 61.5240, lng: 105.3188, code: "RU" },
    "IN": { name: "India", lat: 20.5937, lng: 78.9629, code: "IN" },
    "BR": { name: "Brazil", lat: -14.2350, lng: -51.9253, code: "BR" },
    "DE": { name: "Germany", lat: 51.1657, lng: 10.4515, code: "DE" },
    "UK": { name: "United Kingdom", lat: 55.3781, lng: -3.4360, code: "UK" },
    "FR": { name: "France", lat: 46.2276, lng: 2.2137, code: "FR" },
    "JP": { name: "Japan", lat: 36.2048, lng: 138.2529, code: "JP" },
    "AU": { name: "Australia", lat: -25.2744, lng: 133.7751, code: "AU" },
    "CA": { name: "Canada", lat: 56.1304, lng: -106.3468, code: "CA" },
    "KP": { name: "North Korea", lat: 40.3399, lng: 127.5101, code: "KP" },
    "KR": { name: "South Korea", lat: 35.9078, lng: 127.7669, code: "KR" },
    "IR": { name: "Iran", lat: 32.4279, lng: 53.6880, code: "IR" },
    "IL": { name: "Israel", lat: 31.0461, lng: 34.8516, code: "IL" },
    "UA": { name: "Ukraine", lat: 48.3794, lng: 31.1656, code: "UA" },
    "SA": { name: "Saudi Arabia", lat: 23.8859, lng: 45.0792, code: "SA" },
    "TR": { name: "Turkey", lat: 38.9637, lng: 35.2433, code: "TR" },
    "ID": { name: "Indonesia", lat: -0.7893, lng: 113.9213, code: "ID" },
    "ZA": { name: "South Africa", lat: -30.5595, lng: 22.9375, code: "ZA" },
    "MX": { name: "Mexico", lat: 23.6345, lng: -102.5528, code: "MX" },
    "IT": { name: "Italy", lat: 41.8719, lng: 12.5674, code: "IT" },
    "ES": { name: "Spain", lat: 40.4637, lng: -3.7492, code: "ES" },
    "PL": { name: "Poland", lat: 51.9194, lng: 19.1451, code: "PL" },
    "NL": { name: "Netherlands", lat: 52.1326, lng: 5.2913, code: "NL" },
    "SE": { name: "Sweden", lat: 60.1282, lng: 18.6435, code: "SE" },
    "CH": { name: "Switzerland", lat: 46.8182, lng: 8.2275, code: "CH" },
    "TW": { name: "Taiwan", lat: 23.6978, lng: 120.9605, code: "TW" },
    "HK": { name: "Hong Kong", lat: 22.3193, lng: 114.1694, code: "HK" },
    "SG": { name: "Singapore", lat: 1.3521, lng: 103.8198, code: "SG" },
};

export const ATTACK_TYPES = [
    { name: "SQL Injection", color: "#ef4444" }, // Red
    { name: "DDoS Impact", color: "#f59e0b" },   // Amber
    { name: "XSS Attempt", color: "#3b82f6" },   // Blue
    { name: "Brute Force", color: "#ec4899" },   // Pink
    { name: "Malware Payload", color: "#8b5cf6" }, // Purple
    { name: "Port Scan", color: "#10b981" },     // Emerald
];

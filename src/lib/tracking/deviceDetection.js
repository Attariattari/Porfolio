/**
 * Device Detection Utility
 * Parses userAgent to extract device information with better accuracy
 */

export function parseUserAgent(userAgent) {
  if (!userAgent || userAgent === 'unknown') {
    return {
      type: 'desktop',
      browser: 'Unknown',
      os: 'Unknown',
    };
  }

  const ua = userAgent.toLowerCase();

  // Device Type Detection (must check tablet BEFORE mobile)
  let type = 'desktop';
  
  if (/ipad|kindle|playbook|silk|nexus 7|nexus 10|xoom|android.*tablet|iphone.*ipad/i.test(ua)) {
    type = 'tablet';
  } else if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini|windows phone|webos|palm|symbian/i.test(ua)) {
    type = 'mobile';
  }

  // Browser Detection - order matters!
  let browser = 'Unknown';
  
  if (/edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/chrome|chromium|crios/i.test(ua) && !/edg/i.test(ua)) {
    browser = 'Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/safari/i.test(ua) && !/chrome|chromium|crios|edg|firefox/i.test(ua)) {
    browser = 'Safari';
  } else if (/opera|opr/i.test(ua)) {
    browser = 'Opera';
  } else if (/msie|trident/i.test(ua)) {
    browser = 'Internet Explorer';
  } else if (/ucbrowser/i.test(ua)) {
    browser = 'UC Browser';
  } else if (/samsung/i.test(ua)) {
    browser = 'Samsung Internet';
  }

  // OS Detection
  let os = 'Unknown';
  
  if (/windows|win32|win64|wince/i.test(ua)) {
    os = 'Windows';
  } else if (/macintosh|mac os|mac_powerpc|darwin/i.test(ua)) {
    os = 'macOS';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  } else if (/webos|hpwos/i.test(ua)) {
    os = 'WebOS';
  } else if (/ubuntu/i.test(ua)) {
    os = 'Ubuntu';
  }

  return { type, browser, os };
}

/**
 * Simple in-memory cache for geolocation results to avoid hitting rate limits
 */
const geoCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * IP Geolocation Utility
 * Uses multiple APIs with fallbacks and caching
 */
export async function getGeoFromIP(ip) {
  try {
    // 1. Check cache first
    const cached = geoCache.get(ip);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log('[Geolocation] Using cached result for:', ip);
      return cached.data;
    }

    // Skip geolocation for localhost/private IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'localhost' || 
        ip.includes('127.0.0.1') || ip.startsWith('192.168') || 
        ip.startsWith('10.') || ip.startsWith('172.') || ip === '::ffff:127.0.0.1') {
      return {
        ip,
        country: 'Pakistan', // Keep Pakistan as requested
        countryCode: 'PK',
        city: 'Local Machine',
        latitude: 0,
        longitude: 0,
      };
    }

    // Clean up IP address
    const cleanIP = ip.split(':')[0].split(',')[0].trim().replace('::ffff:', '');

    console.log('[Geolocation] Looking up IP:', cleanIP);

    // Try ipapi.co (1000 requests/day)
    try {
      const response = await fetch(`https://ipapi.co/${cleanIP}/json/`);
      if (response.ok) {
        const data = await response.json();
        if (data.country_name && !data.error) {
          const result = {
            ip: cleanIP,
            country: data.country_name,
            countryCode: data.country_code,
            city: data.city || data.region || 'Unknown City',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
          };
          geoCache.set(ip, { data: result, timestamp: Date.now() });
          console.log('[Geolocation] ipapi.co:', result.country, '-', result.city);
          return result;
        }
      }
    } catch (e) { }

    // Try freeipapi.com (backup)
    try {
      const response = await fetch(`https://freeipapi.com/api/json/${cleanIP}`);
      if (response.ok) {
        const data = await response.json();
        if (data.countryName) {
          const result = {
            ip: cleanIP,
            country: data.countryName,
            countryCode: data.countryCode,
            city: data.cityName || 'Unknown City',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
          };
          geoCache.set(ip, { data: result, timestamp: Date.now() });
          console.log('[Geolocation] freeipapi.com:', result.country, '-', result.city);
          return result;
        }
      }
    } catch (e) { }

    // Try ip-api.com (backup)
    try {
      const response = await fetch(`http://ip-api.com/json/${cleanIP}?fields=status,country,countryCode,city,lat,lon`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          const result = {
            ip: cleanIP,
            country: data.country,
            countryCode: data.countryCode,
            city: data.city || 'Unknown City',
            latitude: data.lat || 0,
            longitude: data.lon || 0,
          };
          geoCache.set(ip, { data: result, timestamp: Date.now() });
          console.log('[Geolocation] ip-api.com:', result.country, '-', result.city);
          return result;
        }
      }
    } catch (e) { }

    throw new Error('All Geolocation APIs failed');
  } catch (error) {
    console.error('[Geolocation] Final Error:', error.message);
    return {
      ip: ip || 'unknown',
      country: 'Pakistan',
      countryCode: 'PK',
      city: 'Unknown City',
      latitude: 0,
      longitude: 0,
    };
  }
}

/**
 * Generate Session ID
 */
export function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get Client IP from Request Headers
 * Handles multiple proxy setups and deployment scenarios
 */
export function getClientIP(req) {
  // Try various IP headers in order of priority
  const headers = [
    'cf-connecting-ip',    // Cloudflare
    'x-client-ip',         // Various proxies
    'x-real-ip',           // Nginx
    'x-forwarded-for',     // General proxy
    'x-appengine-user-ip', // Google App Engine
    'true-client-ip'       // Akamai/Cloudflare
  ];

  for (const headerName of headers) {
    const value = req.headers.get(headerName);
    if (value && value !== 'unknown') {
      // Handle comma-separated list in x-forwarded-for
      if (headerName === 'x-forwarded-for') {
        const ips = value.split(',').map(ip => ip.trim());
        if (ips[0]) return ips[0];
      }
      return value;
    }
  }

  // Fallback to Next.js req.ip
  if (req.ip && req.ip !== 'unknown') {
    return req.ip;
  }

  // Last resort
  return req.socket?.remoteAddress || '127.0.0.1';
}

import dns from "dns/promises";

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fd00:/i,
  /^fe80:/i,
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((range) => range.test(ip));
}

export async function validateProxyUrl(raw: string): Promise<URL | null> {
  let url: URL;

  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  if (url.hostname === "localhost") {
    return null;
  }

  try {
    const { address } = await dns.lookup(url.hostname);

    if (isPrivateIp(address)) {
      return null;
    }
  } catch {
    return null;
  }

  return url;
}

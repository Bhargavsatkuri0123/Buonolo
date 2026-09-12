import hostInfoTemplate from "../data/hostInfoTemplate.json" with { type: "json" };

type Vars = Record<"city" | "host" | "origin" | "q" | "qHost" | "qOrigin", string>;

// Fills {{city}}, {{host}}, {{origin}}, {{q}}, {{qHost}}, {{qOrigin}} placeholders
// in every string leaf of the template (see src/data/hostInfoTemplate.json).
function interpolate<T>(value: T, vars: Vars): T {
  if (typeof value === "string") {
    return value.replace(/\{\{(\w+)\}\}/g, (match, key: string) => vars[key as keyof Vars] ?? match) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => interpolate(item, vars)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, interpolate(v, vars)])) as T;
  }
  return value;
}

// Generates the default "getting settled" content for a given (origin, host, city) combination.
// This ports the previous frontend-only TEMPLATE_HOST_INFO() generator so it runs server-side and can be
// cached/overridden — icon fields are lucide-react export names (strings), resolved to components client-side.
export function generateHostInfoTemplate(origin: string, city: string, host: string) {
  const vars: Vars = {
    city,
    host,
    origin,
    q: encodeURIComponent(city),
    qHost: encodeURIComponent(host),
    qOrigin: encodeURIComponent(origin),
  };
  return interpolate(hostInfoTemplate, vars);
}

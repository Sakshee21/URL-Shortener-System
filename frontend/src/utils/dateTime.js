const IST_TIME_ZONE = "Asia/Kolkata";

const parseTimestamp = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  let parsedValue = value;

  if (typeof value === "string") {
    const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(value);
    parsedValue = hasTimezone ? value : `${value}Z`;
  }

  const timestamp = new Date(parsedValue);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
};

export function formatISTDateTime(value) {
  const timestamp = parseTimestamp(value);

  if (!timestamp) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: IST_TIME_ZONE,
  }).format(timestamp);
}

export function formatISTDate(value) {
  const timestamp = parseTimestamp(value);

  if (!timestamp) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: IST_TIME_ZONE,
  }).format(timestamp);
}

export function formatRelativeTime(value) {
  const timestamp = parseTimestamp(value);

  if (!timestamp) {
    return "-";
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp.getTime()) / 1000));

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
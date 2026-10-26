export function mergeMessages(current, incoming) {
  const merged = new Map();

  [...current, ...incoming].forEach((message, index) => {
    const key = message.id || `${message.timestamp || 'untimed'}-${message.user || message.sender?.username || 'unknown'}-${message.text}-${index}`;
    merged.set(key, message);
  });

  return [...merged.values()].sort((left, right) => {
    const leftTime = Date.parse(left.timestamp) || 0;
    const rightTime = Date.parse(right.timestamp) || 0;
    return leftTime - rightTime;
  });
}

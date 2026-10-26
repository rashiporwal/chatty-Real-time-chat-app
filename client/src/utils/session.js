const SESSION_KEY = 'chatty.identity';

export function saveIdentity(identity) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(identity));
}

export function readIdentity() {
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    return value?.username && value?.room ? value : null;
  } catch {
    return null;
  }
}

export function clearIdentity() {
  sessionStorage.removeItem(SESSION_KEY);
}

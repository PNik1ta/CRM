export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchJson(url) {
  return requestJson(url);
}

export async function postJson(url, payload) {
  return requestJson(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getStudentDisplayName(student) {
  return [student.first_name, student.last_name].filter(Boolean).join(' ') || `Student #${student.id}`;
}

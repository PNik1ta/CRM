export async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function getStudentDisplayName(student) {
  return [student.first_name, student.last_name].filter(Boolean).join(' ') || `Student #${student.id}`;
}

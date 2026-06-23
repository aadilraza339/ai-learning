// WhatsApp export parser.
// Handles the two common export formats:
//   Android: "12/02/24, 8:41 PM - John: Hello"
//   iOS:     "[12/02/24, 8:41:00 PM] John: Hello"
// Continuation lines (no date prefix) are appended to the previous message.
// System lines (no "sender: message" structure) are tagged sender "System".

// Matches the start of a new message and captures date, time, and the remainder.
const ANDROID_RE =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:[APap][Mm])?)\s+-\s+(.*)$/;
const IOS_RE =
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:[APap][Mm])?)\]\s+(.*)$/;

function parseDate(dateStr, timeStr) {
  // dateStr is day/month/year or month/day/year — WhatsApp varies by locale.
  // We try DD/MM/YY first (most common outside US), fall back to MM/DD.
  const [a, b, cRaw] = dateStr.split('/').map((x) => parseInt(x, 10));
  let year = cRaw;
  if (year < 100) year += 2000;

  const time = timeStr.trim().toUpperCase();
  const ampm = time.match(/([AP]M)$/)?.[1];
  let [h, m, s] = time.replace(/\s*[AP]M$/, '').split(':').map((x) => parseInt(x, 10));
  s = s || 0;
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  const makeDate = (day, month) => new Date(year, month - 1, day, h, m, s);

  // Prefer DD/MM; if day > 12 it can't be a month, so the other ordering is wrong anyway.
  let day = a;
  let month = b;
  if (a > 12 && b <= 12) {
    day = a;
    month = b;
  } else if (b > 12 && a <= 12) {
    day = b;
    month = a;
  }
  const d = makeDate(day, month);
  return isNaN(d.getTime()) ? null : d;
}

function splitSender(rest) {
  // "John: Hello" -> { sender: "John", message: "Hello" }
  // System notices have no colon -> treat whole line as system message.
  const idx = rest.indexOf(': ');
  if (idx === -1) {
    return { sender: 'System', message: rest };
  }
  return { sender: rest.slice(0, idx).trim(), message: rest.slice(idx + 2) };
}

export function parseWhatsApp(text) {
  const lines = text.split(/\r?\n/);
  const messages = [];
  let current = null;

  for (const line of lines) {
    const m = line.match(ANDROID_RE) || line.match(IOS_RE);
    if (m) {
      if (current) messages.push(current);
      const [, dateStr, timeStr, rest] = m;
      const { sender, message } = splitSender(rest);
      current = {
        date: parseDate(dateStr, timeStr),
        sender,
        message,
      };
    } else if (current) {
      // Continuation of a multi-line message.
      current.message += '\n' + line;
    }
    // Lines before the first match (e.g. blank leading lines) are ignored.
  }
  if (current) messages.push(current);

  return messages
    .map((msg) => ({
      ...msg,
      message: msg.message.trim(),
    }))
    .filter((msg) => msg.message.length > 0);
}

// Group consecutive messages into chunks for embedding.
// Short WhatsApp messages embed poorly alone, so we window them.
export function chunkMessages(messages, size = 12) {
  const chunks = [];
  for (let i = 0; i < messages.length; i += size) {
    const slice = messages.slice(i, i + size);
    const content = slice
      .map((m) => {
        const ts = m.date ? m.date.toISOString().slice(0, 16).replace('T', ' ') : '????';
        return `[${ts}] ${m.sender}: ${m.message}`;
      })
      .join('\n');
    chunks.push({
      content,
      startDate: slice[0].date,
      endDate: slice[slice.length - 1].date,
      msgCount: slice.length,
    });
  }
  return chunks;
}

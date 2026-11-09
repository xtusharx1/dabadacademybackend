// Read-only fee analytics built from the existing FeeStatus, FeePaymentRecords
// and OtherChargesRecords data. Pure functions: rows in, figures out.

const toNum = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const round = (n) => Math.round(n);
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

// Today's date in India, 'YYYY-MM-DD'
const todayIST = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);

const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

const titleCase = (s) => String(s || '').trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Where a student's fee stands today
function dueStatus(s, today) {
  if (s.paymentCompleted || toNum(s.remainingFees) <= 0) return 'paid';
  if (!isDate(s.nextDueDate)) return 'nodate';
  if (s.nextDueDate < today) return 'overdue';
  if (daysBetween(today, s.nextDueDate) <= 7) return 'week';
  return 'later';
}

function monthsBack(today, count) {
  const out = [];
  let [y, m] = today.slice(0, 7).split('-').map(Number);
  for (let i = 0; i < count; i += 1) {
    out.unshift(`${y}-${String(m).padStart(2, '0')}`);
    m -= 1;
    if (m === 0) { m = 12; y -= 1; }
  }
  return out;
}

const INSTALLMENT_ORDER = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

function dashboard({ statuses, payments, charges }, today) {
  const month = today.slice(0, 7);
  let total = 0; let collected = 0; let outstanding = 0; let overdue = 0;
  let overdueStudents = 0; let fullPaid = 0;
  const batches = {};

  statuses.forEach((s) => {
    const st = dueStatus(s, today);
    const t = toNum(s.totalFees); const paid = toNum(s.feesSubmitted);
    const rem = st === 'paid' ? 0 : toNum(s.remainingFees);
    total += t; collected += paid; outstanding += rem;
    if (st === 'paid') fullPaid += 1;
    if (st === 'overdue') { overdue += rem; overdueStudents += 1; }

    const b = batches[s.batch_id] || (batches[s.batch_id] = {
      batch_id: s.batch_id, batch_name: s.batch_name, students: 0, total: 0, collected: 0,
      outstanding: 0, overdue: 0, overdue_students: 0, paid_in_full: 0,
    });
    b.students += 1; b.total += t; b.collected += paid; b.outstanding += rem;
    if (st === 'paid') b.paid_in_full += 1;
    if (st === 'overdue') { b.overdue += rem; b.overdue_students += 1; }
  });

  // Payments: monthly totals, and installment-wise totals by payment title
  const monthKeys = monthsBack(today, 12);
  const byMonth = {};
  monthKeys.forEach((k) => { byMonth[k] = { month: k, amount: 0, payments: 0 }; });
  const byTitle = {};
  const lastMonth = monthKeys[monthKeys.length - 2];
  let collectedThisMonth = 0; let paymentsThisMonth = 0; let collectedLastMonth = 0;
  payments.forEach((p) => {
    const amt = toNum(p.amount);
    if (isDate(p.date)) {
      const k = p.date.slice(0, 7);
      if (byMonth[k]) { byMonth[k].amount += amt; byMonth[k].payments += 1; }
      if (k === month) { collectedThisMonth += amt; paymentsThisMonth += 1; }
      if (k === lastMonth) collectedLastMonth += amt;
    }
    const isInstallment = /installment/i.test(p.title || '');
    const name = isInstallment ? titleCase(p.title) : 'Other payments';
    const g = byTitle[name] || (byTitle[name] = { name, amount: 0, payments: 0 });
    g.amount += amt; g.payments += 1;
  });
  // Financial-year view (April to March) of actual money received
  const fyStart = Number(month.slice(5, 7)) >= 4 ? Number(month.slice(0, 4)) : Number(month.slice(0, 4)) - 1;
  const sessionMonths = [];
  for (let i = 0; i < 12; i += 1) {
    const mm = ((3 + i) % 12) + 1;
    const yy = mm >= 4 ? fyStart : fyStart + 1;
    sessionMonths.push({ month: `${yy}-${String(mm).padStart(2, '0')}`, amount: 0, payments: 0 });
  }
  const sessionIndex = Object.fromEntries(sessionMonths.map((m) => [m.month, m]));
  payments.forEach((p) => {
    if (!isDate(p.date)) return;
    const m = sessionIndex[p.date.slice(0, 7)];
    if (m) { m.amount += toNum(p.amount); m.payments += 1; }
  });

  // Drop empty months before the first payment so the chart starts where data starts
  const monthly = Object.values(byMonth);
  while (monthly.length > 1 && monthly[0].payments === 0) monthly.shift();

  const rank = (n) => {
    if (n === 'Other payments') return 99;
    const i = INSTALLMENT_ORDER.findIndex((o) => n.toLowerCase().startsWith(o));
    return i === -1 ? 50 : i;
  };
  const installments = Object.values(byTitle).sort((a, b) => rank(a.name) - rank(b.name))
    .map((g) => ({ ...g, amount: round(g.amount) }));

  const chargeGroups = {};
  charges.forEach((c) => {
    const amt = toNum(c.amount);
    const name = titleCase(c.title);
    if (!amt || !/[a-z]/i.test(name)) return;
    const g = chargeGroups[name.toLowerCase()] || (chargeGroups[name.toLowerCase()] = { name, amount: 0, count: 0 });
    g.amount += amt; g.count += 1;
  });

  return {
    as_of: today,
    kpis: {
      students: statuses.length,
      total: round(total),
      collected: round(collected),
      collected_pct: total ? Math.round((collected / total) * 1000) / 10 : 0,
      outstanding: round(outstanding),
      students_owing: statuses.length - fullPaid,
      overdue: round(overdue),
      overdue_students: overdueStudents,
      paid_in_full: fullPaid,
      collected_this_month: round(collectedThisMonth),
      payments_this_month: paymentsThisMonth,
      collected_last_month: round(collectedLastMonth),
    },
    monthly: monthly.map((m) => ({ ...m, amount: round(m.amount) })),
    session: {
      label: `${fyStart}-${String((fyStart + 1) % 100).padStart(2, '0')}`,
      months: sessionMonths.map((m) => ({ ...m, amount: round(m.amount), future: m.month > month })),
      total: round(sessionMonths.reduce((sum, m) => sum + m.amount, 0)),
    },
    installments,
    charges: Object.values(chargeGroups).sort((a, b) => b.amount - a.amount).map((g) => ({ ...g, amount: round(g.amount) })),
    batches: Object.values(batches)
      .map((b) => ({
        ...b, total: round(b.total), collected: round(b.collected), outstanding: round(b.outstanding), overdue: round(b.overdue),
        collected_pct: b.total ? Math.round((b.collected / b.total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => String(a.batch_name).localeCompare(String(b.batch_name))),
  };
}

const AGEING = [['1–7 days', 1, 7], ['8–15 days', 8, 15], ['16–30 days', 16, 30], ['31–60 days', 31, 60], ['60+ days', 61, Infinity]];

function collections({ statuses }, today) {
  const owing = statuses
    .map((s) => ({ s, status: dueStatus(s, today) }))
    .filter((x) => x.status !== 'paid');

  const tiles = { overdue: { amount: 0, students: 0 }, week: { amount: 0, students: 0 }, later: { amount: 0, students: 0 }, nodate: { amount: 0, students: 0 } };
  const batches = {};
  const ageing = AGEING.map(([label, from, to]) => ({ label, from, to, amount: 0, students: 0 }));
  const byDate = {};

  const students = owing.map(({ s, status }) => {
    const rem = toNum(s.remainingFees);
    tiles[status].amount += rem; tiles[status].students += 1;
    const b = batches[s.batch_id] || (batches[s.batch_id] = { batch_id: s.batch_id, batch_name: s.batch_name, outstanding: 0, overdue: 0, students: 0 });
    b.outstanding += rem; b.students += 1;
    if (status === 'overdue') b.overdue += rem;
    const days = isDate(s.nextDueDate) ? daysBetween(s.nextDueDate, today) : null; // positive = overdue
    if (status === 'overdue') {
      const a = ageing.find((g) => days >= g.from && days <= g.to);
      if (a) { a.amount += rem; a.students += 1; }
    }
    if (isDate(s.nextDueDate)) {
      const d = byDate[s.nextDueDate] || (byDate[s.nextDueDate] = { date: s.nextDueDate, amount: 0, students: 0, days });
      d.amount += rem; d.students += 1;
    }
    return {
      fee_status_id: s.id, user_id: s.user_id, name: s.name, phone_number: s.phone_number,
      batch_id: s.batch_id, batch_name: s.batch_name,
      total: round(toNum(s.totalFees)), paid: round(toNum(s.feesSubmitted)), remaining: round(rem),
      next_due_date: isDate(s.nextDueDate) ? s.nextDueDate : null, days_overdue: days, status,
    };
  });

  // Most overdue first, then soonest due, then no date
  const sortKey = (r) => (r.status === 'nodate' ? -Infinity : r.days_overdue);
  students.sort((a, b) => sortKey(b) - sortKey(a) || b.remaining - a.remaining);

  const totalOwing = students.reduce((sum, r) => sum + r.remaining, 0);
  Object.values(tiles).forEach((t) => { t.amount = round(t.amount); });
  return {
    as_of: today,
    total_outstanding: round(totalOwing),
    students_owing: students.length,
    tiles,
    ageing: ageing.map(({ label, amount, students: n }) => ({ label, amount: round(amount), students: n })),
    batches: Object.values(batches)
      .map((b) => ({ ...b, outstanding: round(b.outstanding), overdue: round(b.overdue) }))
      .sort((a, b) => String(a.batch_name).localeCompare(String(b.batch_name))),
    by_due_date: Object.values(byDate).sort((a, b) => (a.date < b.date ? -1 : 1)).map((d) => ({ ...d, amount: round(d.amount) })),
    students,
  };
}

module.exports = { todayIST, dueStatus, daysBetween, dashboard, collections };

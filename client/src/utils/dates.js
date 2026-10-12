function toIsoDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function todayIso() {
  return toIsoDate(new Date());
}

export function shiftIsoDate(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Default expense date window: one month ago → today. */
export function defaultExpenseDateRange() {
  const to = todayIso();
  const from = new Date(`${to}T00:00:00`);
  from.setMonth(from.getMonth() - 1);
  return {
    expenseDateFrom: toIsoDate(from),
    expenseDateTo: to,
  };
}

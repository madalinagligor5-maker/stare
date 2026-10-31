// Economia cu stele ⭐: câștig, cumpărare, colecții. Funcții pure peste stare.

export function addStars(state, amount) {
  const n = Math.max(0, Math.floor(Number(amount) || 0));
  state.stars += n;
  state.totalStars = (state.totalStars || 0) + n;
  return n;
}

// Un obiect e deblocat dacă e gratuit sau a fost cumpărat.
export function isUnlocked(state, item) {
  if (!item) return false;
  if (!item.price) return true;
  return state.owned.includes(item.id);
}

export function canAfford(state, item) {
  return !!item && state.stars >= (item.price || 0);
}

// Cumpără un obiect. Întoarce { ok, reason }.
export function buyItem(state, item) {
  if (!item) return { ok: false, reason: 'missing' };
  if (isUnlocked(state, item)) return { ok: false, reason: 'owned' };
  if (!canAfford(state, item)) return { ok: false, reason: 'poor', missing: item.price - state.stars };
  state.stars -= item.price;
  state.owned.push(item.id);
  return { ok: true };
}

// Cât din colecție e deblocat: { have, total, complete }.
export function collectionProgress(state, collectionId, allItems) {
  const items = allItems.filter((it) => it.collection === collectionId);
  const have = items.filter((it) => isUnlocked(state, it)).length;
  return { have, total: items.length, complete: items.length > 0 && have === items.length };
}

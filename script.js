/* Personal Expense Tracker - Vanilla JS, localStorage */
(function () {
  'use strict';

  // ===== Constants =====
  const STORAGE_KEY = 'expenseTracker:expenses:v1';
  const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Other'];

  // ===== State =====
  /** @type {Array<{id:string, amountCents:number, category:string, date:string, description:string}>} */
  let expenses = [];
  let filters = { category: 'all', fromDate: '', toDate: '' };

  // ===== DOM Refs =====
  const form = document.getElementById('expense-form');
  const amountInput = document.getElementById('amount');
  const categorySelect = document.getElementById('category');
  const dateInput = document.getElementById('date');
  const descriptionInput = document.getElementById('description');

  const filterCategorySelect = document.getElementById('filter-category');
  const filterFromInput = document.getElementById('filter-from');
  const filterToInput = document.getElementById('filter-to');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');

  const tbody = document.getElementById('expenses-tbody');
  const totalSpentEl = document.getElementById('total-spent');
  const txCountEl = document.getElementById('transaction-count');
  const categoryChartEl = document.getElementById('category-chart');
  const categoryBreakdownEl = document.getElementById('category-breakdown');

  // ===== Utilities =====
  function todayStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function loadExpenses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isValidExpenseShape);
    } catch (e) {
      return [];
    }
  }

  function saveExpenses(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function isValidExpenseShape(obj) {
    return (
      obj && typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.amountCents === 'number' && Number.isFinite(obj.amountCents) && obj.amountCents > 0 &&
      typeof obj.category === 'string' && CATEGORIES.includes(obj.category) &&
      typeof obj.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.date) &&
      typeof obj.description === 'string'
    );
  }

  function parseAmountToCents(amountStr) {
    const num = Number(amountStr);
    if (!Number.isFinite(num) || num <= 0) return null;
    return Math.round(num * 100);
  }

  function formatCents(cents) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(cents / 100);
    } catch {
      return `$${(cents / 100).toFixed(2)}`;
    }
  }

  function generateId() {
    const rand = Math.floor(Math.random() * 1e9).toString(36);
    return `exp_${Date.now().toString(36)}_${rand}`;
  }

  function compareDateStrings(a, b) {
    // Safe lexicographic compare for YYYY-MM-DD
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  // ===== Rendering =====
  function getFilteredExpenses() {
    let list = expenses.slice();

    if (filters.category && filters.category !== 'all') {
      list = list.filter((e) => e.category === filters.category);
    }
    if (filters.fromDate) {
      list = list.filter((e) => compareDateStrings(e.date, filters.fromDate) >= 0);
    }
    if (filters.toDate) {
      list = list.filter((e) => compareDateStrings(e.date, filters.toDate) <= 0);
    }

    // Newest first
    list.sort((a, b) => {
      const byDate = compareDateStrings(b.date, a.date);
      if (byDate !== 0) return byDate;
      return a.id < b.id ? 1 : -1;
    });

    return list;
  }

  function renderExpensesList() {
    const list = getFilteredExpenses();

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="color: var(--muted); text-align:center; padding:16px;">No expenses found.</td></tr>`;
      return;
    }

    const rows = list.map((e) => {
      const safeDesc = escapeHtml(e.description || '');
      return `
        <tr>
          <td>${e.date}</td>
          <td>${e.category}</td>
          <td class="num">${formatCents(e.amountCents)}</td>
          <td>${safeDesc}</td>
          <td>
            <div class="actions">
              <button class="btn btn-danger delete-btn" data-id="${e.id}" title="Delete">Delete</button>
            </div>
          </td>
        </tr>`;
    });

    tbody.innerHTML = rows.join('');
  }

  function renderStats() {
    const list = getFilteredExpenses();
    const total = list.reduce((sum, e) => sum + e.amountCents, 0);
    totalSpentEl.textContent = formatCents(total);
    txCountEl.textContent = String(list.length);

    const perCategory = new Map();
    CATEGORIES.forEach((c) => perCategory.set(c, 0));
    for (const e of list) perCategory.set(e.category, perCategory.get(e.category) + e.amountCents);

    const maxCents = Math.max(1, ...Array.from(perCategory.values()));

    // Chart bars
    const chartRows = Array.from(perCategory.entries()).map(([cat, cents]) => {
      const pct = Math.round((cents / maxCents) * 100);
      return `
        <div class="chart-row">
          <div class="chart-label">${cat}</div>
          <div class="chart-bar" aria-hidden="true">
            <div class="chart-bar-fill" style="width:${pct}%;"></div>
          </div>
          <div class="chart-amount">${formatCents(cents)}</div>
        </div>`;
    });
    categoryChartEl.innerHTML = chartRows.join('');

    // Breakdown list
    const items = Array.from(perCategory.entries())
      .filter(([, cents]) => cents > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, cents]) => `<li><span>${cat}</span><span>${formatCents(cents)}</span></li>`);
    categoryBreakdownEl.innerHTML = items.join('') || '<li><span>—</span><span>$0.00</span></li>';
  }

  function updateUI() {
    renderExpensesList();
    renderStats();
  }

  // ===== Events =====
  function onFormSubmit(ev) {
    ev.preventDefault();

    // Basic HTML5 validation first
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const amountCents = parseAmountToCents(amountInput.value);
    const category = categorySelect.value;
    const dateStr = dateInput.value;
    const description = (descriptionInput.value || '').trim();

    const today = todayStr();
    if (!amountCents) {
      alert('Please enter a valid positive amount.');
      return;
    }
    if (!CATEGORIES.includes(category)) {
      alert('Please choose a category.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      alert('Please choose a valid date.');
      return;
    }
    if (compareDateStrings(dateStr, today) > 0) {
      alert('Date cannot be in the future.');
      return;
    }

    const newExpense = {
      id: generateId(),
      amountCents,
      category,
      date: dateStr,
      description,
    };

    expenses.push(newExpense);
    saveExpenses(expenses);

    form.reset();
    dateInput.max = todayStr(); // keep fresh

    updateUI();
  }

  function onDeleteClick(ev) {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains('delete-btn')) return;

    const id = target.getAttribute('data-id');
    if (!id) return;

    expenses = expenses.filter((e) => e.id !== id);
    saveExpenses(expenses);
    updateUI();
  }

  function onFiltersChange() {
    filters.category = filterCategorySelect.value || 'all';
    filters.fromDate = filterFromInput.value || '';
    filters.toDate = filterToInput.value || '';

    // Ensure from <= to if both set
    if (filters.fromDate && filters.toDate && compareDateStrings(filters.fromDate, filters.toDate) > 0) {
      // Swap
      const tmp = filters.fromDate;
      filters.fromDate = filters.toDate;
      filters.toDate = tmp;
      filterFromInput.value = filters.fromDate;
      filterToInput.value = filters.toDate;
    }

    updateUI();
  }

  function clearFilters() {
    filterCategorySelect.value = 'all';
    filterFromInput.value = '';
    filterToInput.value = '';
    filters = { category: 'all', fromDate: '', toDate: '' };
    updateUI();
  }

  function exportCsv() {
    const list = getFilteredExpenses();
    const header = ['id', 'date', 'category', 'amount', 'description'];
    const rows = [header];

    for (const e of list) {
      const amountDollars = (e.amountCents / 100).toFixed(2);
      rows.push([
        e.id,
        e.date,
        e.category,
        amountDollars,
        e.description || ''
      ]);
    }

    const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `expenses_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ===== Helpers =====
  function escapeHtml(str) {
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function csvEscape(value) {
    const s = String(value ?? '');
    if (/[",\n]/.test(s)) {
      return '"' + s.replaceAll('"', '""') + '"';
    }
    return s;
  }

  function populateCategorySelects() {
    // Add categories to form select
    categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>' +
      CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');

    // Add categories to filter select (+All)
    filterCategorySelect.innerHTML = '<option value="all">All</option>' +
      CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');
  }

  function init() {
    // Initialize selects and constraints
    populateCategorySelects();
    const maxDate = todayStr();
    dateInput.max = maxDate;
    filterFromInput.max = maxDate;
    filterToInput.max = maxDate;

    // Load state
    expenses = loadExpenses();

    // Events
    form.addEventListener('submit', onFormSubmit);
    tbody.addEventListener('click', onDeleteClick);
    filterCategorySelect.addEventListener('change', onFiltersChange);
    filterFromInput.addEventListener('change', onFiltersChange);
    filterToInput.addEventListener('change', onFiltersChange);
    clearFiltersBtn.addEventListener('click', clearFilters);
    exportCsvBtn.addEventListener('click', exportCsv);

    updateUI();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

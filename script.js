const DEFAULT_STREAMS = ["Shaving", "Power toothbrush", "IPL"];
const DEFAULT_MARKETS = ["DACH", "Benelux", "UK&I", "France"];
const DEFAULT_SUPABASE_URL = "https://llpkkophohaaefznzrij.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscGtrb3Bob2hhYWVmem56cmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjIyMjMsImV4cCI6MjA4NjczODIyM30.F62ObGH2lfSWYP4KbQlaLwzxkmtPN9x70l2WzDkQPGg";

const appState = {
  scopeType: "stream",
  selectedScope: null,
  rows: [],
  kpiActions: [],
  showClosedByKpi: {},
  supabaseUrl: localStorage.getItem("supabase_url") || DEFAULT_SUPABASE_URL,
  supabaseAnonKey: localStorage.getItem("supabase_anon_key") || DEFAULT_SUPABASE_ANON_KEY,
  supabaseClient: null
};

const streamList = document.getElementById("streamList");
const listTitle = document.getElementById("listTitle");
const streamScopeBtn = document.getElementById("streamScopeBtn");
const marketScopeBtn = document.getElementById("marketScopeBtn");
const currentStream = document.getElementById("currentStream");
const currentWeek = document.getElementById("currentWeek");
const emptyState = document.getElementById("emptyState");
const dashboardContent = document.getElementById("dashboardContent");
const kpiContainer = document.getElementById("kpiContainer");
const highlightsList = document.getElementById("highlightsList");
const lowlightsList = document.getElementById("lowlightsList");
const helpList = document.getElementById("helpList");

function sanitize(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const chars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
    return chars[char];
  });
}

function parseWeek(weekLabel) {
  const match = /^(\d{4})\.(\d{2})$/.exec(String(weekLabel || "").trim());
  if (!match) return null;
  return { year: Number(match[1]), week: Number(match[2]), sortKey: Number(match[1]) * 100 + Number(match[2]) };
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  return `${Number(value).toFixed(1)}%`;
}

function getStatusClass(line) {
  if (line.includes("Status: green")) return "green";
  if (line.includes("Status: yellow")) return "yellow";
  if (line.includes("Status: red")) return "red";
  return "";
}

function getStatusLabel(status) {
  if (status === "green") return "Groen";
  if (status === "yellow") return "Oranje";
  if (status === "red") return "Rood";
  return "Onbekend";
}

function getOverallKpiStatus(details) {
  if (Array.isArray(details)) {
    const statuses = details.map(getStatusClass).filter(Boolean);
    if (statuses.includes("red")) return "red";
    if (statuses.includes("yellow")) return "yellow";
    if (statuses.includes("green")) return "green";
    return "neutral";
  }
  const values = details.total || [];
  if (values.some((value) => Number.isFinite(value) && value < 93)) return "red";
  return "green";
}

function renderList(targetElement, items) {
  targetElement.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    targetElement.appendChild(li);
  });
}

function createMatrixTable(weeks, totalValues, rows, options = {}) {
  const {
    firstColumnLabel = "Markt",
    formatValue = (value) => String(value),
    getValueClass = () => "",
    rowNameTotal = "Totaal"
  } = options;

  const table = document.createElement("table");
  table.className = "kpi-matrix-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const firstHead = document.createElement("th");
  firstHead.textContent = firstColumnLabel;
  headRow.appendChild(firstHead);

  weeks.forEach((week) => {
    const th = document.createElement("th");
    th.textContent = week;
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const allRows = [{ name: rowNameTotal, values: totalValues, isTotal: true }, ...rows];
  allRows.forEach((row) => {
    const tr = document.createElement("tr");
    if (row.isTotal) tr.className = "is-total-row";
    const nameCell = document.createElement("th");
    nameCell.scope = "row";
    nameCell.textContent = row.name;
    tr.appendChild(nameCell);

    row.values.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = formatValue(value);
      const valueClass = getValueClass(value);
      if (valueClass) td.classList.add(valueClass);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

function getRowsForSelection() {
  if (!appState.selectedScope) return [];
  return appState.scopeType === "stream"
    ? appState.rows.filter((row) => row.value_stream === appState.selectedScope)
    : appState.rows.filter((row) => row.market === appState.selectedScope);
}

function buildFillrateDetails(rows, scopeType) {
  const breakdownKey = scopeType === "stream" ? "market" : "value_stream";
  const weekMap = new Map();

  rows.forEach((row) => {
    const weekInfo = parseWeek(row.week_label);
    if (!weekInfo) return;
    if (!weekMap.has(row.week_label)) weekMap.set(row.week_label, { label: row.week_label, sortKey: weekInfo.sortKey });
  });

  const orderedWeeks = [...weekMap.values()]
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(-13)
    .map((item) => item.label);

  const totalValues = orderedWeeks.map((weekLabel) => {
    const weekRows = rows.filter((row) => row.week_label === weekLabel);
    const requested = weekRows.reduce((sum, row) => sum + Number(row.requested_quantity || 0), 0);
    const delivered = weekRows.reduce((sum, row) => sum + Number(row.delivered || 0), 0);
    if (requested <= 0) return NaN;
    return (delivered / requested) * 100;
  });

  const breakdownRows = [...new Set(rows.map((row) => row[breakdownKey]))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((itemName) => {
      const values = orderedWeeks.map((weekLabel) => {
        const weekRows = rows.filter((row) => row.week_label === weekLabel && row[breakdownKey] === itemName);
        const requested = weekRows.reduce((sum, row) => sum + Number(row.requested_quantity || 0), 0);
        const delivered = weekRows.reduce((sum, row) => sum + Number(row.delivered || 0), 0);
        if (requested <= 0) return NaN;
        return (delivered / requested) * 100;
      });
      return { name: itemName, values };
    });

  return {
    type: "fillrate",
    weeks: orderedWeeks,
    total: totalValues,
    markets: breakdownRows,
    actions: [
      {
        rootcause: "Vraag/supply mismatch op week met laagste fillrate",
        countermeasure: "Dagelijkse alignment met planning en supply",
        owner: "Supply planner"
      },
      {
        rootcause: "Late shipments op grootste impact segment",
        countermeasure: "Gerichte review op laagste segment en escalation",
        owner: "Logistics lead"
      }
    ]
  };
}

function buildKpiModel(rows, scopeType) {
  const fillrate = buildFillrateDetails(rows, scopeType);
  const latestFillrate = fillrate.total[fillrate.total.length - 1];
  const hasRisk = Number.isFinite(latestFillrate) ? latestFillrate < 93 : true;
  const scopeName = scopeType === "stream" ? "value stream" : "markt";

  return {
    Fillrate: fillrate,
    "Unconstrained demand fulfillment": [
      `Target: 96.0% | Actual: ${hasRisk ? "94.9%" : "96.8%"} | Status: ${hasRisk ? "red" : "green"}`,
      `Trend: ${hasRisk ? "-1.1%" : "+0.6%"} vs vorige week`,
      `Dummydata actief - UNCONSTRAINED nog niet gekoppeld voor ${scopeName}`
    ],
    "USP-CSP": [
      `USP adherence: ${hasRisk ? "93.1%" : "96.2%"} | CSP adherence: ${hasRisk ? "93.8%" : "96.9%"} | Status: ${hasRisk ? "yellow" : "green"}`,
      "Main variance: changeover efficiency op 2 lijnen",
      "Dummydata actief - USP/CSP bronkoppeling volgt"
    ],
    "Safety stock fulfillment": [
      `Policy coverage: ${hasRisk ? "72%" : "84%"} | Status: ${hasRisk ? "yellow" : "green"}`,
      `Critical SKUs below threshold: ${hasRisk ? "11" : "4"}`,
      "Dummydata actief - Safety stock bronkoppeling volgt"
    ],
    UVAP: [
      `UVAP score: ${hasRisk ? "90.6%" : "92.8%"} | Target: 92.0% | Status: ${hasRisk ? "yellow" : "green"}`,
      "Impact: promotion mix en timing verschillen",
      "Dummydata actief - UVAP bronkoppeling volgt"
    ],
    OTTR: [
      `On Time To Request: ${hasRisk ? "93.7%" : "95.6%"} | Target: 95.0% | Status: ${hasRisk ? "red" : "green"}`,
      "Main issue: variatie op outbound handover",
      "Dummydata actief - OTTR bronkoppeling volgt"
    ]
  };
}

function buildContextNotes(rows, scopeType, scopeName) {
  const fillrate = buildFillrateDetails(rows, scopeType);
  const latest = fillrate.total[fillrate.total.length - 1];
  const best = fillrate.markets
    .map((row) => ({ name: row.name, value: row.values[row.values.length - 1] }))
    .filter((row) => Number.isFinite(row.value))
    .sort((a, b) => b.value - a.value)[0];
  const worst = fillrate.markets
    .map((row) => ({ name: row.name, value: row.values[row.values.length - 1] }))
    .filter((row) => Number.isFinite(row.value))
    .sort((a, b) => a.value - b.value)[0];

  return {
    highlights: [
      `${scopeName}: laatste totale fillrate ${formatPercent(latest)}.`,
      best ? `Beste segment deze week: ${best.name} (${formatPercent(best.value)}).` : "Nog geen segmentvergelijking beschikbaar."
    ],
    lowlights: [
      worst ? `Laagste segment deze week: ${worst.name} (${formatPercent(worst.value)}).` : "Nog onvoldoende detaildata.",
      "Overige KPI's wachten nog op aanvullende databronnen."
    ],
    help: [
      "Upload ook Safety Stock / OTTR bronbestanden voor volledig dashboard.",
      "Controleer wekelijks dat het Excel-format exact gelijk blijft."
    ]
  };
}

function renderFillrateContent(contentEl, details, scopeType) {
  const chartWrap = document.createElement("div");
  chartWrap.className = "fillrate-chart";
  const chartTitle = document.createElement("p");
  chartTitle.className = "kpi-section-title";
  chartTitle.textContent = "Totale fillrate - laatste 13 weken";
  chartWrap.appendChild(chartTitle);

  const bars = document.createElement("div");
  bars.className = "fillrate-bars";
  details.total.forEach((value, index) => {
    const barItem = document.createElement("div");
    barItem.className = "fillrate-bar-item";
    const bar = document.createElement("div");
    bar.className = `fillrate-bar ${value >= 93 ? "ok" : "risk"}`;
    bar.style.height = `${Math.max(18, (Number.isFinite(value) ? value : 85) - 85) * 8}px`;
    bar.title = `${details.weeks[index]}: ${formatPercent(value)}`;
    barItem.appendChild(bar);
    const label = document.createElement("span");
    label.className = "fillrate-bar-label";
    label.textContent = details.weeks[index];
    barItem.appendChild(label);
    bars.appendChild(barItem);
  });
  chartWrap.appendChild(bars);

  const tableWrap = document.createElement("div");
  tableWrap.className = "kpi-table-wrap";
  const tableTitle = document.createElement("p");
  tableTitle.className = "kpi-section-title";
  tableTitle.textContent = scopeType === "stream" ? "Fillrate per markt en totaal" : "Fillrate per value stream en totaal";
  tableWrap.appendChild(tableTitle);
  tableWrap.appendChild(
    createMatrixTable(details.weeks, details.total, details.markets, {
      firstColumnLabel: scopeType === "stream" ? "Markt" : "Value stream",
      formatValue: formatPercent,
      getValueClass: (value) => {
        if (!Number.isFinite(value)) return "";
        return value >= 93 ? "value-good" : "value-bad";
      }
    })
  );

  contentEl.appendChild(chartWrap);
  contentEl.appendChild(tableWrap);
}

function getActionToggleKey(valueStream, kpiName) {
  return `${valueStream}__${kpiName}`;
}

function shouldShowClosedActions(valueStream, kpiName) {
  return Boolean(appState.showClosedByKpi[getActionToggleKey(valueStream, kpiName)]);
}

function getActionsFor(valueStream, kpiName, includeClosed = false) {
  return appState.kpiActions
    .filter((row) => row.value_stream === valueStream && row.kpi_name === kpiName)
    .filter((row) => includeClosed || row.status !== "closed")
    .sort((a, b) => a.issue_nr - b.issue_nr);
}

function buildActionRowsForDisplay(valueStream, kpiName) {
  const includeClosed = shouldShowClosedActions(valueStream, kpiName);
  const persisted = getActionsFor(valueStream, kpiName, includeClosed).map((row) => ({
    id: row.id,
    issue_nr: row.issue_nr,
    concern: row.concern || "",
    cause: row.cause || "",
    countermeasure: row.countermeasure || "",
    deadline: row.deadline || "",
    owner: row.owner || "",
    status: row.status || "open"
  }));

  const rows = [...persisted];
  let nextNr = rows.length ? Math.max(...rows.map((row) => Number(row.issue_nr) || 0)) + 1 : 1;
  while (rows.filter((row) => row.status !== "closed").length < 3) {
    rows.push({
      id: null,
      issue_nr: nextNr++,
      concern: "",
      cause: "",
      countermeasure: "",
      deadline: "",
      owner: "",
      status: "open"
    });
  }
  return rows;
}

async function saveActionRow(valueStream, kpiName, rowEl) {
  if (!connectSupabase()) {
    alert("Geen Supabase koppeling gevonden. Stel deze eerst in op /upload.");
    return false;
  }

  const issueNr = Number(rowEl.dataset.issueNr);
  const id = rowEl.dataset.id ? Number(rowEl.dataset.id) : null;
  const payload = {
    value_stream: valueStream,
    kpi_name: kpiName,
    issue_nr: issueNr,
    concern: rowEl.querySelector('[data-field="concern"]').value.trim(),
    cause: rowEl.querySelector('[data-field="cause"]').value.trim(),
    countermeasure: rowEl.querySelector('[data-field="countermeasure"]').value.trim(),
    deadline: rowEl.querySelector('[data-field="deadline"]').value || null,
    owner: rowEl.querySelector('[data-field="owner"]').value.trim(),
    status: "open"
  };

  const { data, error } = await appState.supabaseClient
    .from("kpi_actions")
    .upsert(payload, { onConflict: "value_stream,kpi_name,issue_nr" })
    .select()
    .single();

  if (error) {
    alert(`Opslaan mislukt: ${error.message}`);
    return false;
  }

  if (id) {
    appState.kpiActions = appState.kpiActions.map((row) => (row.id === id ? data : row));
  } else {
    appState.kpiActions = appState.kpiActions.filter(
      (row) => !(row.value_stream === data.value_stream && row.kpi_name === data.kpi_name && row.issue_nr === data.issue_nr)
    );
    appState.kpiActions.push(data);
  }

  return true;
}

async function closeActionRow(valueStream, kpiName, rowEl) {
  if (!connectSupabase()) {
    alert("Geen Supabase koppeling gevonden. Stel deze eerst in op /upload.");
    return;
  }

  const id = rowEl.dataset.id ? Number(rowEl.dataset.id) : null;
  if (id) {
    const { error } = await appState.supabaseClient
      .from("kpi_actions")
      .update({ status: "closed" })
      .eq("id", id);
    if (error) {
      alert(`Afsluiten mislukt: ${error.message}`);
      return;
    }
    appState.kpiActions = appState.kpiActions.filter((row) => row.id !== id);
  }

  rerenderCurrentSelection();
}

function createActionRowElement(valueStream, kpiName, row, tbody) {
  const tr = document.createElement("tr");
  tr.dataset.id = row.id || "";
  tr.dataset.issueNr = row.issue_nr;
  tr.dataset.editing = "false";
  if (row.status === "closed") tr.classList.add("action-row-closed");

  const nrCell = document.createElement("td");
  nrCell.textContent = String(row.issue_nr);
  tr.appendChild(nrCell);

  [
    ["concern", row.concern],
    ["cause", row.cause],
    ["countermeasure", row.countermeasure],
    ["deadline", row.deadline],
    ["owner", row.owner]
  ].forEach(([field, value]) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = field === "deadline" ? "date" : "text";
    input.value = value || "";
    input.setAttribute("data-field", field);
    input.className = "kpi-input";
    input.disabled = true;
    td.appendChild(input);
    tr.appendChild(td);
  });

  const actionsCell = document.createElement("td");
  actionsCell.className = "kpi-row-actions";

  if (row.status !== "closed") {
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-btn";
    editBtn.textContent = "✎";
    editBtn.title = "Edit";
    editBtn.setAttribute("aria-label", "Edit");
    editBtn.addEventListener("click", () => {
      tr.dataset.editing = "true";
      tr.querySelectorAll(".kpi-input").forEach((input) => {
        input.disabled = false;
      });
      tr.classList.add("is-editing");
      saveBtn.disabled = false;
    });
    actionsCell.appendChild(editBtn);

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "icon-btn";
    saveBtn.textContent = "✓";
    saveBtn.title = "Opslaan";
    saveBtn.setAttribute("aria-label", "Opslaan");
    saveBtn.disabled = true;
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      const saved = await saveActionRow(valueStream, kpiName, tr);
      if (!saved) {
        saveBtn.disabled = false;
        return;
      }
      tr.dataset.editing = "false";
      tr.querySelectorAll(".kpi-input").forEach((input) => {
        input.disabled = true;
      });
      tr.classList.remove("is-editing");
      rerenderCurrentSelection();
    });
    actionsCell.appendChild(saveBtn);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "icon-btn danger";
    closeBtn.textContent = "●";
    closeBtn.title = "Closed";
    closeBtn.setAttribute("aria-label", "Closed");
    closeBtn.addEventListener("click", () => closeActionRow(valueStream, kpiName, tr));
    actionsCell.appendChild(closeBtn);
  } else {
    const closedBadge = document.createElement("span");
    closedBadge.className = "closed-badge";
    closedBadge.textContent = "Closed";
    actionsCell.appendChild(closedBadge);
  }
  tr.appendChild(actionsCell);

  tbody.appendChild(tr);
}

function renderActionTable(contentEl, valueStream, kpiName) {
  const section = document.createElement("div");
  section.className = "kpi-table-wrap";

  const sectionTitle = document.createElement("p");
  sectionTitle.className = "kpi-section-title";
  sectionTitle.textContent = "Action log";
  section.appendChild(sectionTitle);

  const table = document.createElement("table");
  table.className = "kpi-action-table action-log-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Nr</th>
        <th>Concern</th>
        <th>Cause</th>
        <th>Countermeasure</th>
        <th>Deadline</th>
        <th>Owner</th>
        <th>Actie</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  const rows = buildActionRowsForDisplay(valueStream, kpiName);
  rows.forEach((row) => createActionRowElement(valueStream, kpiName, row, tbody));
  section.appendChild(table);

  const controls = document.createElement("div");
  controls.className = "action-table-controls";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "ghost-btn add-row-btn";
  addBtn.textContent = "Add";
  addBtn.addEventListener("click", () => {
    const existingNrs = [...tbody.querySelectorAll("tr")].map((tr) => Number(tr.dataset.issueNr) || 0);
    const nextNr = existingNrs.length ? Math.max(...existingNrs) + 1 : 1;
    createActionRowElement(valueStream, kpiName, {
      id: null,
      issue_nr: nextNr,
      concern: "",
      cause: "",
      countermeasure: "",
      deadline: "",
      owner: "",
      status: "open"
    }, tbody);
  });
  controls.appendChild(addBtn);

  const toggleClosedBtn = document.createElement("button");
  toggleClosedBtn.type = "button";
  toggleClosedBtn.className = "ghost-btn add-row-btn";
  toggleClosedBtn.textContent = shouldShowClosedActions(valueStream, kpiName) ? "Hide closed" : "Show closed";
  toggleClosedBtn.addEventListener("click", () => {
    const key = getActionToggleKey(valueStream, kpiName);
    appState.showClosedByKpi[key] = !shouldShowClosedActions(valueStream, kpiName);
    rerenderCurrentSelection();
  });
  controls.appendChild(toggleClosedBtn);

  section.appendChild(controls);

  contentEl.appendChild(section);
}

function renderKpis(scopeType, scopeName, rows) {
  const kpiData = buildKpiModel(rows, scopeType);
  kpiContainer.innerHTML = "";

  Object.entries(kpiData).forEach(([groupName, details]) => {
    const detailsEl = document.createElement("details");
    detailsEl.className = "kpi-group";
    const overallStatus = getOverallKpiStatus(details);

    const summaryEl = document.createElement("summary");
    summaryEl.innerHTML = `
      <span class="kpi-title">${sanitize(groupName)}</span>
      <span class="kpi-summary-meta">
        <span class="kpi-status-pill ${overallStatus}">
          <span class="kpi-status-dot"></span>
          ${getStatusLabel(overallStatus)}
        </span>
        <span class="kpi-summary-action">Details</span>
      </span>
    `;
    detailsEl.appendChild(summaryEl);

    const contentEl = document.createElement("div");
    contentEl.className = "kpi-content";

    if (Array.isArray(details)) {
      const listEl = document.createElement("ul");
      listEl.className = "kpi-list";
      details.forEach((line) => {
        const li = document.createElement("li");
        const statusClass = getStatusClass(line);
        if (statusClass) {
          li.innerHTML = line.replace(
            `Status: ${statusClass}`,
            `<span class="status ${statusClass}">Status: ${statusClass}</span>`
          );
        } else {
          li.textContent = line;
        }
        listEl.appendChild(li);
      });
      contentEl.appendChild(listEl);
    } else if (details.type === "fillrate") {
      renderFillrateContent(contentEl, details, scopeType);
    }

    if (scopeType === "stream" && appState.selectedScope) {
      renderActionTable(contentEl, appState.selectedScope, groupName);
    }

    detailsEl.appendChild(contentEl);
    kpiContainer.appendChild(detailsEl);
  });

  const context = buildContextNotes(rows, scopeType, scopeName);
  renderList(highlightsList, context.highlights);
  renderList(lowlightsList, context.lowlights);
  renderList(helpList, context.help);
}

function rerenderCurrentSelection() {
  if (!appState.selectedScope) return;
  const rows = getRowsForSelection();
  updateHeader(rows);
  renderKpis(appState.scopeType, appState.selectedScope, rows);
}

function getScopeItems() {
  if (appState.scopeType === "stream") {
    const dynamic = [...new Set(appState.rows.map((row) => row.value_stream))].filter(Boolean);
    return dynamic.length ? dynamic.sort((a, b) => a.localeCompare(b)) : DEFAULT_STREAMS;
  }
  const dynamic = [...new Set(appState.rows.map((row) => row.market))].filter(Boolean);
  return dynamic.length ? dynamic.sort((a, b) => a.localeCompare(b)) : DEFAULT_MARKETS;
}

function updateHeader(rows) {
  const prefix = appState.scopeType === "stream" ? "Value stream" : "Markt";
  currentStream.textContent = `${prefix}: ${appState.selectedScope || "-"}`;
  const latestWeek = rows.map((row) => parseWeek(row.week_label)).filter(Boolean).sort((a, b) => b.sortKey - a.sortKey)[0];
  currentWeek.textContent = `Update: ${latestWeek ? `${latestWeek.year}.${String(latestWeek.week).padStart(2, "0")}` : "-"}`;
}

function selectScope(scopeName, buttonEl) {
  appState.selectedScope = scopeName;
  document.querySelectorAll(".stream-btn").forEach((btn) => btn.classList.remove("active"));
  buttonEl.classList.add("active");
  const rows = getRowsForSelection();
  updateHeader(rows);
  emptyState.classList.add("hidden");
  dashboardContent.classList.remove("hidden");
  renderKpis(appState.scopeType, scopeName, rows);
}

function renderScopeList() {
  streamList.innerHTML = "";
  listTitle.textContent = appState.scopeType === "stream" ? "Value streams" : "Markten";
  const items = getScopeItems();

  if (!items.length) {
    emptyState.classList.remove("hidden");
    dashboardContent.classList.add("hidden");
    return;
  }

  if (!appState.selectedScope || !items.includes(appState.selectedScope)) appState.selectedScope = items[0];

  items.forEach((name) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "stream-btn";
    btn.type = "button";
    btn.textContent = name;
    if (name === appState.selectedScope) btn.classList.add("active");
    btn.addEventListener("click", () => selectScope(name, btn));
    li.appendChild(btn);
    streamList.appendChild(li);
  });

  const selectedButton = streamList.querySelector(".stream-btn.active");
  if (selectedButton) selectScope(appState.selectedScope, selectedButton);
}

function setScopeType(scopeType) {
  appState.scopeType = scopeType;
  streamScopeBtn.classList.toggle("active", scopeType === "stream");
  marketScopeBtn.classList.toggle("active", scopeType === "market");
  appState.selectedScope = null;
  renderScopeList();
}

function connectSupabase() {
  if (!appState.supabaseUrl || !appState.supabaseAnonKey || !window.supabase?.createClient) {
    appState.supabaseClient = null;
    return false;
  }
  appState.supabaseClient = window.supabase.createClient(appState.supabaseUrl, appState.supabaseAnonKey);
  return true;
}

async function loadFillrateRows() {
  if (!connectSupabase()) {
    appState.rows = [];
    renderScopeList();
    return;
  }
  const { data, error } = await appState.supabaseClient
    .from("fillrate_rows")
    .select("*")
    .order("week_label", { ascending: true })
    .limit(50000);

  if (error) {
    console.error(error);
    emptyState.textContent = `Kon Supabase data niet laden: ${error.message}`;
    emptyState.classList.remove("hidden");
    dashboardContent.classList.add("hidden");
    return;
  }

  appState.rows = data || [];
  renderScopeList();
}

async function loadKpiActions() {
  if (!connectSupabase()) {
    appState.kpiActions = [];
    return;
  }

  const { data, error } = await appState.supabaseClient
    .from("kpi_actions")
    .select("*")
    .limit(50000);

  if (error) {
    console.error(error);
    alert(`Supabase fout bij laden acties: ${error.message}`);
    return;
  }

  appState.kpiActions = data || [];
}

function setupScopeButtons() {
  streamScopeBtn.addEventListener("click", () => setScopeType("stream"));
  marketScopeBtn.addEventListener("click", () => setScopeType("market"));
}

async function init() {
  setupScopeButtons();
  renderScopeList();
  if (!appState.supabaseUrl || !appState.supabaseAnonKey) {
    emptyState.textContent = "Nog geen database gekoppeld. Ga naar 'Naar data upload' om SUPABASE_URL en SUPABASE_ANON_KEY in te vullen.";
    return;
  }
  await loadKpiActions();
  await loadFillrateRows();
}

init();

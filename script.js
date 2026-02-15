const DEFAULT_STREAMS = ["Shaving", "Power toothbrush", "IPL"];
const DEFAULT_MARKETS = ["DACH", "Benelux", "UK&I", "France"];
const KPI_GROUPS = [
  "Fillrate",
  "Unconstrained demand fulfillment",
  "USP-CSP",
  "Safety stock fulfillment",
  "UVAP",
  "OTTR"
];

const REQUIRED_COLUMNS = [
  "Value stream",
  "Markt",
  "Week",
  "PAG",
  "MAG",
  "AG",
  "Project",
  "Requested quantity",
  "Delivered"
];

const appState = {
  scopeType: "stream",
  selectedScope: null,
  rows: [],
  parsedRows: [],
  parseErrors: [],
  supabaseUrl: localStorage.getItem("supabase_url") || "",
  supabaseAnonKey: localStorage.getItem("supabase_anon_key") || "",
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

const uploadModal = document.getElementById("uploadModal");
const openUploadBtn = document.getElementById("openUploadBtn");
const closeUploadBtn = document.getElementById("closeUploadBtn");
const stepBadge = document.getElementById("stepBadge");
const uploadStep1 = document.getElementById("uploadStep1");
const uploadStep2 = document.getElementById("uploadStep2");
const uploadStep3 = document.getElementById("uploadStep3");
const supabaseUrlInput = document.getElementById("supabaseUrlInput");
const supabaseAnonKeyInput = document.getElementById("supabaseAnonKeyInput");
const saveSupabaseBtn = document.getElementById("saveSupabaseBtn");
const excelInput = document.getElementById("excelInput");
const validationSummary = document.getElementById("validationSummary");
const previewContainer = document.getElementById("previewContainer");
const toStep3Btn = document.getElementById("toStep3Btn");
const backToStep1Btn = document.getElementById("backToStep1Btn");
const backToStep2Btn = document.getElementById("backToStep2Btn");
const uploadToDbBtn = document.getElementById("uploadToDbBtn");
const uploadReadyText = document.getElementById("uploadReadyText");
const uploadResult = document.getElementById("uploadResult");

function sanitize(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const chars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
    return chars[char];
  });
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function parseWeek(weekLabel) {
  const match = /^(\d{4})\.(\d{2})$/.exec(String(weekLabel || "").trim());
  if (!match) return null;
  return {
    year: Number(match[1]),
    week: Number(match[2]),
    sortKey: Number(match[1]) * 100 + Number(match[2])
  };
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

function getOverallKpiStatus(details) {
  if (Array.isArray(details)) {
    const statuses = details.map(getStatusClass).filter(Boolean);
    if (statuses.includes("red")) return "red";
    if (statuses.includes("yellow")) return "yellow";
    if (statuses.includes("green")) return "green";
    return "neutral";
  }

  if (details.type === "fillrate") {
    const values = details.total || [];
    if (values.some((value) => Number.isFinite(value) && value < 93)) return "red";
    return "green";
  }

  return "neutral";
}

function getStatusLabel(status) {
  if (status === "green") return "Groen";
  if (status === "yellow") return "Oranje";
  if (status === "red") return "Rood";
  return "Onbekend";
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
  if (appState.scopeType === "stream") {
    return appState.rows.filter((row) => row.value_stream === appState.selectedScope);
  }
  return appState.rows.filter((row) => row.market === appState.selectedScope);
}

function buildFillrateDetails(rows, scopeType) {
  const breakdownKey = scopeType === "stream" ? "market" : "value_stream";
  const weekMap = new Map();

  rows.forEach((row) => {
    const weekInfo = parseWeek(row.week_label);
    if (!weekInfo) return;
    if (!weekMap.has(row.week_label)) {
      weekMap.set(row.week_label, { label: row.week_label, sortKey: weekInfo.sortKey });
    }
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

  const breakdownItems = [...new Set(rows.map((row) => row[breakdownKey]))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const breakdownRows = breakdownItems.map((itemName) => {
    const values = orderedWeeks.map((weekLabel) => {
      const weekRows = rows.filter((row) => row.week_label === weekLabel && row[breakdownKey] === itemName);
      const requested = weekRows.reduce((sum, row) => sum + Number(row.requested_quantity || 0), 0);
      const delivered = weekRows.reduce((sum, row) => sum + Number(row.delivered || 0), 0);
      if (requested <= 0) return NaN;
      return (delivered / requested) * 100;
    });
    return { name: itemName, values };
  });

  const lowestPoint = breakdownRows
    .map((row) => ({ name: row.name, min: Math.min(...row.values.filter(Number.isFinite)) }))
    .filter((item) => Number.isFinite(item.min))
    .sort((a, b) => a.min - b.min)[0];

  const actionRows = [
    {
      rootcause: "Vraag/supply mismatch op week met laagste fillrate",
      countermeasure: "Dagelijkse alignment met planning en supply",
      owner: "Supply planner"
    },
    {
      rootcause: "Late shipments op grootste impact segment",
      countermeasure: `Gerichte review voor ${lowestPoint?.name || "laagste segment"} en escalatie met logistics`,
      owner: "Logistics lead"
    }
  ];

  return {
    type: "fillrate",
    weeks: orderedWeeks,
    total: totalValues,
    markets: breakdownRows,
    actions: actionRows
  };
}

function buildKpiModel(rows, scopeType) {
  const fillrate = buildFillrateDetails(rows, scopeType);
  const scopeName = scopeType === "stream" ? "value stream" : "markt";
  return {
    Fillrate: fillrate,
    "Unconstrained demand fulfillment": [
      `Data status: gevuld via Fillrate bron voor ${scopeName}.`,
      "Volledige UNCONSTRAINED berekening volgt na extra datastromen."
    ],
    "USP-CSP": [
      "Nog niet gekoppeld: upload van USP/CSP brondata nodig.",
      "Dashboardstructuur staat klaar voor koppeling."
    ],
    "Safety stock fulfillment": [
      "Nog niet gekoppeld: upload van safety stock brondata nodig.",
      "Toekomstige % en DFS tabellen blijven ondersteund in deze layout."
    ],
    UVAP: [
      "Nog niet gekoppeld: UVAP brondata nodig.",
      "KPI placeholder blijft zichtbaar voor dashboardvolledigheid."
    ],
    OTTR: [
      "Nog niet gekoppeld: OTTR brondata nodig.",
      "Structuur gereed voor volgende data-upload."
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
  tableTitle.textContent = scopeType === "stream"
    ? "Fillrate per markt en totaal"
    : "Fillrate per value stream en totaal";
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

  const actionWrap = document.createElement("div");
  actionWrap.className = "kpi-table-wrap";
  const actionTitle = document.createElement("p");
  actionTitle.className = "kpi-section-title";
  actionTitle.textContent = "Rootcause, countermeasure en owner";
  actionWrap.appendChild(actionTitle);

  const actionTable = document.createElement("table");
  actionTable.className = "kpi-action-table";
  actionTable.innerHTML = `
    <thead>
      <tr>
        <th>Rootcause</th>
        <th>Countermeasure</th>
        <th>Owner</th>
      </tr>
    </thead>
    <tbody>
      ${details.actions
        .map(
          (item) => `
            <tr>
              <td>${sanitize(item.rootcause)}</td>
              <td>${sanitize(item.countermeasure)}</td>
              <td>${sanitize(item.owner)}</td>
            </tr>
          `
        )
        .join("")}
    </tbody>
  `;
  actionWrap.appendChild(actionTable);

  contentEl.appendChild(chartWrap);
  contentEl.appendChild(tableWrap);
  contentEl.appendChild(actionWrap);
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

    detailsEl.appendChild(contentEl);
    kpiContainer.appendChild(detailsEl);
  });

  const context = buildContextNotes(rows, scopeType, scopeName);
  renderList(highlightsList, context.highlights);
  renderList(lowlightsList, context.lowlights);
  renderList(helpList, context.help);
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

  const latestWeek = rows
    .map((row) => parseWeek(row.week_label))
    .filter(Boolean)
    .sort((a, b) => b.sortKey - a.sortKey)[0];
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

  if (!appState.selectedScope || !items.includes(appState.selectedScope)) {
    appState.selectedScope = items[0];
  }

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
  if (selectedButton) {
    selectScope(appState.selectedScope, selectedButton);
  }
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
    alert(`Supabase fout bij laden: ${error.message}`);
    return;
  }

  appState.rows = data || [];
  renderScopeList();
}

function goToUploadStep(step) {
  uploadStep1.classList.toggle("hidden", step !== 1);
  uploadStep2.classList.toggle("hidden", step !== 2);
  uploadStep3.classList.toggle("hidden", step !== 3);
  stepBadge.textContent = `Stap ${step} van 3`;
}

function openUploadModal() {
  supabaseUrlInput.value = appState.supabaseUrl;
  supabaseAnonKeyInput.value = appState.supabaseAnonKey;
  uploadResult.textContent = "";
  validationSummary.textContent = "";
  previewContainer.innerHTML = "";
  toStep3Btn.disabled = true;
  uploadReadyText.textContent = "Controle afgerond. Klaar om te uploaden naar Supabase.";
  uploadModal.classList.remove("hidden");
  goToUploadStep(1);
}

function parseExcelRows(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: "" });
        resolve(rawRows);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function mapAndValidateRows(rawRows) {
  const mappedRows = [];
  const errors = [];
  const previewRows = [];

  rawRows.forEach((row, index) => {
    const normalized = {};
    Object.keys(row).forEach((key) => {
      normalized[normalizeHeader(key)] = row[key];
    });

    const missingColumns = REQUIRED_COLUMNS.filter(
      (column) => !(normalizeHeader(column) in normalized)
    );
    if (missingColumns.length) {
      errors.push(`Kolommen ontbreken in Excel: ${missingColumns.join(", ")}`);
      return;
    }

    const weekLabel = String(normalized[normalizeHeader("Week")]).trim();
    if (!parseWeek(weekLabel)) {
      errors.push(`Rij ${index + 2}: ongeldig weekformaat "${weekLabel}" (verwacht YYYY.WW, bv 2026.06)`);
      return;
    }

    const requested = Number(normalized[normalizeHeader("Requested quantity")]);
    const delivered = Number(normalized[normalizeHeader("Delivered")]);
    if (!Number.isFinite(requested) || requested <= 0) {
      errors.push(`Rij ${index + 2}: Requested quantity moet > 0 zijn`);
      return;
    }
    if (!Number.isFinite(delivered) || delivered < 0) {
      errors.push(`Rij ${index + 2}: Delivered moet >= 0 zijn`);
      return;
    }

    const mapped = {
      value_stream: String(normalized[normalizeHeader("Value stream")]).trim(),
      market: String(normalized[normalizeHeader("Markt")]).trim(),
      week_label: weekLabel,
      pag: String(normalized[normalizeHeader("PAG")]).trim(),
      mag: String(normalized[normalizeHeader("MAG")]).trim(),
      ag: String(normalized[normalizeHeader("AG")]).trim(),
      project: String(normalized[normalizeHeader("Project")]).trim(),
      requested_quantity: requested,
      delivered
    };

    if (!mapped.value_stream || !mapped.market || !mapped.project) {
      errors.push(`Rij ${index + 2}: verplichte tekstvelden ontbreken`);
      return;
    }

    mappedRows.push(mapped);
    if (previewRows.length < 8) previewRows.push(mapped);
  });

  return { mappedRows, errors, previewRows };
}

function renderPreviewRows(rows) {
  if (!rows.length) {
    previewContainer.innerHTML = "";
    return;
  }

  previewContainer.innerHTML = `
    <table class="kpi-matrix-table">
      <thead>
        <tr>
          <th>Value stream</th>
          <th>Markt</th>
          <th>Week</th>
          <th>Project</th>
          <th>Requested</th>
          <th>Delivered</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${sanitize(row.value_stream)}</td>
                <td>${sanitize(row.market)}</td>
                <td>${sanitize(row.week_label)}</td>
                <td>${sanitize(row.project)}</td>
                <td>${sanitize(row.requested_quantity)}</td>
                <td>${sanitize(row.delivered)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function uploadRowsToSupabase(rows) {
  if (!connectSupabase()) throw new Error("Supabase configuratie ontbreekt.");
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await appState.supabaseClient
      .from("fillrate_rows")
      .upsert(chunk, {
        onConflict: "value_stream,market,week_label,pag,mag,ag,project"
      });
    if (error) throw error;
  }
}

function setupUploadFlow() {
  openUploadBtn.addEventListener("click", openUploadModal);
  closeUploadBtn.addEventListener("click", () => uploadModal.classList.add("hidden"));

  saveSupabaseBtn.addEventListener("click", async () => {
    appState.supabaseUrl = supabaseUrlInput.value.trim();
    appState.supabaseAnonKey = supabaseAnonKeyInput.value.trim();
    localStorage.setItem("supabase_url", appState.supabaseUrl);
    localStorage.setItem("supabase_anon_key", appState.supabaseAnonKey);
    goToUploadStep(2);
    await loadFillrateRows();
  });

  excelInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rawRows = await parseExcelRows(file);
      const { mappedRows, errors, previewRows } = mapAndValidateRows(rawRows);
      appState.parsedRows = mappedRows;
      appState.parseErrors = errors;

      if (errors.length) {
        validationSummary.textContent = `Validatiefouten (${errors.length}): ${errors.slice(0, 4).join(" | ")}`;
        validationSummary.className = "validation-summary error";
        toStep3Btn.disabled = true;
      } else {
        validationSummary.textContent = `Validatie succesvol: ${mappedRows.length} regels klaar voor upload.`;
        validationSummary.className = "validation-summary success";
        toStep3Btn.disabled = mappedRows.length === 0;
      }

      renderPreviewRows(previewRows);
      uploadReadyText.textContent = `${mappedRows.length} regels klaar voor upload naar Supabase.`;
      uploadResult.textContent = "";
    } catch (error) {
      validationSummary.textContent = `Kon Excel niet verwerken: ${error.message}`;
      validationSummary.className = "validation-summary error";
      toStep3Btn.disabled = true;
    }
  });

  backToStep1Btn.addEventListener("click", () => goToUploadStep(1));
  toStep3Btn.addEventListener("click", () => goToUploadStep(3));
  backToStep2Btn.addEventListener("click", () => goToUploadStep(2));

  uploadToDbBtn.addEventListener("click", async () => {
    if (!appState.parsedRows.length) return;
    uploadToDbBtn.disabled = true;
    uploadResult.textContent = "Upload bezig...";
    uploadResult.className = "upload-result";

    try {
      await uploadRowsToSupabase(appState.parsedRows);
      await loadFillrateRows();
      uploadResult.textContent = `Upload succesvol: ${appState.parsedRows.length} regels verwerkt.`;
      uploadResult.className = "upload-result success";
    } catch (error) {
      uploadResult.textContent = `Upload mislukt: ${error.message}`;
      uploadResult.className = "upload-result error";
    } finally {
      uploadToDbBtn.disabled = false;
    }
  });
}

function setupScopeButtons() {
  streamScopeBtn.addEventListener("click", () => setScopeType("stream"));
  marketScopeBtn.addEventListener("click", () => setScopeType("market"));
}

async function init() {
  setupScopeButtons();
  setupUploadFlow();
  renderScopeList();
  if (appState.supabaseUrl && appState.supabaseAnonKey) {
    await loadFillrateRows();
  }
}

init();

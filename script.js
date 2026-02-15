const HISTORY_WEEKS = [
  "W46", "W47", "W48", "W49", "W50", "W51", "W52",
  "W01", "W02", "W03", "W04", "W05", "W06"
];

const FUTURE_WEEKS = [
  "W07", "W08", "W09", "W10", "W11", "W12", "W13",
  "W14", "W15", "W16", "W17", "W18", "W19"
];

function marketValues(name, values) {
  return { name, values };
}

const dashboardData = {
  Shaving: {
    week: "Week 6 - 2026",
    kpis: {
      Fillrate: {
        type: "fillrate",
        weeks: HISTORY_WEEKS,
        total: [95.2, 94.8, 93.9, 92.7, 92.4, 93.3, 94.1, 92.8, 91.9, 92.5, 93.6, 94.2, 92.6],
        markets: [
          marketValues("DACH", [94.9, 94.3, 93.5, 91.8, 91.4, 92.7, 93.8, 92.1, 91.2, 91.8, 92.9, 93.4, 91.7]),
          marketValues("Benelux", [95.5, 95.0, 94.1, 93.6, 93.1, 93.8, 94.6, 93.1, 92.4, 93.0, 94.0, 94.6, 93.0]),
          marketValues("UK&I", [95.0, 94.5, 93.8, 92.9, 92.1, 93.0, 93.9, 92.4, 91.7, 92.2, 93.2, 93.9, 92.3]),
          marketValues("France", [95.4, 95.2, 94.4, 93.3, 92.8, 93.5, 94.5, 93.2, 92.1, 92.8, 93.8, 94.3, 92.9])
        ],
        actions: [
          {
            rootcause: "Late inbound motor components",
            countermeasure: "Extra supplier-call offs en weekly expediting",
            owner: "Sourcing Lead"
          },
          {
            rootcause: "Changeover losses op SHV-2",
            countermeasure: "SMED blitz en freeze op variant swaps",
            owner: "Production Manager"
          },
          {
            rootcause: "Forecast bias DACH promo",
            countermeasure: "Demand review met sales en planner lock",
            owner: "Demand Planning Lead"
          }
        ]
      },
      "Unconstrained demand fulfillment": [
        "Target: 96.5% | Actual: 95.8% | Status: yellow",
        "Backlog trend: -4.1% vs vorige week",
        "Constraint removed on line SHV-2"
      ],
      "USP-CSP": [
        "USP adherence: 93.9% | CSP adherence: 95.1% | Status: yellow",
        "Main deviation: packaging changeover loss",
        "Recovery plan active for next 2 werkdagen"
      ],
      "Safety stock fulfillment": {
        type: "safety_stock",
        weeks: FUTURE_WEEKS,
        percentage: {
          total: [69, 71, 73, 74, 76, 78, 79, 81, 82, 84, 85, 86, 87],
          markets: [
            marketValues("DACH", [65, 67, 69, 70, 72, 74, 75, 77, 78, 80, 81, 82, 83]),
            marketValues("Benelux", [72, 73, 74, 75, 77, 78, 79, 81, 82, 83, 84, 85, 86]),
            marketValues("UK&I", [68, 69, 71, 72, 74, 76, 77, 79, 80, 81, 82, 83, 84]),
            marketValues("France", [70, 71, 72, 73, 75, 77, 78, 80, 81, 82, 83, 84, 85])
          ]
        },
        dfs: {
          total: [26, 27, 28, 29, 30, 30, 31, 32, 33, 34, 35, 35, 36],
          markets: [
            marketValues("DACH", [22, 23, 24, 25, 26, 26, 27, 28, 29, 30, 30, 31, 32]),
            marketValues("Benelux", [28, 28, 29, 30, 30, 31, 32, 33, 33, 34, 35, 35, 36]),
            marketValues("UK&I", [24, 25, 26, 27, 28, 29, 29, 30, 31, 32, 33, 33, 34]),
            marketValues("France", [25, 26, 27, 28, 29, 29, 30, 31, 32, 33, 33, 34, 35])
          ]
        }
      },
      UVAP: [
        "UVAP score: 91.4% | Target: 92.0% | Status: yellow",
        "Main impact: promotional mix variance",
        "Forecast correction in S&OP cycle"
      ],
      OTTR: [
        "On Time To Request: 94.5% | Target: 95.0% | Status: yellow",
        "Transit delays from 3PL in UK",
        "Action: alternate lane trial gestart"
      ]
    },
    highlights: [
      "Backlog reduction op premium series.",
      "Line SHV-2 output +6% vs vorige week."
    ],
    lowlights: [
      "Safety stock onder norm voor blades.",
      "Lagere fillrate in DACH."
    ],
    help: [
      "Besluit nodig over extra air freight budget.",
      "Ondersteuning bij vendor escalation voor motor assemblies."
    ]
  },
  "Power toothbrush": {
    week: "Week 6 - 2026",
    kpis: {
      Fillrate: {
        type: "fillrate",
        weeks: HISTORY_WEEKS,
        total: [94.0, 94.3, 94.7, 94.9, 95.1, 95.0, 95.3, 95.6, 95.2, 94.8, 95.4, 95.7, 95.1],
        markets: [
          marketValues("DACH", [93.5, 93.8, 94.2, 94.6, 94.8, 94.6, 95.0, 95.3, 94.9, 94.5, 95.1, 95.5, 94.8]),
          marketValues("Benelux", [94.4, 94.7, 95.0, 95.1, 95.4, 95.3, 95.6, 95.8, 95.5, 95.0, 95.7, 96.0, 95.4]),
          marketValues("UK&I", [93.8, 94.0, 94.4, 94.6, 94.9, 94.8, 95.1, 95.5, 95.0, 94.6, 95.3, 95.6, 95.0]),
          marketValues("France", [94.2, 94.5, 94.9, 95.0, 95.2, 95.1, 95.4, 95.7, 95.4, 95.0, 95.6, 95.9, 95.3])
        ],
        actions: [
          {
            rootcause: "Incidentele vertraging spare heads",
            countermeasure: "Safety batch op reserve-assemblage gepland",
            owner: "Planning Lead"
          },
          {
            rootcause: "Carrier variability UK",
            countermeasure: "Slot shift naar performance carrier",
            owner: "Logistics Manager"
          }
        ]
      },
      "Unconstrained demand fulfillment": [
        "Target: 97.0% | Actual: 96.6% | Status: yellow",
        "Holiday uplift veroorzaakt korte dip",
        "Recovery expected binnen 1 week"
      ],
      "USP-CSP": [
        "USP adherence: 96.8% | CSP adherence: 97.2% | Status: green",
        "Stable planning discipline op alle lijnen",
        "Minor exception in spare heads"
      ],
      "Safety stock fulfillment": {
        type: "safety_stock",
        weeks: FUTURE_WEEKS,
        percentage: {
          total: [82, 83, 84, 84, 85, 86, 86, 87, 88, 88, 89, 90, 90],
          markets: [
            marketValues("DACH", [79, 80, 81, 82, 83, 84, 84, 85, 86, 86, 87, 88, 88]),
            marketValues("Benelux", [84, 85, 85, 86, 86, 87, 88, 88, 89, 89, 90, 91, 91]),
            marketValues("UK&I", [80, 81, 82, 83, 83, 84, 85, 85, 86, 87, 87, 88, 89]),
            marketValues("France", [82, 83, 84, 84, 85, 86, 86, 87, 88, 88, 89, 90, 90])
          ]
        },
        dfs: {
          total: [34, 34, 35, 35, 36, 36, 37, 37, 38, 38, 39, 39, 40],
          markets: [
            marketValues("DACH", [31, 31, 32, 33, 33, 34, 34, 35, 35, 36, 36, 37, 37]),
            marketValues("Benelux", [36, 36, 37, 37, 38, 38, 39, 39, 40, 40, 41, 41, 42]),
            marketValues("UK&I", [32, 33, 33, 34, 34, 35, 35, 36, 36, 37, 37, 38, 39]),
            marketValues("France", [33, 34, 34, 35, 35, 36, 36, 37, 37, 38, 38, 39, 39])
          ]
        }
      },
      UVAP: [
        "UVAP score: 92.7% | Target: 92.0% | Status: green",
        "Mix verbetering in replacement heads",
        "Positive margin trend"
      ],
      OTTR: [
        "On Time To Request: 95.7% | Target: 95.0% | Status: green",
        "Carrier performance improved +1.4%",
        "No expedited transport needed"
      ]
    },
    highlights: [
      "Best fillrate score in laatste 8 weken.",
      "OTTR boven target ondanks volume uplift."
    ],
    lowlights: [
      "Demand fulfillment licht onder target.",
      "Incidentele vertraging voor spare heads."
    ],
    help: [
      "Validatie nodig op demand signal APAC.",
      "Input gevraagd voor Q2 promotion phasing."
    ]
  },
  IPL: {
    week: "Week 6 - 2026",
    kpis: {
      Fillrate: {
        type: "fillrate",
        weeks: HISTORY_WEEKS,
        total: [93.1, 92.9, 92.2, 91.8, 91.4, 90.8, 91.3, 91.9, 92.1, 92.5, 92.0, 91.7, 91.4],
        markets: [
          marketValues("DACH", [92.7, 92.4, 91.8, 91.2, 90.8, 90.1, 90.9, 91.3, 91.6, 92.0, 91.4, 91.0, 90.7]),
          marketValues("Benelux", [93.3, 93.0, 92.4, 92.0, 91.6, 91.0, 91.5, 92.1, 92.4, 92.7, 92.2, 91.9, 91.6]),
          marketValues("UK&I", [92.9, 92.6, 92.0, 91.5, 91.0, 90.5, 91.0, 91.6, 91.8, 92.2, 91.8, 91.4, 91.1]),
          marketValues("France", [93.4, 93.1, 92.6, 92.1, 91.8, 91.2, 91.7, 92.3, 92.5, 92.9, 92.4, 92.0, 91.8])
        ],
        actions: [
          {
            rootcause: "Constrained PCB supply",
            countermeasure: "Alternate supplier vrijgave versneld",
            owner: "Commodity Manager"
          },
          {
            rootcause: "Lagere test-yield week 3-4",
            countermeasure: "Process window update op final test",
            owner: "Quality Engineer"
          },
          {
            rootcause: "Late final packing handoff",
            countermeasure: "Dagelijkse OTTR war-room met operations",
            owner: "Operations Lead"
          }
        ]
      },
      "Unconstrained demand fulfillment": [
        "Target: 96.0% | Actual: 94.8% | Status: red",
        "Backlog trend: +5.3% vs vorige week",
        "Recovery capacity gepland in week 8"
      ],
      "USP-CSP": [
        "USP adherence: 92.4% | CSP adherence: 93.0% | Status: yellow",
        "Main variance from supplier takt time",
        "Stabilization plan in uitvoering"
      ],
      "Safety stock fulfillment": {
        type: "safety_stock",
        weeks: FUTURE_WEEKS,
        percentage: {
          total: [62, 64, 66, 67, 69, 70, 72, 73, 75, 76, 78, 79, 81],
          markets: [
            marketValues("DACH", [58, 60, 62, 63, 65, 66, 68, 69, 71, 72, 74, 75, 77]),
            marketValues("Benelux", [64, 66, 67, 68, 70, 71, 73, 74, 76, 77, 79, 80, 82]),
            marketValues("UK&I", [60, 62, 64, 65, 67, 68, 70, 71, 73, 74, 76, 77, 79]),
            marketValues("France", [63, 65, 66, 67, 69, 70, 72, 73, 75, 76, 78, 79, 81])
          ]
        },
        dfs: {
          total: [18, 19, 20, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
          markets: [
            marketValues("DACH", [15, 16, 17, 17, 18, 19, 20, 21, 22, 23, 24, 24, 25]),
            marketValues("Benelux", [19, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]),
            marketValues("UK&I", [17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 25, 26, 27]),
            marketValues("France", [18, 19, 20, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29])
          ]
        }
      },
      UVAP: [
        "UVAP score: 89.8% | Target: 91.5% | Status: red",
        "Unfavorable mix due to constrained premium variants",
        "Price/mix herstel verwacht in week 9"
      ],
      OTTR: [
        "On Time To Request: 93.2% | Target: 95.0% | Status: red",
        "Late handoff in final packing step",
        "Cross-functional OTTR taskforce gestart"
      ]
    },
    highlights: [
      "Supplier takt time trend verbetert sinds maandag.",
      "Priority allocation beperkt customer escalations."
    ],
    lowlights: [
      "Fillrate en OTTR onder target.",
      "Hoge druk op safety stock policies."
    ],
    help: [
      "Snelle besluitvorming nodig op alternate PCB supplier.",
      "Extra planning support gevraagd voor week 8 ramp-up."
    ]
  }
};

const streamList = document.getElementById("streamList");
const currentStream = document.getElementById("currentStream");
const currentWeek = document.getElementById("currentWeek");
const emptyState = document.getElementById("emptyState");
const dashboardContent = document.getElementById("dashboardContent");
const kpiContainer = document.getElementById("kpiContainer");
const highlightsList = document.getElementById("highlightsList");
const lowlightsList = document.getElementById("lowlightsList");
const helpList = document.getElementById("helpList");

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
    if (values.some((value) => value < 93)) return "red";
    return "green";
  }

  if (details.type === "safety_stock") {
    const values = details.percentage?.total || [];
    if (values.some((value) => value < 70)) return "red";
    if (values.some((value) => value < 80)) return "yellow";
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

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

function createMatrixTable(weeks, totalValues, markets, options = {}) {
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
  const rows = [{ name: rowNameTotal, values: totalValues, isTotal: true }, ...markets];

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    if (row.isTotal) tr.className = "is-total-row";

    const nameCell = document.createElement("th");
    nameCell.scope = "row";
    nameCell.textContent = row.name;
    tr.appendChild(nameCell);

    row.values.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = formatValue(value);
      const className = getValueClass(value);
      if (className) td.classList.add(className);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

function renderFillrateContent(contentEl, details) {
  const chartWrap = document.createElement("div");
  chartWrap.className = "fillrate-chart";

  const chartTitle = document.createElement("p");
  chartTitle.className = "kpi-section-title";
  chartTitle.textContent = "Totale fillrate - afgelopen 13 weken";
  chartWrap.appendChild(chartTitle);

  const bars = document.createElement("div");
  bars.className = "fillrate-bars";
  details.total.forEach((value, index) => {
    const barItem = document.createElement("div");
    barItem.className = "fillrate-bar-item";

    const bar = document.createElement("div");
    bar.className = `fillrate-bar ${value >= 93 ? "ok" : "risk"}`;
    bar.style.height = `${Math.max(18, (value - 85) * 8)}px`;
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
  tableTitle.textContent = "Fillrate per markt en totaal";
  tableWrap.appendChild(tableTitle);
  tableWrap.appendChild(
    createMatrixTable(details.weeks, details.total, details.markets, {
      formatValue: formatPercent,
      getValueClass: (value) => (value >= 93 ? "value-good" : "value-bad")
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
              <td>${item.rootcause}</td>
              <td>${item.countermeasure}</td>
              <td>${item.owner}</td>
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

function renderSafetyStockContent(contentEl, details) {
  let mode = "percentage";

  const controls = document.createElement("div");
  controls.className = "kpi-controls-row";

  const title = document.createElement("p");
  title.className = "kpi-section-title";
  title.textContent = "Safety stock planning - komende 13 weken";
  controls.appendChild(title);

  const rightControls = document.createElement("div");
  rightControls.className = "kpi-controls";

  const modeLabel = document.createElement("span");
  modeLabel.className = "mode-label";
  modeLabel.textContent = "Weergave: % gevuld";
  rightControls.appendChild(modeLabel);

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "mode-toggle-btn";
  toggleBtn.textContent = "DFS";
  rightControls.appendChild(toggleBtn);

  controls.appendChild(rightControls);
  contentEl.appendChild(controls);

  const tableHost = document.createElement("div");
  tableHost.className = "kpi-table-wrap";
  contentEl.appendChild(tableHost);

  function renderModeTable() {
    tableHost.innerHTML = "";
    if (mode === "percentage") {
      modeLabel.textContent = "Weergave: % gevuld";
      tableHost.appendChild(
        createMatrixTable(details.weeks, details.percentage.total, details.percentage.markets, {
          formatValue: (value) => `${value}%`,
          getValueClass: (value) => {
            if (value < 70) return "value-bad";
            if (value < 80) return "value-warn";
            return "value-good";
          }
        })
      );
    } else {
      modeLabel.textContent = "Weergave: days future sales";
      tableHost.appendChild(
        createMatrixTable(details.weeks, details.dfs.total, details.dfs.markets, {
          formatValue: (value) => `${value}d`
        })
      );
    }
  }

  toggleBtn.addEventListener("click", () => {
    mode = mode === "percentage" ? "dfs" : "percentage";
    toggleBtn.classList.toggle("active", mode === "dfs");
    renderModeTable();
  });

  renderModeTable();
}

function renderKpis(streamName) {
  const streamData = dashboardData[streamName];
  kpiContainer.innerHTML = "";

  Object.entries(streamData.kpis).forEach(([groupName, details]) => {
    const detailsEl = document.createElement("details");
    detailsEl.className = "kpi-group";
    const overallStatus = getOverallKpiStatus(details);
    detailsEl.dataset.status = overallStatus;

    const summaryEl = document.createElement("summary");
    summaryEl.innerHTML = `
      <span class="kpi-title">${groupName}</span>
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

    const listEl = document.createElement("ul");
    listEl.className = "kpi-list";

    if (Array.isArray(details)) {
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
      renderFillrateContent(contentEl, details);
    } else if (details.type === "safety_stock") {
      renderSafetyStockContent(contentEl, details);
    }
    detailsEl.appendChild(contentEl);

    kpiContainer.appendChild(detailsEl);
  });
}

function selectStream(streamName, buttonEl) {
  const streamData = dashboardData[streamName];
  currentStream.textContent = `Value stream: ${streamName}`;
  currentWeek.textContent = `Update: ${streamData.week}`;

  emptyState.classList.add("hidden");
  dashboardContent.classList.remove("hidden");

  document.querySelectorAll(".stream-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  buttonEl.classList.add("active");

  renderKpis(streamName);
  renderList(highlightsList, streamData.highlights);
  renderList(lowlightsList, streamData.lowlights);
  renderList(helpList, streamData.help);
}

Object.keys(dashboardData).forEach((streamName) => {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.className = "stream-btn";
  btn.type = "button";
  btn.textContent = streamName;
  btn.addEventListener("click", () => selectStream(streamName, btn));
  li.appendChild(btn);
  streamList.appendChild(li);
});

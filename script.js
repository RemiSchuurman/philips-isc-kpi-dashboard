const dashboardData = {
  Shaving: {
    week: "Week 6 - 2026",
    kpis: {
      Fillrate: [
        "Target: 98.0% | Actual: 97.2% | Status: yellow",
        "Top issue: late inbound motor components",
        "Main market impact: DACH"
      ],
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
      "Safety stock fulfillment": [
        "SKU coverage > policy: 88% | Status: red",
        "Critical SKUs below threshold: 12",
        "Expedite requests gestart voor blades"
      ],
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
      Fillrate: [
        "Target: 98.5% | Actual: 98.8% | Status: green",
        "Steady performance across EU/NA",
        "No critical stock-outs gemeld"
      ],
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
      "Safety stock fulfillment": [
        "SKU coverage > policy: 94% | Status: green",
        "Critical SKUs below threshold: 4",
        "Inbound planning op schema"
      ],
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
      Fillrate: [
        "Target: 97.5% | Actual: 96.1% | Status: red",
        "Main issue: constrained PCB supply",
        "Service level impact in Benelux and FR"
      ],
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
      "Safety stock fulfillment": [
        "SKU coverage > policy: 82% | Status: red",
        "Critical SKUs below threshold: 16",
        "Priority allocation actief"
      ],
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

function renderList(targetElement, items) {
  targetElement.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    targetElement.appendChild(li);
  });
}

function renderKpis(streamName) {
  const streamData = dashboardData[streamName];
  kpiContainer.innerHTML = "";

  Object.entries(streamData.kpis).forEach(([groupName, details]) => {
    const detailsEl = document.createElement("details");
    detailsEl.className = "kpi-group";

    const summaryEl = document.createElement("summary");
    summaryEl.textContent = groupName;
    detailsEl.appendChild(summaryEl);

    const contentEl = document.createElement("div");
    contentEl.className = "kpi-content";

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

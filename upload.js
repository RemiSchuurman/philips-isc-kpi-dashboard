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

const state = {
  supabaseUrl: localStorage.getItem("supabase_url") || "",
  supabaseAnonKey: localStorage.getItem("supabase_anon_key") || "",
  supabaseClient: null,
  parsedRows: []
};

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
  return Boolean(match);
}

function goToUploadStep(step) {
  uploadStep1.classList.toggle("hidden", step !== 1);
  uploadStep2.classList.toggle("hidden", step !== 2);
  uploadStep3.classList.toggle("hidden", step !== 3);
  stepBadge.textContent = `Stap ${step} van 3`;
}

function connectSupabase() {
  if (!state.supabaseUrl || !state.supabaseAnonKey || !window.supabase?.createClient) {
    state.supabaseClient = null;
    return false;
  }
  state.supabaseClient = window.supabase.createClient(state.supabaseUrl, state.supabaseAnonKey);
  return true;
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

    const missingColumns = REQUIRED_COLUMNS.filter((column) => !(normalizeHeader(column) in normalized));
    if (missingColumns.length) {
      errors.push(`Kolommen ontbreken in Excel: ${missingColumns.join(", ")}`);
      return;
    }

    const weekLabel = String(normalized[normalizeHeader("Week")]).trim();
    if (!parseWeek(weekLabel)) {
      errors.push(`Rij ${index + 2}: ongeldig weekformaat "${weekLabel}" (verwacht YYYY.WW)`);
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
    const { error } = await state.supabaseClient
      .from("fillrate_rows")
      .upsert(chunk, {
        onConflict: "value_stream,market,week_label,pag,mag,ag,project"
      });
    if (error) throw error;
  }
}

function init() {
  supabaseUrlInput.value = state.supabaseUrl;
  supabaseAnonKeyInput.value = state.supabaseAnonKey;

  saveSupabaseBtn.addEventListener("click", () => {
    state.supabaseUrl = supabaseUrlInput.value.trim();
    state.supabaseAnonKey = supabaseAnonKeyInput.value.trim();
    localStorage.setItem("supabase_url", state.supabaseUrl);
    localStorage.setItem("supabase_anon_key", state.supabaseAnonKey);
    validationSummary.textContent = "Koppeling opgeslagen.";
    validationSummary.className = "validation-summary success";
    goToUploadStep(2);
  });

  excelInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rawRows = await parseExcelRows(file);
      const { mappedRows, errors, previewRows } = mapAndValidateRows(rawRows);
      state.parsedRows = mappedRows;

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
      uploadResult.className = "upload-result";
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
    if (!state.parsedRows.length) return;
    uploadToDbBtn.disabled = true;
    uploadResult.textContent = "Upload bezig...";
    uploadResult.className = "upload-result";

    try {
      await uploadRowsToSupabase(state.parsedRows);
      uploadResult.textContent = `Upload succesvol: ${state.parsedRows.length} regels verwerkt. Je kunt nu terug naar het dashboard.`;
      uploadResult.className = "upload-result success";
    } catch (error) {
      uploadResult.textContent = `Upload mislukt: ${error.message}`;
      uploadResult.className = "upload-result error";
    } finally {
      uploadToDbBtn.disabled = false;
    }
  });

  goToUploadStep(1);
}

init();

const STORAGE_KEY = "lpu_club_volunteers_v2";
const AVAILABLE_CLUBS = [
  "Coding Club",
  "Dance Club",
  "Music Club",
  "Sports Club",
  "Photography Club",
  "Drama Club"
];

const DEMO_RECORDS = [
  {
    id: "demo-1",
    studentName: "Rohan Verma",
    regNumber: "12314582",
    courseSem: "B.Tech CSE · Sem 3",
    contactInfo: "+91 98154 22109",
    club: "Coding Club",
    role: "Technical",
    reason: "Built event registration pages for two campus hackathons and comfortable managing live check-in portals.",
    status: "Selected"
  },
  {
    id: "demo-2",
    studentName: "Ananya Kapoor",
    regNumber: "12408914",
    courseSem: "BBA · Sem 1",
    contactInfo: "ananya.12408914@lpu.in",
    club: "Drama Club",
    role: "Anchoring",
    reason: "Hosted school annual fests and inter-house debates; excited to coordinate stage flow for Youth Vibe.",
    status: "Pending"
  },
  {
    id: "demo-3",
    studentName: "Kabir Gill",
    regNumber: "12309411",
    courseSem: "B.Des Multimedia · Sem 3",
    contactInfo: "+91 98720 66418",
    club: "Photography Club",
    role: "Design / Media",
    reason: "Experienced in event reels, Lightroom color grading, and poster design using Figma.",
    status: "Pending"
  }
];

// DOM References
const form = document.getElementById("volunteerForm");
const formMessage = document.getElementById("formMessage");
const tableBody = document.getElementById("volunteerTable");
const searchInput = document.getElementById("searchInput");
const clubFilter = document.getElementById("clubFilter");
const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");
const clearDemoBtn = document.getElementById("clearDemoBtn");

const totalCountEl = document.getElementById("totalCount");
const pendingCountEl = document.getElementById("pendingCount");
const selectedCountEl = document.getElementById("selectedCount");
const clubCountEl = document.getElementById("clubCount");

// Escape user text before injecting into HTML
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Storage helpers
function getRecords() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_RECORDS));
    return [...DEMO_RECORDS];
  }
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// Update top summary counters
function updateStats(records) {
  totalCountEl.textContent = records.length;
  pendingCountEl.textContent = records.filter((r) => r.status === "Pending").length;
  selectedCountEl.textContent = records.filter((r) => r.status === "Selected").length;
  clubCountEl.textContent = AVAILABLE_CLUBS.length;
}

// Render filtered table rows
function renderPortal() {
  const records = getRecords();
  updateStats(records);

  const query = searchInput.value.trim().toLowerCase();
  const selectedClub = clubFilter.value;
  const selectedRole = roleFilter.value;
  const selectedStatus = statusFilter.value;

  const filtered = records.filter((item) => {
    const matchesQuery =
      !query ||
      item.studentName.toLowerCase().includes(query) ||
      item.regNumber.toLowerCase().includes(query) ||
      item.courseSem.toLowerCase().includes(query) ||
      item.contactInfo.toLowerCase().includes(query);

    const matchesClub = !selectedClub || item.club === selectedClub;
    const matchesRole = !selectedRole || item.role === selectedRole;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;

    return matchesQuery && matchesClub && matchesRole && matchesStatus;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No matching volunteer applications found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered
    .map((item) => {
      const statusClass = item.status.toLowerCase();
      return `
        <tr data-id="${escapeHTML(item.id)}">
          <td>
            <div class="student-name">${escapeHTML(item.studentName)}</div>
            <div class="student-meta">Reg: ${escapeHTML(item.regNumber)} · ${escapeHTML(item.courseSem)}</div>
            <div class="contact-row">
              <span>${escapeHTML(item.contactInfo)}</span>
              <button type="button" class="copy-btn" data-action="copy" data-contact="${escapeHTML(item.contactInfo)}">Copy</button>
            </div>
          </td>
          <td>
            <div class="club-name">${escapeHTML(item.club)}</div>
            <span class="role-badge">${escapeHTML(item.role)}</span>
          </td>
          <td class="reason-cell">${escapeHTML(item.reason)}</td>
          <td>
            <span class="badge ${statusClass}">${escapeHTML(item.status)}</span>
          </td>
          <td>
            <div class="action-group">
              <button type="button" class="btn-action btn-select" data-action="select">Select</button>
              <button type="button" class="btn-action btn-reject" data-action="reject">Reject</button>
              <button type="button" class="btn-action btn-delete" data-action="delete">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`;
  setTimeout(() => {
    formMessage.textContent = "";
    formMessage.className = "form-message";
  }, 3500);
}

// Form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const studentName = document.getElementById("studentName").value.trim();
  const regNumber = document.getElementById("regNumber").value.trim();
  const courseSem = document.getElementById("courseSem").value.trim();
  const contactInfo = document.getElementById("contactInfo").value.trim();
  const club = document.getElementById("club").value;
  const role = document.getElementById("role").value;
  const reason = document.getElementById("reason").value.trim();

  const records = getRecords();

  // Prevent duplicate registration number for the same club
  const isDuplicate = records.some(
    (r) => r.regNumber.toLowerCase() === regNumber.toLowerCase() && r.club === club
  );

  if (isDuplicate) {
    showMessage(`Registration ${regNumber} has already applied to ${club}.`, "error");
    return;
  }

  const newEntry = {
    id: "vol-" + Date.now(),
    studentName,
    regNumber,
    courseSem,
    contactInfo,
    club,
    role,
    reason,
    status: "Pending"
  };

  records.unshift(newEntry);
  saveRecords(records);
  form.reset();
  renderPortal();
  showMessage("Application submitted successfully!", "success");
});

// Table row actions (Select, Reject, Delete, Copy Contact)
tableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;

  if (action === "copy") {
    const contact = btn.dataset.contact;
    navigator.clipboard?.writeText(contact);
    const originalLabel = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = originalLabel;
    }, 1400);
    return;
  }

  const row = btn.closest("tr[data-id]");
  if (!row) return;
  const id = row.dataset.id;

  let records = getRecords();

  if (action === "select") {
    records = records.map((r) => (r.id === id ? { ...r, status: "Selected" } : r));
  } else if (action === "reject") {
    records = records.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r));
  } else if (action === "delete") {
    records = records.filter((r) => r.id !== id);
  }

  saveRecords(records);
  renderPortal();
});

// Live filters
[searchInput, clubFilter, roleFilter, statusFilter].forEach((control) => {
  control.addEventListener("input", renderPortal);
  control.addEventListener("change", renderPortal);
});

// Reset demo records
clearDemoBtn.addEventListener("click", () => {
  saveRecords([...DEMO_RECORDS]);
  searchInput.value = "";
  clubFilter.value = "";
  roleFilter.value = "";
  statusFilter.value = "";
  renderPortal();
  showMessage("Demo records restored.", "success");
});

// Initial load
renderPortal();

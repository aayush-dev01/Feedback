const STORAGE_KEY = "karta_feedback_unified_dataset";
const ADMIN_PASSCODE = "karta@grad2026";

document.addEventListener("DOMContentLoaded", () => {
  const adminContent = document.getElementById("adminContent");
  const unlockAdmin = document.getElementById("unlockAdmin");
  const adminPasscode = document.getElementById("adminPasscode");
  
  const submissionCount = document.getElementById("submissionCount");
  const averageRating = document.getElementById("averageRating");
  const latestBatch = document.getElementById("latestBatch");
  
  const exportJson = document.getElementById("exportJson");
  const exportCsv = document.getElementById("exportCsv");
  const exportPdf = document.getElementById("exportPdf");
  const datasetFile = document.getElementById("datasetFile");
  const datasetCards = document.getElementById("datasetCards");
  const toastTemplate = document.getElementById("toastTemplate");

  let cachedDataset = loadDataset();

  // Initialization & Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function observeElements() {
    document.querySelectorAll('.stagger-item').forEach(el => observer.observe(el));
  }

  // Toast System
  function showToast(message, type = 'info') {
    const existing = document.querySelector(".toast.show");
    if (existing) {
      existing.remove();
    }
    
    const toast = toastTemplate.content.firstElementChild.cloneNode(true);
    toast.querySelector('.toast-message').textContent = message;
    
    if (type === 'error') {
      toast.querySelector('.toast-icon').textContent = '⚠️';
      toast.style.background = '#FF5A5F';
    } else if (type === 'success') {
      toast.querySelector('.toast-icon').textContent = '✅';
      toast.style.background = '#00A699';
    }
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // Dataset Management
  function loadDataset() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveDataset(dataset) {
    cachedDataset = dataset;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
    renderAdminDataset();
  }

  // Rendering
  function renderAdminDataset() {
    const dataset = cachedDataset;
    datasetCards.innerHTML = "";

    if (!dataset.length) {
      datasetCards.innerHTML = '<div class="empty-state stagger-item">No feedback submissions available yet.</div>';
    } else {
      // Render in reverse chronological order
      [...dataset].reverse().forEach((entry, index) => {
        const card = document.createElement("article");
        card.className = "feedback-card stagger-item";
        card.style.animationDelay = `${index * 0.1}s`;

        const improvementAreas = Array.isArray(entry.improvementAreas) && entry.improvementAreas.length
          ? entry.improvementAreas.join(", ")
          : "-";
        
        const personalChallenges = Array.isArray(entry.personalChallenges) && entry.personalChallenges.length
          ? entry.personalChallenges.join(", ")
          : "-";

        const formattedDate = entry.submittedAt 
          ? new Date(entry.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) 
          : "Recent response";

        card.innerHTML = `
          <div class="feedback-card-head">
            <div>
              <p class="feedback-card-kicker">${escapeHtml(formattedDate)}</p>
              <h4>${escapeHtml(entry.fullName || "Anonymous")}</h4>
            </div>
            <div class="feedback-card-score">
              <span>Overall</span>
              <strong>${escapeHtml(entry.overallExperience || "-")}</strong>
            </div>
          </div>

          <div class="feedback-grid">
            <div><span>Batch / Program</span><strong>${escapeHtml(entry.batchProgram || "-")}</strong></div>
            <div><span>Status</span><strong>${escapeHtml(entry.currentStatus || "-")}</strong></div>
            <div><span>Support Rating</span><strong>${escapeHtml(entry.teamSupport || "-")}</strong></div>
            <div><span>Recommendation</span><strong>${escapeHtml(entry.recommendKarta || "-")}</strong></div>
          </div>

          <details class="feedback-details">
            <summary>View Complete Feedback</summary>
            <div class="feedback-detail-list">
              <p><span>Email</span> ${escapeHtml(entry.email || "-")}</p>
              <p><span>Institution</span> ${escapeHtml(entry.institution || "-")}</p>
              <p><span>Degree & Field</span> ${escapeHtml(entry.degreeField || "-")}</p>
              <p><span>Journey Summary</span> ${escapeHtml(entry.journeySummary || "-")}</p>
              
              <p><span>Improvement Areas</span> ${escapeHtml(improvementAreas)}</p>
              <p><span>Academic Challenges Faced?</span> ${escapeHtml(entry.academicChallenges || "-")}</p>
              <p><span>Academic Challenge Details</span> ${escapeHtml(entry.academicChallengeDetails || "-")}</p>
              <p><span>Personal Challenges</span> ${escapeHtml(personalChallenges)}</p>
              
              <p><span>Most Impactful Part</span> ${escapeHtml(entry.mostImpactfulPart || "-")}</p>
              <p><span>Mentorship Helped?</span> ${escapeHtml(entry.mentorshipHelped || "-")}</p>
              <p><span>Future Helpful Skills</span> ${escapeHtml(Array.isArray(entry.futureHelpfulSkills) ? entry.futureHelpfulSkills.join(', ') : (entry.futureHelpfulSkills || '-'))}</p>
              
              <p><span>Post-Graduation Plans</span> ${escapeHtml(entry.postGradPlans || "-")}</p>
              <p><span>Confidence Scale</span> ${escapeHtml(entry.confidenceScale || "-")}</p>
              
              <p><span>Suggestions for Karta</span> ${escapeHtml(entry.improvementSuggestion || "-")}</p>
              <p><span>Core Value to Carry Forward</span> ${escapeHtml(entry.carryForward || "-")}</p>
              <p><span>Proud Moment</span> ${escapeHtml(entry.proudMoment || "-")}</p>
              <p><span>Final Message</span> ${escapeHtml(entry.finalMessage || "-")}</p>
            </div>
          </details>
        `;
        datasetCards.appendChild(card);
      });
    }

    observeElements();

    // Update Stats
    submissionCount.textContent = String(dataset.length);
    latestBatch.textContent = dataset.length ? dataset[dataset.length - 1].batchProgram || "-" : "-";

    const average = dataset.length
      ? (dataset.reduce((sum, item) => sum + (Number(item.overallExperience) || 0), 0) / dataset.length).toFixed(1)
      : "0.0";
    averageRating.textContent = average;
  }

  // Authentication
  function unlockAdminView() {
    if (adminPasscode.value.trim() !== ADMIN_PASSCODE) {
      showToast("Incorrect passcode. Please try again.", "error");
      adminPasscode.value = "";
      adminPasscode.focus();
      return;
    }

    // Hide login, show content with animation
    adminPasscode.closest('.admin-card').style.display = 'none';
    adminContent.classList.remove("hidden");
    adminContent.classList.add("fade-in-up");
    
    renderAdminDataset();
    showToast("Access granted.", "success");
  }

  unlockAdmin.addEventListener("click", unlockAdminView);
  adminPasscode.addEventListener("keydown", (event) => {
    if (event.key === "Enter") unlockAdminView();
  });

  // Export Utilities
  function exportFile(data, filename, type) {
    const blob = new Blob([type === "csv" ? data : JSON.stringify(data, null, 2)], {
      type: type === "csv" ? "text/csv;charset=utf-8;" : "application/json;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    
    showToast(`${filename} exported successfully.`, "success");
  }

  function toCsv(dataset) {
    if (!dataset.length) return "";
    
    // Extract all unique keys as columns
    const columns = Array.from(new Set(dataset.flatMap(Object.keys)));
    
    const rows = [columns.join(",")];
    dataset.forEach((entry) => {
      rows.push(columns.map((column) => csvCell(entry[column])).join(","));
    });
    return rows.join("\n");
  }

  function csvCell(value) {
    const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
  }

  function openPdfExport(dataset) {
    if (!dataset.length) {
      showToast("No data to export.", "error");
      return;
    }
    
    const rows = dataset.map((entry) => `
      <article class="pdf-card">
        <div class="pdf-card-head">
          <div>
            <p class="pdf-kicker">${escapeHtml(entry.submittedAt ? new Date(entry.submittedAt).toLocaleString() : "Recent")}</p>
            <h2>${escapeHtml(entry.fullName || "Anonymous")}</h2>
          </div>
          <div class="pdf-score">Overall: ${escapeHtml(entry.overallExperience || "-")} / 5</div>
        </div>
        <div class="pdf-grid">
          <div><strong>Batch / Program</strong><span>${escapeHtml(entry.batchProgram || "-")}</span></div>
          <div><strong>Status</strong><span>${escapeHtml(entry.currentStatus || "-")}</span></div>
        </div>
        <div class="pdf-notes">
          <p><strong>Institution:</strong> ${escapeHtml(entry.institution || "-")}</p>
          <p><strong>Most Impactful Part:</strong> ${escapeHtml(entry.mostImpactfulPart || "-")}</p>
          <p><strong>Suggestions:</strong> ${escapeHtml(entry.improvementSuggestion || "-")}</p>
          <p><strong>Final Message:</strong> ${escapeHtml(entry.finalMessage || "-")}</p>
        </div>
      </article>
    `).join("");

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) {
      showToast("Please allow pop-ups to export the PDF report.", "error");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Karta Unified Dataset - PDF Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { margin: 0; font-family: 'Inter', sans-serif; color: #1C1E21; background: #F9FAFB; }
            header { padding: 32px; background: #FFFFFF; border-bottom: 2px solid #F7931A; }
            h1 { margin: 0 0 8px 0; font-size: 24px; color: #1C1E21; }
            p { margin: 0; color: #5C6269; }
            main { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
            .pdf-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; break-inside: avoid; page-break-inside: avoid; }
            .pdf-card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #F3F4F6; }
            .pdf-kicker { margin: 0 0 4px 0; color: #F7931A; font-size: 12px; font-weight: 700; text-transform: uppercase; }
            .pdf-card h2 { margin: 0; font-size: 20px; }
            .pdf-score { background: #FFF3DF; color: #D67C11; font-weight: 700; padding: 6px 12px; border-radius: 99px; font-size: 14px; }
            .pdf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
            .pdf-grid div { background: #F9FAFB; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB; }
            .pdf-grid strong { display: block; font-size: 12px; color: #5C6269; text-transform: uppercase; margin-bottom: 4px; }
            .pdf-notes { display: flex; flex-direction: column; gap: 12px; }
            .pdf-notes p { font-size: 14px; line-height: 1.5; color: #1C1E21; padding: 12px; background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB; }
            .pdf-notes strong { display: block; font-size: 12px; color: #5C6269; text-transform: uppercase; margin-bottom: 4px; }
            @media print {
              body { background: white; }
              .pdf-card { border-color: #000; }
              .pdf-grid div, .pdf-notes p { border-color: #ccc; }
            }
          </style>
        </head>
        <body>
          <header>
            <h1>Karta Initiative - Graduation Feedback Report</h1>
            <p>Generated on ${new Date().toLocaleString()} • ${dataset.length} Submissions</p>
          </header>
          <main>${rows}</main>
          <script>
            window.onload = () => { window.focus(); window.print(); };
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Event Listeners for actions
  exportJson.addEventListener("click", () => exportFile(cachedDataset, "karta-feedback-dataset.json", "json"));
  exportCsv.addEventListener("click", () => exportFile(toCsv(cachedDataset), "karta-feedback-dataset.csv", "csv"));
  exportPdf.addEventListener("click", () => openPdfExport(cachedDataset));

  datasetFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Dataset must be an array");
      
      saveDataset(parsed);
      showToast(`Imported ${parsed.length} records successfully.`, "success");
    } catch (err) {
      showToast("Invalid JSON file. Please ensure it's a valid export format.", "error");
    } finally {
      datasetFile.value = ""; // Reset input
    }
  });

});

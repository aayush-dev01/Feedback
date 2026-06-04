const STORAGE_KEY = "karta_feedback_unified_dataset";

document.addEventListener("DOMContentLoaded", () => {
  // Intersection Observer for scroll animations (Staggering entry)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.stagger-item').forEach(el => {
    observer.observe(el);
  });

  // Dynamic Field Toggling (Academic Challenges)
  const feedbackForm = document.getElementById("feedbackForm");
  const academicChallengeDetailsWrap = document.getElementById("academicChallengeDetailsWrap");
  const academicChallengeDetails = feedbackForm.querySelector('[name="academicChallengeDetails"]');

  feedbackForm.addEventListener("change", (event) => {
    if (event.target && event.target.name === "academicChallenges") {
      const showDetails = event.target.value === "Yes";
      
      if (showDetails) {
        academicChallengeDetailsWrap.classList.remove("hidden");
        academicChallengeDetails.required = true;
      } else {
        academicChallengeDetailsWrap.classList.add("hidden");
        academicChallengeDetails.required = false;
        academicChallengeDetails.value = "";
      }
    }
  });

  // Ensure initial state
  if (!document.querySelector('input[name="academicChallenges"]:checked')) {
    academicChallengeDetailsWrap.classList.add("hidden");
    academicChallengeDetails.required = false;
  }

  // Toast System
  const toastTemplate = document.getElementById("toastTemplate");
  
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
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500); // Wait for transition
    }, 3000);
  }

  // LocalStorage Dataset Handlers
  let cachedDataset = loadDataset();

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
  }

  // Form Value Helpers
  function formValues(formData, key) {
    return formData.getAll(key).filter(Boolean);
  }

  function toNumber(value) {
    return Number.parseInt(value, 10) || 0;
  }

  // Submission Collection & Validation
  function collectSubmission(form) {
    const formData = new FormData(form);
    const academicChallenges = formData.get("academicChallenges");
    const challengeDetails = String(formData.get("academicChallengeDetails") || "").trim();

    return {
      submittedAt: new Date().toISOString(),
      fullName: String(formData.get("fullName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      institution: String(formData.get("institution") || "").trim(),
      degreeField: String(formData.get("degreeField") || "").trim(),
      journeySummary: String(formData.get("journeySummary") || "").trim(),
      batchProgram: String(formData.get("batchProgram") || "").trim(),
      currentStatus: String(formData.get("currentStatus") || "").trim(),
      overallExperience: toNumber(formData.get("overallExperience")),
      improvementAreas: formValues(formData, "improvementAreas"),
      academicChallengeTypes: formValues(formData, "academicChallengeTypes"),
      mostImpactfulPart: String(formData.get("mostImpactfulPart") || "").trim(),
      academicChallenges: academicChallenges === "Yes",
      academicChallengeDetails: academicChallenges === "Yes" ? challengeDetails : "",
      personalChallenges: formValues(formData, "personalChallenges"),
      mentorshipHelped: String(formData.get("mentorshipHelped") || "").trim(),
      willingToMentor: String(formData.get("willingToMentor") || "").trim(),
      mentorPreference: String(formData.get("mentorPreference") || "").trim(),
      teamSupport: toNumber(formData.get("teamSupport")),
      learningUsefulness: toNumber(formData.get("learningUsefulness")),
      futureConfidence: String(formData.get("futureConfidence") || "").trim(),
      confidenceScale: toNumber(formData.get("confidenceScale")),
      futureHelpfulSkills: String(formData.get("futureHelpfulSkills") || "").trim(),
      internships: String(formData.get("internships") || "").trim(),
      internshipExperience: String(formData.get("internshipExperience") || "").trim(),
      internshipLesson: String(formData.get("internshipLesson") || "").trim(),
      improvementSuggestion: String(formData.get("improvementSuggestion") || "").trim(),
      recommendKarta: String(formData.get("recommendKarta") || "").trim(),
      postGradPlans: String(formData.get("postGradPlans") || "").trim(),
      carryForward: String(formData.get("carryForward") || "").trim(),
      proudMoment: String(formData.get("proudMoment") || "").trim(),
      advice: String(formData.get("advice") || "").trim(),
      finalMessage: String(formData.get("finalMessage") || "").trim(),
    };
  }

  function validateSubmission(submission) {
    const requiredText = [
      submission.batchProgram,
      submission.mostImpactfulPart,
      submission.futureHelpfulSkills,
      submission.improvementSuggestion,
      submission.finalMessage,
    ];

    if (requiredText.some((value) => !value)) {
      return "Please complete all required text fields.";
    }

    if (!submission.overallExperience || !submission.teamSupport || !submission.learningUsefulness) {
      return "Please answer all rating questions.";
    }

    if (!submission.currentStatus || !submission.futureConfidence || !submission.recommendKarta) {
      return "Please answer all required choice questions.";
    }

    if (submission.academicChallenges && !submission.academicChallengeDetails) {
      return "Please describe the academic challenges if you selected Yes.";
    }

    return "";
  }

  // Form Submit Handler
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    // Add visual feedback to submit button
    const btn = event.submitter;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Processing...</span><i class="icon-spinner">⏳</i>';
    btn.style.opacity = '0.8';
    btn.disabled = true;

    setTimeout(() => {
      const submission = collectSubmission(feedbackForm);
      const validationMessage = validateSubmission(submission);
      
      if (validationMessage) {
        showToast(validationMessage, 'error');
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
        
        // Find first invalid field and scroll to it
        const firstInvalid = feedbackForm.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
        return;
      }

      // Save valid submission
      const dataset = [...cachedDataset, submission];
      saveDataset(dataset);
      
      // Reset form
      feedbackForm.reset();
      
      // Hide dynamic fields
      academicChallengeDetailsWrap.classList.add("hidden");
      
      // Success feedback
      showToast("Feedback submitted successfully. Thank you!", 'success');
      
      btn.innerHTML = '<span>Submitted!</span><i class="icon-check">✓</i>';
      btn.style.background = 'var(--success)';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.opacity = '1';
        btn.disabled = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 3000);

    }, 600); // Artificial delay for premium feel
  });
});

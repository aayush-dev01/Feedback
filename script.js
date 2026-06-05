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
  const otherOptionInputs = Array.from(feedbackForm.querySelectorAll("[data-other-target]"));

  function setOtherFieldState(input) {
    const targetId = input.dataset.otherTarget;
    const wrap = document.getElementById(targetId);
    if (!wrap) return;

    const textInput = wrap.querySelector("input, textarea");
    const isActive = input.type === "checkbox" ? input.checked : input.checked;

    wrap.classList.toggle("hidden", !isActive);
    if (textInput) {
      textInput.required = isActive;
      if (!isActive) {
        textInput.value = "";
      }
    }
  }

  function syncOtherFields() {
    otherOptionInputs.forEach(setOtherFieldState);
  }

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

    if (event.target) {
      const groupedOtherInputs = otherOptionInputs.filter((input) => input.name === event.target.name);
      if (groupedOtherInputs.length) {
        groupedOtherInputs.forEach(setOtherFieldState);
      }
    }
  });

  // Ensure initial state
  if (!document.querySelector('input[name="academicChallenges"]:checked')) {
    academicChallengeDetailsWrap.classList.add("hidden");
    academicChallengeDetails.required = false;
  }

  syncOtherFields();

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

  function textValue(formData, key) {
    return String(formData.get(key) || "").trim();
  }

  function resolveOtherSingle(formData, fieldName, otherFieldName) {
    const selected = textValue(formData, fieldName);
    if (selected !== "Other") return selected;

    const otherValue = textValue(formData, otherFieldName);
    return otherValue ? `Other: ${otherValue}` : "Other";
  }

  function resolveOtherMulti(formData, fieldName, otherFieldName) {
    const values = formValues(formData, fieldName);
    if (!values.includes("Other")) return values;

    const otherValue = textValue(formData, otherFieldName);
    return values
      .filter((value) => value !== "Other")
      .concat(otherValue ? [`Other: ${otherValue}`] : ["Other"]);
  }

  function toNumber(value) {
    return Number.parseInt(value, 10) || 0;
  }

  // Submission Collection & Validation
  function collectSubmission(form) {
    const formData = new FormData(form);
    const academicChallenges = formData.get("academicChallenges");
    const challengeDetails = textValue(formData, "academicChallengeDetails");

    return {
      submittedAt: new Date().toISOString(),
      fullName: textValue(formData, "fullName"),
      email: textValue(formData, "email"),
      institution: textValue(formData, "institution"),
      degreeField: textValue(formData, "degreeField"),
      journeySummary: textValue(formData, "journeySummary"),
      batchProgram: textValue(formData, "batchProgram"),
      currentStatus: resolveOtherSingle(formData, "currentStatus", "currentStatusOther"),
      overallExperience: toNumber(formData.get("overallExperience")),
      improvementAreas: resolveOtherMulti(formData, "improvementAreas", "improvementAreasOther"),
      academicChallengeTypes: resolveOtherMulti(formData, "academicChallengeTypes", "academicChallengeTypesOther"),
      mostImpactfulPart: textValue(formData, "mostImpactfulPart"),
      academicChallenges: academicChallenges === "Yes",
      academicChallengeDetails: academicChallenges === "Yes" ? challengeDetails : "",
      personalChallenges: resolveOtherMulti(formData, "personalChallenges", "personalChallengesOther"),
      mentorshipHelped: textValue(formData, "mentorshipHelped"),
      willingToMentor: textValue(formData, "willingToMentor"),
      mentorPreference: textValue(formData, "mentorPreference"),
      teamSupport: toNumber(formData.get("teamSupport")),
      learningUsefulness: toNumber(formData.get("learningUsefulness")),
      futureConfidence: textValue(formData, "futureConfidence"),
      confidenceScale: toNumber(formData.get("confidenceScale")),
      futureHelpfulSkills: textValue(formData, "futureHelpfulSkills"),
      internships: textValue(formData, "internships"),
      internshipExperience: textValue(formData, "internshipExperience"),
      internshipLesson: textValue(formData, "internshipLesson"),
      improvementSuggestion: textValue(formData, "improvementSuggestion"),
      recommendKarta: textValue(formData, "recommendKarta"),
      postGradPlans: resolveOtherSingle(formData, "postGradPlans", "postGradPlansOther"),
      carryForward: textValue(formData, "carryForward"),
      proudMoment: textValue(formData, "proudMoment"),
      advice: textValue(formData, "advice"),
      finalMessage: textValue(formData, "finalMessage"),
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

    if (submission.currentStatus === "Other" || submission.improvementAreas.includes("Other") || submission.academicChallengeTypes.includes("Other") || submission.personalChallenges.includes("Other") || submission.postGradPlans === "Other") {
      return "Please specify each selected Other option.";
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
      academicChallengeDetails.required = false;
      syncOtherFields();
      
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

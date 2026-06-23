/* Unified Contact Form — shared across index.html and all service landing pages.
   Mounts into any <div id="unified-contact-form" data-source="..."></div>. */
(function () {
  "use strict";

  var CALENDAR_URL = "https://calendar.app.google/WmTZX6wxqDUmcjMcA";
  var FORMSPREE_ACTION = "https://formspree.io/f/mjgdzkyp";
  var CONVERSION_SEND_TO = "AW-18179723592/nziNCPC_xLEcEMii4txD";

  var CATEGORIES = [
    {
      emoji: "🤝",
      en: "Long-term technical partner",
      es: "Acompañamiento técnico a largo plazo",
    },
    {
      emoji: "🔌",
      en: "Payment integration (Stripe)",
      es: "Integración de pagos (Stripe)",
    },
    {
      emoji: "☁️",
      en: "Production deployment issues",
      es: "Problemas de despliegue en producción",
    },
    {
      emoji: "🔒",
      en: "Security concerns with AI-generated code",
      es: "Seguridad de código hecho con IA",
    },
    {
      emoji: "✏️",
      en: "Other",
      es: "Otro",
      other: true,
    },
  ];

  // FUNCIÓN CRIPTOGRÁFICA: Convierte el email a SHA-256
  async function hashSHA256(text) {
    var cleanText = String(text || "")
      .trim()
      .toLowerCase();
    if (!cleanText) return null;
    var msgBuffer = new TextEncoder().encode(cleanText);
    var hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  // Envió de Lead a Reddit con la clave correcta exigida por su API
  async function fireRedditLead(emailValue) {
    if (typeof window.rdt === "function") {
      if (emailValue) {
        try {
          var hashedEmail = await hashSHA256(emailValue);
          window.rdt("track", "Lead", { email: hashedEmail }); // <-- CORREGIDO: 'email' activa los Match Keys
        } catch (e) {
          window.rdt("track", "Lead");
        }
      } else {
        window.rdt("track", "Lead");
      }
    }
  }

  function fireGoogleConversion() {
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", { send_to: CONVERSION_SEND_TO });
    }
  }

  function escapeAttr(value) {
    return String(value).replace(/"/g, "&quot;");
  }

  function buildCategoryButtons() {
    return CATEGORIES.map(function (cat) {
      return (
        '<button type="button" class="option-btn ucf-category-btn" data-category-en="' +
        escapeAttr(cat.en) +
        '" data-category-es="' +
        escapeAttr(cat.es) +
        '"' +
        (cat.other ? ' data-other="true"' : "") +
        ">" +
        '<span class="ucf-emoji">' +
        cat.emoji +
        "</span>" +
        '<span class="en">' +
        cat.en +
        "</span>" +
        '<span class="es">' +
        cat.es +
        "</span>" +
        "</button>"
      );
    }).join("");
  }

  function buildFormHTML(source) {
    return (
      '<div class="ucf-card">' +
      '<form id="unifiedContactForm" action="' +
      FORMSPREE_ACTION +
      '" method="POST">' +
      '<input type="hidden" name="source" value="' +
      escapeAttr(source) +
      '" />' +
      '<input type="hidden" name="category" id="ucfCategoryField" value="" />' +
      '<div class="ucf-step" id="ucfStep12">' +
      '<h3 class="step-title-wizard">' +
      '<span class="en">What do you need help with?</span>' +
      '<span class="es">¿Con qué necesitas ayuda?</span>' +
      "</h3>" +
      '<div class="ucf-category-grid">' +
      buildCategoryButtons() +
      "</div>" +
      '<p class="ucf-field-error" id="ucfCategoryError" hidden>' +
      '<span class="en">Please select a category to continue.</span>' +
      '<span class="es">Selecciona una categoría para continuar.</span>' +
      "</p>" +
      '<div class="form-field ucf-other-detail" id="ucfOtherDetail" hidden>' +
      '<label class="form-field-label">' +
      '<span class="en">Tell us what you need</span>' +
      '<span class="es">Cuéntanos qué necesitas</span>' +
      "</label>" +
      '<textarea name="other_detail" id="ucfOtherDetailInput" class="form-input" ' +
      'data-ph-en="Describe what you\'re looking for..." ' +
      'data-ph-es="Describe lo que necesitas..." ' +
      "></textarea>" +
      '<p class="ucf-field-error" id="ucfOtherDetailError" hidden>' +
      '<span class="en">Please tell us a bit more.</span>' +
      '<span class="es">Cuéntanos un poco más.</span>' +
      "</p>" +
      "</div>" +
      '<div class="form-field ucf-email-field">' +
      '<label class="form-field-label">' +
      '<span class="en">Your email</span>' +
      '<span class="es">Tu email</span>' +
      "</label>" +
      '<input type="email" name="email" id="ucfEmailInput" class="form-input" ' +
      'data-ph-en="you@yourcompany.com" data-ph-es="tu@empresa.com" ' +
      'placeholder="you@yourcompany.com" required />' +
      '<p class="ucf-field-error" id="ucfEmailError" hidden>' +
      '<span class="en">Please enter a valid email address.</span>' +
      '<span class="es">Introduce un email válido.</span>' +
      "</p>" +
      "</div>" +
      '<button type="button" class="button btn-submit" id="ucfContinueBtn">' +
      '<span class="en">Continue →</span>' +
      '<span class="es">Continuar →</span>' +
      "</button>" +
      "</div>" +
      '<div class="ucf-step" id="ucfStep3" hidden>' +
      '<div class="step2-header-badge" id="ucfStep3Selected"></div>' +
      '<h3 class="step-title-wizard">' +
      '<span class="en">How would you like to proceed?</span>' +
      '<span class="es">¿Cómo prefieres continuar?</span>' +
      "</h3>" +
      '<div class="option-vertical-list">' +
      '<button type="button" class="option-btn" id="ucfBookCallBtn">' +
      "<span>" +
      '<span class="ucf-emoji">📅</span> ' +
      '<span class="en">Book a 15-min call</span>' +
      '<span class="es">Reservar llamada de 15 min</span>' +
      "</span>" +
      '<span class="btn-arrow">→</span>' +
      "</button>" +
      '<button type="button" class="option-btn" id="ucfWriteFirstBtn">' +
      "<span>" +
      '<span class="ucf-emoji">✍️</span> ' +
      '<span class="en">I\'d rather write first</span>' +
      '<span class="es">Prefiero escribir primero</span>' +
      "</span>" +
      '<span class="btn-arrow">→</span>' +
      "</button>" +
      "</div>" +
      '<div class="ucf-step" id="ucfWriteBlock" hidden>' +
      '<div class="form-field">' +
      '<label class="form-field-label">' +
      '<span class="en">What\'s broken / what do you need?</span>' +
      '<span class="es">¿Qué está fallando / qué necesitas?</span>' +
      "</label>" +
      '<textarea name="message" id="ucfMessageInput" class="form-input" ' +
      'data-ph-en="e.g., Stripe webhooks returning 500, deployment failing, exposed API keys..." ' +
      'data-ph-es="ej., Webhooks de Stripe devuelven 500, falla el despliegue, API keys expuestas..." ' +
      "></textarea>" +
      "</div>" +
      '<button type="submit" class="button btn-submit" id="ucfSendBtn">' +
      '<span class="en">Send message →</span>' +
      '<span class="es">Enviar mensaje →</span>' +
      "</button>" +
      "</div>" +
      "</div>" +
      "</form>" +
      "</div>"
    );
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function currentLang() {
    return document.documentElement.lang === "es" ? "es" : "en";
  }

  function wireForm(root) {
    var categoryButtons = root.querySelectorAll(".ucf-category-btn");
    var categoryField = root.querySelector("#ucfCategoryField");
    var categoryError = root.querySelector("#ucfCategoryError");
    var otherDetail = root.querySelector("#ucfOtherDetail");
    var otherDetailInput = root.querySelector("#ucfOtherDetailInput");
    var otherDetailError = root.querySelector("#ucfOtherDetailError");
    var emailInput = root.querySelector("#ucfEmailInput");
    var emailError = root.querySelector("#ucfEmailError");
    var continueBtn = root.querySelector("#ucfContinueBtn");
    var step12 = root.querySelector("#ucfStep12");
    var step3 = root.querySelector("#ucfStep3");
    var step3Selected = root.querySelector("#ucfStep3Selected");
    var bookCallBtn = root.querySelector("#ucfBookCallBtn");
    var writeFirstBtn = root.querySelector("#ucfWriteFirstBtn");
    var writeBlock = root.querySelector("#ucfWriteBlock");
    var messageInput = root.querySelector("#ucfMessageInput");
    var form = root.querySelector("#unifiedContactForm");
    var sourceInput = form.querySelector('input[name="source"]');

    var selectedLabel = { en: "", es: "" };
    var isOtherSelected = false;

    emailInput.addEventListener(
      "focus",
      function () {
        if (typeof window.rdt === "function") {
          window.rdt("track", "ViewContent");
        }
      },
      { once: true },
    );

    categoryButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        categoryButtons.forEach(function (b) {
          b.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");
        selectedLabel.en = btn.getAttribute("data-category-en");
        selectedLabel.es = btn.getAttribute("data-category-es");
        categoryField.value = selectedLabel.en;
        categoryError.hidden = true;

        isOtherSelected = btn.hasAttribute("data-other");
        otherDetail.hidden = !isOtherSelected;
        if (isOtherSelected) {
          otherDetailInput.focus();
        } else {
          otherDetailError.hidden = true;
        }
      });
    });

    emailInput.addEventListener("input", function () {
      emailError.hidden = true;
    });

    otherDetailInput.addEventListener("input", function () {
      otherDetailError.hidden = true;
    });

    continueBtn.addEventListener("click", function () {
      var valid = true;
      if (!categoryField.value) {
        categoryError.hidden = false;
        valid = false;
      }
      if (isOtherSelected && !otherDetailInput.value.trim()) {
        otherDetailError.hidden = false;
        valid = false;
      } else {
        otherDetailError.hidden = true;
      }
      if (!isValidEmail(emailInput.value)) {
        emailError.hidden = false;
        valid = false;
      } else {
        emailError.hidden = true;
      }
      if (!valid) return;

      var lang = currentLang();
      var prefix = lang === "es" ? "Categoría: " : "Category: ";
      var label = selectedLabel[lang];
      if (isOtherSelected) {
        var detail = otherDetailInput.value.trim();
        if (detail) {
          label +=
            ": " + (detail.length > 60 ? detail.slice(0, 60) + "…" : detail);
        }
      }
      step3Selected.textContent = prefix + label;

      step12.hidden = true;
      step3.hidden = false;
      step3.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    bookCallBtn.addEventListener("click", function () {
      window.open(CALENDAR_URL, "_blank", "noopener");

      fireGoogleConversion();

      var emailValue = emailInput.value;
      fireRedditLead(emailValue).then(function () {
        try {
          var data = new FormData();
          data.append("source", sourceInput.value);
          data.append("category", categoryField.value);
          data.append("email", emailValue);
          data.append("intent", "book_call");
          if (isOtherSelected && otherDetailInput.value.trim()) {
            data.append("other_detail", otherDetailInput.value.trim());
          }
          fetch(FORMSPREE_ACTION, {
            method: "POST",
            body: data,
            headers: { Accept: "application/json" },
          }).catch(function () {});
        } catch (err) {}
      });
    });

    writeFirstBtn.addEventListener("click", function () {
      writeBlock.hidden = false;
      messageInput.focus();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      fireGoogleConversion();

      var emailValue = emailInput.value;
      fireRedditLead(emailValue).then(function () {
        form.submit();
      });
    });
  }

  function injectInto(mount) {
    var source = mount.getAttribute("data-source") || "unknown";
    mount.innerHTML = buildFormHTML(source);
    if (typeof window.setLang === "function") {
      window.setLang(currentLang());
    }
    wireForm(mount);
  }

  function init() {
    var mount = document.getElementById("unified-contact-form");
    if (mount) injectInto(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

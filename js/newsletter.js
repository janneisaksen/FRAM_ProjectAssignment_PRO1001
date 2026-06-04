/**
 * Validates the newsletter form before submission.
 * Shows error messages next to each field and replaces
 * the form with a success message when all fields pass.
 */

// ── Functional helpers ──────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules = {
  firstName: (value) => {
    if (!value) return 'Please enter your first name.';
    if (value.length < 2) return 'Name must be at least 2 characters.';
    return null;
  },
  email: (value) => {
    if (!value) return 'Please enter your e-mail address.';
    if (!EMAIL_RE.test(value)) return 'Please enter a valid e-mail address.';
    return null;
  },
};

const getOrCreateError = (field) => {
  const id = `${field.name}-error`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('span');
    el.id = id;
    el.className = 'form-field-error';
    el.setAttribute('aria-live', 'polite');
    field.insertAdjacentElement('afterend', el);
  }
  field.setAttribute('aria-describedby', id);
  return el;
};

// ── OOP: FormValidator class ─────────────────────────────────

class FormValidator {
  #form;
  #fields;
  #touched;

  constructor(formElement) {
    this.#form = formElement;
    this.#fields = Array.from(formElement.querySelectorAll('input'));
    this.#touched = new Set();

    this.#form.setAttribute('novalidate', '');
    this.#bindEvents();
  }

  // Validate a single field; returns true if valid
  validateField(field) {
    const value = field.value.trim();
    const rule = rules[field.name];
    const errorMessage = rule?.(value) ?? null;

    const errEl = getOrCreateError(field);

    if (errorMessage) {
      errEl.textContent = errorMessage;
      field.classList.add('field-invalid');
      field.classList.remove('field-valid');
      field.setAttribute('aria-invalid', 'true');
      return false;
    }

    errEl.textContent = '';
    field.classList.remove('field-invalid');
    field.classList.add('field-valid');
    field.setAttribute('aria-invalid', 'false');
    return true;
  }

  // Validate all fields; returns true if every field passes
  validateAll() {
    return this.#fields.map((f) => this.validateField(f)).every(Boolean);
  }

  #bindEvents() {
    this.#fields.forEach((field) => {
      field.addEventListener('blur', () => {
        this.#touched.add(field.name);
        this.validateField(field);
      });

      field.addEventListener('input', () => {
        if (this.#touched.has(field.name)) this.validateField(field);
      });
    });

    this.#form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!this.validateAll()) {
        const firstInvalid = this.#fields.find(
          (f) => f.getAttribute('aria-invalid') === 'true'
        );
        firstInvalid?.focus();
        return;
      }

      this.#showSuccess();
    });
  }

  #showSuccess() {
    const msg = document.createElement('p');
    msg.className = 'form-success-message';
    msg.setAttribute('role', 'status');
    msg.textContent = "You're signed up — thanks!";
    this.#form.replaceWith(msg);
  }
}

// ── Bootstrap ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('.newsletter-form')
    .forEach((form) => new FormValidator(form));
});

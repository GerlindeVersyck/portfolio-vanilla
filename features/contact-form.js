import {
  getValidationMessages,
  validateContactField,
  validateContactForm,
  isContactFormValid,
} from '../utils/validators.js';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/your_formspree_endpoint';

export class ContactForm {
  constructor() {
    this.form = document.getElementById('contact-form');

    if (!this.form) {
      console.warn('ContactForm: #contact-form niet gevonden');
      return;
    }

    this.nameInput = document.getElementById('name');
    this.emailInput = document.getElementById('email');
    this.messageInput = document.getElementById('message');
    this.submitBtn = this.form.querySelector('.submit-btn');
    this.feedback = document.getElementById('form-feedback');

    this.fields = {
      name: {
        input: this.nameInput,
        error: document.getElementById('name-error'),
      },
      email: {
        input: this.emailInput,
        error: document.getElementById('email-error'),
      },
      message: {
        input: this.messageInput,
        error: document.getElementById('message-error'),
      },
    };

    if (
      !this.nameInput ||
      !this.emailInput ||
      !this.messageInput ||
      !this.submitBtn ||
      !this.feedback ||
      !this.fields.name.error ||
      !this.fields.email.error ||
      !this.fields.message.error
    ) {
      console.warn('ContactForm: vereiste form elementen ontbreken');
      return;
    }

    this.init();
  }

  init() {
    Object.entries(this.fields).forEach(([fieldName, field]) => {
      const handleFieldChange = () => {
        this.renderFieldValidation(fieldName, validateContactField(fieldName, field.input.value));
        this.clearFeedback();
        this.updateSubmitState();
      };

      field.input.addEventListener('input', handleFieldChange);
      field.input.addEventListener('blur', handleFieldChange);
    });

    this.form.addEventListener('submit', (event) => this.handleSubmit(event));
    this.form.addEventListener('contact:reset', () => this.clearForm());

    this.updateSubmitState();
  }

  getFormValues() {
    return {
      name: this.nameInput.value,
      email: this.emailInput.value,
      message: this.messageInput.value,
    };
  }

  renderFieldValidation(fieldName, result) {
    const field = this.fields[fieldName];

    if (!field) {
      return;
    }

    field.input.classList.toggle('error', !result.isValid);
    field.error.textContent = result.message;
  }

  renderFormValidation(validation) {
    Object.entries(validation.fields).forEach(([fieldName, result]) => {
      this.renderFieldValidation(fieldName, result);
    });
  }

  updateSubmitState() {
    this.submitBtn.disabled = !isContactFormValid(this.getFormValues());
  }

  showFeedback(message) {
    this.feedback.textContent = message || '';
  }

  clearFeedback() {
    this.showFeedback('');
  }

  clearErrors() {
    Object.keys(this.fields).forEach((fieldName) => {
      this.renderFieldValidation(fieldName, { isValid: true, message: '' });
    });
  }

  clearForm() {
    this.form.reset();
    this.clearErrors();
    this.clearFeedback();
    this.updateSubmitState();
  }

  handleSubmit(event) {
    event.preventDefault();

    const validation = validateContactForm(this.getFormValues());
    const messages = getValidationMessages();

    this.renderFormValidation(validation);
    this.updateSubmitState();

    if (!validation.isValid) {
      this.showFeedback(messages.feedback.invalid);
      this.form.dispatchEvent(new CustomEvent('contact:error', { bubbles: true }));
      return;
    }

    this.submitForm();
  }

  async submitForm() {
    const messages = getValidationMessages();
    const originalText = this.submitBtn.textContent;
    const formData = {
      name: this.nameInput.value.trim(),
      email: this.emailInput.value.trim(),
      message: this.messageInput.value.trim(),
    };

    this.clearFeedback();
    this.submitBtn.disabled = true;
    this.submitBtn.textContent = messages.feedback.sending;

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      this.clearForm();
      this.submitBtn.textContent = originalText;

      this.form.dispatchEvent(
        new CustomEvent('contact:success', {
          bubbles: true,
          detail: {
            title: messages.feedback.successTitle,
            message: messages.feedback.successMessage,
          },
        })
      );
    } catch {
      this.submitBtn.textContent = originalText;
      this.updateSubmitState();
      this.showFeedback(messages.feedback.error);
      this.form.dispatchEvent(new CustomEvent('contact:error', { bubbles: true }));
    }
  }
}

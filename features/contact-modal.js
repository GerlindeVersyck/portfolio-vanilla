export class ContactModal {
  constructor() {
    this.openButton = document.getElementById('contact-open-btn');
    this.modal = document.getElementById('contact-modal');
    this.closeButtons = document.querySelectorAll('[data-contact-close]');
    this.form = document.getElementById('contact-form');
    this.formView = document.getElementById('contact-form-view');
    this.successView = document.getElementById('contact-success-view');
    this.successTitle = document.getElementById('contact-success-title');
    this.successMessage = document.getElementById('contact-success-message');
    this.successCloseButton = document.getElementById('contact-success-close-btn');

    if (!this.openButton || !this.modal) {
      return;
    }

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleFormSuccess = this.handleFormSuccess.bind(this);
    this.handleFormError = this.handleFormError.bind(this);

    this.init();
  }

  init() {
    this.openButton.addEventListener('click', () => this.openModal());

    this.closeButtons.forEach((button) => {
      button.addEventListener('click', () => this.closeModal());
    });

    if (this.successCloseButton) {
      this.successCloseButton.addEventListener('click', () => this.closeModal());
    }

    if (this.form) {
      this.form.addEventListener('contact:success', this.handleFormSuccess);
      this.form.addEventListener('contact:error', this.handleFormError);
    }
  }

  openModal() {
    this.showFormView();
    this.modal.hidden = false;
    this.modal.setAttribute('aria-hidden', 'false');
    this.openButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', this.handleKeydown);

    const firstInput = this.modal.querySelector('#name');

    if (firstInput) {
      setTimeout(() => {
        firstInput.focus();
      }, 0);
    }
  }

  closeModal() {
    this.modal.hidden = true;
    this.modal.setAttribute('aria-hidden', 'true');
    this.openButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleKeydown);

    this.showFormView();

    if (this.successTitle) {
      this.successTitle.textContent = '';
    }

    if (this.successMessage) {
      this.successMessage.textContent = '';
    }

    if (this.form) {
      this.form.dispatchEvent(
        new CustomEvent('contact:reset', {
          bubbles: true,
        })
      );
    }

    this.openButton.focus();
  }

  showFormView() {
    if (this.formView) {
      this.formView.hidden = false;
    }

    if (this.successView) {
      this.successView.hidden = true;
    }
  }

  showSuccessView(title, message) {
    if (this.formView) {
      this.formView.hidden = true;
    }

    if (this.successView) {
      this.successView.hidden = false;
    }

    if (this.successTitle) {
      this.successTitle.textContent = title;
    }

    if (this.successMessage) {
      this.successMessage.textContent = message;
    }

    if (this.successCloseButton) {
      setTimeout(() => {
        this.successCloseButton.focus();
      }, 0);
    }
  }

  handleKeydown(event) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  handleFormSuccess(event) {
    const { title, message } = event.detail || {};
    this.showSuccessView(title || 'Message sent', message || 'Your message has been sent.');
  }

  handleFormError() {
    this.showFormView();
  }
}

import I18N from './i18n-translations.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_FIELDS = ['name', 'email', 'message'];

const getTranslations = () => I18N.getTranslations?.() || {};

const getValidationMessages = () => {
  const translations = getTranslations();

  return {
    name: {
      required: translations.contact?.validation?.name?.required || 'Name is required',
      minLength:
        translations.contact?.validation?.name?.minLength ||
        'Name must contain at least 3 characters',
    },
    email: {
      required: translations.contact?.validation?.email?.required || 'Email is required',
      invalid:
        translations.contact?.validation?.email?.invalid || 'Please enter a valid email address',
    },
    message: {
      required: translations.contact?.validation?.message?.required || 'Message is required',
      minLength:
        translations.contact?.validation?.message?.minLength ||
        'Message must contain at least 10 characters',
    },
    feedback: {
      invalid: translations.contact?.feedback?.invalid || 'Please complete all fields correctly.',
      sending: translations.contact?.feedback?.sending || 'Sending...',
      successTitle: translations.contact?.feedback?.successTitle || 'Message sent',
      successMessage:
        translations.contact?.feedback?.successMessage ||
        'Your message has been sent successfully. I will reply as soon as possible.',
      error:
        translations.contact?.feedback?.error ||
        'Something went wrong while sending your message. Please try again.',
    },
  };
};

const normalizeValue = (value) => String(value ?? '').trim();

const validateName = (value, messages) => {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return {
      isValid: false,
      message: messages.name.required,
    };
  }

  if (normalized.length < 3) {
    return {
      isValid: false,
      message: messages.name.minLength,
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

const validateEmail = (value, messages) => {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return {
      isValid: false,
      message: messages.email.required,
    };
  }

  if (!EMAIL_REGEX.test(normalized)) {
    return {
      isValid: false,
      message: messages.email.invalid,
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

const validateMessage = (value, messages) => {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return {
      isValid: false,
      message: messages.message.required,
    };
  }

  if (normalized.length < 10) {
    return {
      isValid: false,
      message: messages.message.minLength,
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

const validateContactField = (fieldName, value) => {
  const messages = getValidationMessages();

  switch (fieldName) {
    case 'name':
      return validateName(value, messages);
    case 'email':
      return validateEmail(value, messages);
    case 'message':
      return validateMessage(value, messages);
    default:
      return {
        isValid: false,
        message: '',
      };
  }
};

const validateContactForm = (values = {}) => {
  const fields = {
    name: validateContactField('name', values.name),
    email: validateContactField('email', values.email),
    message: validateContactField('message', values.message),
  };

  return {
    isValid: CONTACT_FIELDS.every((fieldName) => fields[fieldName].isValid),
    fields,
  };
};

const isContactFormValid = (values = {}) => validateContactForm(values).isValid;

export { getValidationMessages, validateContactField, validateContactForm, isContactFormValid };

import '../css/feedback-modal.css';
import iconsUrl from '../img/icons.svg?url';

class FeedbackModal {
  constructor() {
    this.modal = document.getElementById('feedbackModal');
    this.form = document.getElementById('feedbackForm');
    this.overlay = this.modal?.querySelector('.feedback-modal__overlay');
    this.closeBtn = this.modal?.querySelector('.feedback-modal__close');
    this.submitBtn = this.modal?.querySelector('.feedback-modal__submit');
    this.loader = this.modal?.querySelector('.feedback-modal__loader');
    this.submitText = this.modal?.querySelector('.feedback-modal__submit-text');
    this.notification = null;

    this.currentRating = 0;
    this.isSubmitting = false;
    this.eventListeners = new Map();

    this.init();
  }

  init() {
    if (!this.modal) return;

    this.updateIconUrls();
    this.bindEvents();
  }

  updateIconUrls() {
    const svgElements = this.modal.querySelectorAll('svg use');
    svgElements.forEach(use => {
      const href = use.getAttribute('href');
      if (href && href.startsWith('#')) {
        use.setAttribute('href', `${iconsUrl}${href}`);
      }
    });
  }

  bindEvents() {
    this.closeHandler = () => this.close();
    this.overlayHandler = () => this.close();
    this.escHandler = e => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    };
    this.submitHandler = e => this.handleSubmit(e);

    this.eventListeners.set(this.closeBtn, {
      type: 'click',
      handler: this.closeHandler,
    });
    this.eventListeners.set(this.overlay, {
      type: 'click',
      handler: this.overlayHandler,
    });
    this.eventListeners.set(this.form, {
      type: 'submit',
      handler: this.submitHandler,
    });

    this.closeBtn?.addEventListener('click', this.closeHandler);
    this.overlay?.addEventListener('click', this.overlayHandler);
    this.form?.addEventListener('submit', this.submitHandler);

    this.bindRatingEvents();
    this.bindValidationEvents();
    this.bindOpenButtons();
  }

  bindOpenButtons() {
    const dataButtons = document.querySelectorAll('[data-feedback-modal]');
    const classButtons = document.querySelectorAll('.feedback-modal-trigger');

    const openHandler = () => this.open();

    dataButtons.forEach(btn => {
      btn.addEventListener('click', openHandler);
      this.eventListeners.set(btn, { type: 'click', handler: openHandler });
    });

    classButtons.forEach(btn => {
      btn.addEventListener('click', openHandler);
      this.eventListeners.set(btn, { type: 'click', handler: openHandler });
    });
  }

  bindRatingEvents() {
    const stars = this.modal?.querySelectorAll('.feedback-modal__star');
    if (!stars) return;

    stars.forEach((star, index) => {
      const mouseEnterHandler = () => this.highlightStars(index + 1);
      const clickHandler = () => this.setRating(index + 1);

      star.addEventListener('mouseenter', mouseEnterHandler);
      star.addEventListener('click', clickHandler);

      this.eventListeners.set(star, [
        { type: 'mouseenter', handler: mouseEnterHandler },
        { type: 'click', handler: clickHandler },
      ]);
    });

    const ratingContainer = this.modal?.querySelector(
      '.feedback-modal__rating'
    );
    const mouseLeaveHandler = () => this.highlightStars(this.currentRating);

    ratingContainer?.addEventListener('mouseleave', mouseLeaveHandler);
    this.eventListeners.set(ratingContainer, {
      type: 'mouseleave',
      handler: mouseLeaveHandler,
    });
  }

  bindValidationEvents() {
    const nameInput = this.modal?.querySelector('#feedbackName');
    const messageInput = this.modal?.querySelector('#feedbackMessage');

    const nameInputHandler = () => this.validateName();
    const messageInputHandler = () => this.validateMessage();

    nameInput?.addEventListener('input', nameInputHandler);
    nameInput?.addEventListener('blur', nameInputHandler);
    messageInput?.addEventListener('input', messageInputHandler);
    messageInput?.addEventListener('blur', messageInputHandler);

    this.eventListeners.set(nameInput, [
      { type: 'input', handler: nameInputHandler },
      { type: 'blur', handler: nameInputHandler },
    ]);
    this.eventListeners.set(messageInput, [
      { type: 'input', handler: messageInputHandler },
      { type: 'blur', handler: messageInputHandler },
    ]);
  }

  highlightStars(rating) {
    const stars = this.modal?.querySelectorAll('.feedback-modal__star');
    if (!stars) return;

    stars.forEach((star, index) => {
      const use = star.querySelector('use');
      if (index < rating) {
        use?.setAttribute('href', `${iconsUrl}#icon-purple-star`);
        star.classList.add('active');
      } else {
        use?.setAttribute('href', `${iconsUrl}#icon-white-star`);
        star.classList.remove('active');
      }
    });
  }

  setRating(rating) {
    this.currentRating = rating;
    this.highlightStars(rating);
    this.clearError('ratingError');
  }

  validateName() {
    const nameInput = this.modal?.querySelector('#feedbackName');
    const value = nameInput?.value.trim() || '';

    if (value.length === 0) {
      this.showError('nameError', 'Поле імені не може бути порожнім');
      return false;
    }

    if (value.length < 2) {
      this.showError('nameError', "Ім'я повинно містити щонайменше 2 символи");
      return false;
    }

    if (value.length > 25) {
      this.showError('nameError', "Ім'я не повинно перевищувати 25 символів");
      return false;
    }

    this.clearError('nameError');
    return true;
  }

  validateMessage() {
    const messageInput = this.modal?.querySelector('#feedbackMessage');
    const value = messageInput?.value.trim() || '';

    if (value.length === 0) {
      this.showError('messageError', 'Поле повідомлення не може бути порожнім');
      return false;
    }

    if (value.length < 10) {
      this.showError(
        'messageError',
        'Повідомлення повинно містити щонайменше 10 символів'
      );
      return false;
    }

    if (value.length > 512) {
      this.showError(
        'messageError',
        'Повідомлення не повинно перевищувати 512 символів'
      );
      return false;
    }

    this.clearError('messageError');
    return true;
  }

  validateRating() {
    if (this.currentRating === 0) {
      this.showError('ratingError', 'Будь ласка, виберіть рейтинг');
      return false;
    }

    this.clearError('ratingError');
    return true;
  }

  showError(errorId, message) {
    const errorElement = this.modal?.querySelector(`#${errorId}`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearError(errorId) {
    const errorElement = this.modal?.querySelector(`#${errorId}`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  clearAllErrors() {
    const errors = this.modal?.querySelectorAll('.feedback-modal__error');
    errors?.forEach(error => {
      error.textContent = '';
      error.style.display = 'none';
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    const isNameValid = this.validateName();
    const isMessageValid = this.validateMessage();
    const isRatingValid = this.validateRating();

    if (!isNameValid || !isMessageValid || !isRatingValid) {
      return;
    }

    const formData = this.getFormData();
    await this.submitFeedback(formData);
  }

  getFormData() {
    const nameInput = this.modal?.querySelector('#feedbackName');
    const messageInput = this.modal?.querySelector('#feedbackMessage');

    return {
      name: nameInput?.value.trim() || '',
      descr: messageInput?.value.trim() || '',
      rating: this.currentRating,
    };
  }

  async submitFeedback(formData) {
    try {
      this.setSubmittingState(true);

      const res = await fetch('https://sound-wave.b.goit.study/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Feedback submitted successfully:', data);

      this.showSuccessMessage();

      setTimeout(() => this.close(), 1000);
      this.showNotification();
      this.resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      this.showErrorMessage('Помилка при відправці. Спробуйте ще раз.');
    } finally {
      this.setSubmittingState(false);
    }
  }

  setSubmittingState(isSubmitting) {
    this.isSubmitting = isSubmitting;

    if (this.submitBtn) {
      this.submitBtn.disabled = isSubmitting;
    }

    if (this.loader && this.submitText) {
      if (isSubmitting) {
        this.loader.style.display = 'block';
        this.submitText.style.display = 'none';
      } else {
        this.loader.style.display = 'none';
        this.submitText.style.display = 'block';
      }
    }
  }

  showSuccessMessage() {
    if (this.submitText) {
      this.submitText.textContent = 'Submitted!';
    }
  }

  showErrorMessage(message) {
    this.showError('ratingError', message);
  }

  showNotification() {
    if (this.notification) {
      this.notification.remove();
    }

    this.notification = document.createElement('div');
    this.notification.className = 'feedback-modal__notification';
    this.notification.textContent = 'Feedback submitted successfully!';
    this.modal.appendChild(this.notification);

    setTimeout(() => {
      this.notification?.remove();
      this.notification = null;
    }, 2000);
  }

  open() {
    if (!this.modal) return;
    document.body.style.overflow = 'hidden';
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    window.addEventListener('keydown', this.escHandler);
    const firstInput = this.modal.querySelector('#feedbackName');
    setTimeout(() => firstInput?.focus(), 100);
  }

  close() {
    if (!this.modal) return;
    document.body.style.overflow = '';
    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    window.removeEventListener('keydown', this.escHandler);
    this.removeEventListeners();
    this.resetForm();
  }

  resetForm() {
    this.form?.reset();
    this.currentRating = 0;
    this.highlightStars(0);
    this.clearAllErrors();
    this.setSubmittingState(false);

    if (this.submitText) {
      this.submitText.textContent = 'Submit';
    }
  }

  removeEventListeners() {
    this.eventListeners.forEach((listeners, element) => {
      if (Array.isArray(listeners)) {
        listeners.forEach(({ type, handler }) => {
          if (type === 'keydown') {
            element.removeEventListener(type, handler);
          }
        });
      } else {
        if (listeners.type === 'keydown') {
          element.removeEventListener(listeners.type, listeners.handler);
        }
      }
    });
    this.eventListeners.clear();
  }

  isOpen() {
    return this.modal?.classList.contains('is-open') || false;
  }
}

let feedbackModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  feedbackModalInstance = new FeedbackModal();
});

window.openFeedbackModal = () => {
  feedbackModalInstance?.open();
};

window.closeFeedbackModal = () => {
  feedbackModalInstance?.close();
};

export default FeedbackModal;

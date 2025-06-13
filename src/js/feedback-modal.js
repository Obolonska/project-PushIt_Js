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

        try {
            this.init();
        } catch (err) {
            console.error('Initialization error:', err);
        }
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

    debounce(fn, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }

    bindEvents() {
        // Clear existing listeners to prevent duplicates
        this.removeEventListeners();

        const closeHandler = () => this.close();
        const overlayHandler = () => this.close();
        const escHandler = e => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        };
        const submitHandler = e => this.handleSubmit(e);

        this.eventListeners.set(this.closeBtn, {
            type: 'click',
            handler: closeHandler,
        });
        this.eventListeners.set(this.overlay, {
            type: 'click',
            handler: overlayHandler,
        });
        this.eventListeners.set(document, { type: 'keydown', handler: escHandler });
        this.eventListeners.set(this.form, {
            type: 'submit',
            handler: submitHandler,
        });

        this.closeBtn?.addEventListener('click', closeHandler);
        this.overlay?.addEventListener('click', overlayHandler);
        document.addEventListener('keydown', escHandler);
        this.form?.addEventListener('submit', submitHandler);

        this.bindRatingEvents();
        this.bindValidationEvents();
        this.bindOpenButtons();
        this.bindFocusTrap();
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
        const emailInput = this.modal?.querySelector('#feedbackEmail');
        const messageInput = this.modal?.querySelector('#feedbackMessage');

        const debouncedNameValidation = this.debounce(() => this.validateName(), 300);
        const debouncedEmailValidation = this.debounce(() => this.validateEmail(), 300);
        const debouncedMessageValidation = this.debounce(() => this.validateMessage(), 300);

        nameInput?.addEventListener('input', debouncedNameValidation);
        nameInput?.addEventListener('blur', () => this.validateName());
        emailInput?.addEventListener('input', debouncedEmailValidation);
        emailInput?.addEventListener('blur', () => this.validateEmail());
        messageInput?.addEventListener('input', debouncedMessageValidation);
        messageInput?.addEventListener('blur', () => this.validateMessage());

        this.eventListeners.set(nameInput, [
            { type: 'input', handler: debouncedNameValidation },
            { type: 'blur', handler: () => this.validateName() },
        ]);
        this.eventListeners.set(emailInput, [
            { type: 'input', handler: debouncedEmailValidation },
            { type: 'blur', handler: () => this.validateEmail() },
        ]);
        this.eventListeners.set(messageInput, [
            { type: 'input', handler: debouncedMessageValidation },
            { type: 'blur', handler: () => this.validateMessage() },
        ]);
    }

    bindFocusTrap() {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const trapHandler = e => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        this.modal.addEventListener('keydown', trapHandler);
        this.eventListeners.set(this.modal, {
            type: 'keydown',
            handler: trapHandler,
        });
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

        if (value.length > 16) {
            this.showError('nameError', "Ім'я не повинно перевищувати 16 символів");
            return false;
        }

        this.clearError('nameError');
        return true;
    }

    validateEmail() {
        const emailInput = this.modal?.querySelector('#feedbackEmail');
        const value = emailInput?.value.trim() || '';

        if (value.length === 0) {
            this.showError('emailError', 'Поле email не може бути порожнім');
            return false;
        }

        if (!value.includes('@')) {
            this.showError('emailError', 'Email повинен містити символ @');
            return false;
        }

        // Базова перевірка формату email (наприклад, щось@щось.щось)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.showError('emailError', 'Введіть коректну email-адресу');
            return false;
        }

        if (value.length > 64) {
            this.showError('emailError', 'Email не повинен перевищувати 64 символи');
            return false;
        }

        this.clearError('emailError');
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
        const isEmailValid = this.validateEmail();
        const isMessageValid = this.validateMessage();
        const isRatingValid = this.validateRating();

        if (!isNameValid || !isEmailValid || !isMessageValid || !isRatingValid) {
            return; // Форма не закривається при помилках валідації
        }

        const formData = this.getFormData();
        await this.submitFeedback(formData);
    }

    getFormData() {
        const nameInput = this.modal?.querySelector('#feedbackName');
        const emailInput = this.modal?.querySelector('#feedbackEmail');
        const messageInput = this.modal?.querySelector('#feedbackMessage');

        return {
            name: nameInput?.value.trim() || '',
            email: emailInput?.value.trim() || '',
            descr: messageInput?.value.trim() || '',
            rating: this.currentRating,
        };
    }

    async submitFeedback(formData) {
        try {
            this.setSubmittingState(true); // Показуємо лоадер

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const res = await fetch('https://sound-wave.b.goit.study/api/feedbacks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                let errorMessage = 'Помилка сервера. Спробуйте ще раз.';
                if (res.status === 400) {
                    errorMessage = 'Некоректні дані. Перевірте введені дані.';
                } else if (res.status === 429) {
                    errorMessage = 'Забагато запитів. Зачекайте хвилину.';
                } else if (res.status >= 500) {
                    errorMessage = 'Проблема на сервері. Спробуйте пізніше.';
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            console.log('Feedback submitted successfully:', data);

            this.showSuccessMessage();
            this.showNotification('Відгук успішно надіслано!', 'success');
            setTimeout(() => this.close(), 1000);
            this.resetForm();
        } catch (err) {
            console.error('Submit error:', err);
            let errorMessage = 'Помилка при відправці. Спробуйте ще раз.';
            if (err.name === 'AbortError') {
                errorMessage = 'Запит перевищив час очікування. Спробуйте ще раз.';
            } else if (err.message.includes('Failed to fetch')) {
                errorMessage = 'Проблема з мережею. Перевірте підключення.';
            } else {
                errorMessage = err.message || errorMessage;
            }
            this.showNotification(errorMessage, 'error');
        } finally {
            this.setSubmittingState(false); // Приховуємо лоадер
        }
    }

    setSubmittingState(isSubmitting) {
        this.isSubmitting = isSubmitting;

        if (this.submitBtn) {
            this.submitBtn.disabled = isSubmitting;
        }

        if (this.loader && this.submitText) {
            if (isSubmitting) {
                this.loader.style.display = 'flex'; // Показуємо лоадер
                this.submitText.style.display = 'none';
            } else {
                this.loader.style.display = 'none'; // Приховуємо лоадер
                this.submitText.style.display = 'inline';
            }
        }
    }

    showSuccessMessage() {
        if (this.submitText) {
            this.submitText.textContent = 'Submitted!';
        }
    }

    showNotification(message, type = 'success') {
        if (this.notification) {
            this.notification.remove();
        }

        this.notification = document.createElement('div');
        this.notification.className = `feedback-modal__notification feedback-modal__notification--${type}`;
        this.notification.textContent = message;
        this.modal.appendChild(this.notification);

        setTimeout(() => {
            this.notification?.remove();
            this.notification = null;
        }, 3000); // Збільшено час відображення до 3 секунд для помилок
    }

    open() {
        if (!this.modal) return;

        this.modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        this.bindEvents(); // Re-bind event listeners on open

        const firstInput = this.modal.querySelector('#feedbackName');
        setTimeout(() => firstInput?.focus(), 100);
    }

    close() {
        if (!this.modal) return;

        this.modal.classList.remove('is-open');
        document.body.style.overflow = '';

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
                    element.removeEventListener(type, handler);
                });
            } else {
                element.removeEventListener(listeners.type, listeners.handler);
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
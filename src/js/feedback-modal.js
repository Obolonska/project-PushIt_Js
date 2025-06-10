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

        this.currentRating = 0;
        this.isSubmitting = false;

        this.init();
    }

    init() {
        if (!this.modal) return;

        this.updateIconUrls();
        this.bindEvents();
    }

    updateIconUrls() {
        // Оновлюємо всі SVG іконки з правильними URL
        const svgElements = this.modal.querySelectorAll('svg use');
        svgElements.forEach(use => {
            const href = use.getAttribute('href');
            if (href && href.startsWith('#')) {
                use.setAttribute('href', `${iconsUrl}${href}`);
            }
        });
    }

    bindEvents() {
        // Закриття модального вікна
        this.closeBtn?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());

        // Закриття по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        // Рейтинг зірочками
        this.bindRatingEvents();

        // Валідація форми
        this.bindValidationEvents();

        // Відправка форми
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Кнопки відкриття модального вікна
        this.bindOpenButtons();
    }

    bindOpenButtons() {
        // Підтримка data-атрибута
        const dataButtons = document.querySelectorAll('[data-feedback-modal]');
        dataButtons.forEach(btn => {
            btn.addEventListener('click', () => this.open());
        });

        // Підтримка класу
        const classButtons = document.querySelectorAll('.feedback-modal-trigger');
        classButtons.forEach(btn => {
            btn.addEventListener('click', () => this.open());
        });
    }

    bindRatingEvents() {
        const stars = this.modal?.querySelectorAll('.feedback-modal__star');
        if (!stars) return;

        stars.forEach((star, index) => {
            // Hover ефект
            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });

            // Клік по зірочці
            star.addEventListener('click', () => {
                this.setRating(index + 1);
            });
        });

        // Скидання hover при виході з рейтингу
        const ratingContainer = this.modal?.querySelector('.feedback-modal__rating');
        ratingContainer?.addEventListener('mouseleave', () => {
            this.highlightStars(this.currentRating);
        });
    }

    bindValidationEvents() {
        const nameInput = this.modal?.querySelector('#feedbackName');
        const messageInput = this.modal?.querySelector('#feedbackMessage');

        nameInput?.addEventListener('input', () => this.validateName());
        nameInput?.addEventListener('blur', () => this.validateName());

        messageInput?.addEventListener('input', () => this.validateMessage());
        messageInput?.addEventListener('blur', () => this.validateMessage());
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

        if (value.length < 2) {
            this.showError('nameError', 'Ім\'я повинно містити мінімум 2 символи');
            return false;
        }

        if (value.length > 16) {
            this.showError('nameError', 'Ім\'я не повинно перевищувати 16 символів');
            return false;
        }

        this.clearError('nameError');
        return true;
    }

    validateMessage() {
        const messageInput = this.modal?.querySelector('#feedbackMessage');
        const value = messageInput?.value.trim() || '';

        if (value.length < 10) {
            this.showError('messageError', 'Повідомлення повинно містити мінімум 10 символів');
            return false;
        }

        if (value.length > 512) {
            this.showError('messageError', 'Повідомлення не повинно перевищувати 512 символів');
            return false;
        }

        this.clearError('messageError');
        return true;
    }

    validateRating() {
        if (this.currentRating === 0) {
            this.showError('ratingError', 'Будь ласка, оберіть рейтинг');
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

        // Валідація всіх полів
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
            rating: this.currentRating
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
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log('Feedback submitted successfully:', data);

            this.showSuccessMessage();
            setTimeout(() => this.close(), 2000);

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
        // Можна додати toast повідомлення або змінити текст кнопки
        if (this.submitText) {
            this.submitText.textContent = 'Відправлено!';
        }
    }

    showErrorMessage(message) {
        // Показуємо загальну помилку
        this.showError('ratingError', message);
    }

    open() {
        if (!this.modal) return;

        this.modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        // Фокус на першому полі
        const firstInput = this.modal.querySelector('#feedbackName');
        setTimeout(() => firstInput?.focus(), 100);
    }

    close() {
        if (!this.modal) return;

        this.modal.classList.remove('is-open');
        document.body.style.overflow = '';

        // Скидання форми
        this.resetForm();
    }

    resetForm() {
        this.form?.reset();
        this.currentRating = 0;
        this.highlightStars(0);
        this.clearAllErrors();
        this.setSubmittingState(false);

        if (this.submitText) {
            this.submitText.textContent = 'Відправити';
        }
    }

    isOpen() {
        return this.modal?.classList.contains('is-open') || false;
    }
}

// Ініціалізація при завантаженні DOM
let feedbackModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    feedbackModalInstance = new FeedbackModal();
});

// Глобальні функції для сумісності
window.openFeedbackModal = () => {
    feedbackModalInstance?.open();
};

window.closeFeedbackModal = () => {
    feedbackModalInstance?.close();
};

export default FeedbackModal;


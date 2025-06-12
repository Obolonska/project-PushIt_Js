// Модуль для управління модальним вікном зворотного зв'язку
class FeedbackModal {
    constructor() {
        this.modal = null;
        this.overlay = null;
        this.closeBtn = null;
        this.form = null;
        this.submitBtn = null;
        this.loadingSpinner = null;
        this.isSubmitting = false;

        this.init();
    }

    init() {
        // Ініціалізація після завантаження DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupModal());
        } else {
            this.setupModal();
        }
    }

    setupModal() {
        this.modal = document.getElementById('feedbackModal');
        if (!this.modal) return;

        this.overlay = this.modal.querySelector('.feedback-modal__overlay');
        this.closeBtn = this.modal.querySelector('.feedback-modal__close');
        this.form = document.getElementById('feedbackForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.loadingSpinner = document.getElementById('loadingSpinner');

        this.bindEvents();
        this.setupTriggerButtons();
    }

    setupTriggerButtons() {
        // Знаходимо всі кнопки з data-атрибутом для відкриття модального вікна
        const triggerButtons = document.querySelectorAll('[data-feedback-modal]');
        triggerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });

        // Також підтримуємо глобальну функцію для зворотної сумісності
        window.openFeedbackModal = () => this.open();
        window.closeFeedbackModal = () => this.close();
    }

    bindEvents() {
        // Закриття модального вікна
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }

        // Закриття по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        // Обробка форми
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupFormValidation();
        }
    }

    setupFormValidation() {
        const nameInput = document.getElementById('feedbackName');
        const messageInput = document.getElementById('feedbackMessage');
        const ratingInputs = document.querySelectorAll('input[name="rating"]');

        // Валідація імені
        if (nameInput) {
            nameInput.addEventListener('input', () => this.validateName());
            nameInput.addEventListener('blur', () => this.validateName());
        }

        // Валідація повідомлення
        if (messageInput) {
            messageInput.addEventListener('input', () => this.validateMessage());
            messageInput.addEventListener('blur', () => this.validateMessage());
        }

        // Валідація рейтингу
        ratingInputs.forEach(input => {
            input.addEventListener('change', () => this.validateRating());
        });

        // Hover ефект для зірок
        this.setupStarHoverEffect();
    }

    setupStarHoverEffect() {
        const ratingContainer = document.getElementById('feedbackRating');
        if (!ratingContainer) return;

        const stars = ratingContainer.querySelectorAll('.feedback-rating__star');

        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });

            star.addEventListener('mouseleave', () => {
                const checkedRating = ratingContainer.querySelector('input[name="rating"]:checked');
                const checkedValue = checkedRating ? parseInt(checkedRating.value) : 0;
                this.highlightStars(checkedValue);
            });
        });
    }

    highlightStars(count) {
        const stars = document.querySelectorAll('.feedback-rating__star');
        stars.forEach((star, index) => {
            if (index < count) {
                star.classList.add('feedback-rating__star--active');
            } else {
                star.classList.remove('feedback-rating__star--active');
            }
        });
    }

    validateName() {
        const nameInput = document.getElementById('feedbackName');
        const nameError = document.getElementById('nameError');
        const value = nameInput.value.trim();

        if (value.length === 0) {
            this.showError(nameError, "Ім'я є обов'язковим полем");
            return false;
        }

        if (value.length < 2) {
            this.showError(nameError, "Ім'я повинно містити мінімум 2 символи");
            return false;
        }

        if (value.length > 16) {
            this.showError(nameError, "Ім'я повинно містити максимум 16 символів");
            return false;
        }

        this.hideError(nameError);
        return true;
    }

    validateMessage() {
        const messageInput = document.getElementById('feedbackMessage');
        const messageError = document.getElementById('messageError');
        const value = messageInput.value.trim();

        if (value.length === 0) {
            this.showError(messageError, "Повідомлення є обов'язковим полем");
            return false;
        }

        if (value.length < 10) {
            this.showError(messageError, "Повідомлення повинно містити мінімум 10 символів");
            return false;
        }

        if (value.length > 512) {
            this.showError(messageError, "Повідомлення повинно містити максимум 512 символів");
            return false;
        }

        this.hideError(messageError);
        return true;
    }

    validateRating() {
        const ratingError = document.getElementById('ratingError');
        const checkedRating = document.querySelector('input[name="rating"]:checked');

        if (!checkedRating) {
            this.showError(ratingError, "Будь ласка, оберіть рейтинг");
            return false;
        }

        this.hideError(ratingError);
        return true;
    }

    showError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    hideError(errorElement) {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    validateForm() {
        const isNameValid = this.validateName();
        const isMessageValid = this.validateMessage();
        const isRatingValid = this.validateRating();

        return isNameValid && isMessageValid && isRatingValid;
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        if (!this.validateForm()) {
            return;
        }

        this.isSubmitting = true;
        this.showLoading();

        try {
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name').trim(),
                descr: formData.get('descr').trim(),
                rating: parseInt(formData.get('rating'))
            };

            const response = await fetch('https://sound-wave.b.goit.study/api/feedbacks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Успішна відправка
            this.showSuccessMessage();
            this.resetForm();

            // Закриваємо модальне вікно через 2 секунди
            setTimeout(() => {
                this.close();
            }, 2000);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showErrorMessage('Помилка при відправці. Спробуйте ще раз.');
        } finally {
            this.isSubmitting = false;
            this.hideLoading();
        }
    }

    showLoading() {
        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            this.submitBtn.querySelector('.feedback-form__submit-text').style.display = 'none';
            this.loadingSpinner.style.display = 'inline-block';
        }
    }

    hideLoading() {
        if (this.submitBtn) {
            this.submitBtn.disabled = false;
            this.submitBtn.querySelector('.feedback-form__submit-text').style.display = 'inline-block';
            this.loadingSpinner.style.display = 'none';
        }
    }

    showSuccessMessage() {
        // Можна додати toast повідомлення або змінити текст кнопки
        const submitText = this.submitBtn.querySelector('.feedback-form__submit-text');
        const originalText = submitText.textContent;
        submitText.textContent = 'Відправлено!';
        submitText.style.color = '#10b981';

        setTimeout(() => {
            submitText.textContent = originalText;
            submitText.style.color = '';
        }, 2000);
    }

    showErrorMessage(message) {
        // Показуємо помилку користувачу
        alert(message); // Можна замінити на більш елегантне рішення
    }

    resetForm() {
        if (this.form) {
            this.form.reset();

            // Очищаємо помилки
            const errorElements = this.form.querySelectorAll('.feedback-form__error');
            errorElements.forEach(error => this.hideError(error));

            // Скидаємо зірки
            this.highlightStars(0);
        }
    }

    open() {
        if (this.modal) {
            this.modal.classList.add('feedback-modal--active');
            document.body.style.overflow = 'hidden';

            // Фокус на першому полі
            const firstInput = this.modal.querySelector('input, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('feedback-modal--active');
            document.body.style.overflow = '';
            this.resetForm();
        }
    }

    isOpen() {
        return this.modal && this.modal.classList.contains('feedback-modal--active');
    }
}

// Ініціалізація модального вікна
const feedbackModal = new FeedbackModal();


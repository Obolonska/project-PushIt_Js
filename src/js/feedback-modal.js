// Модуль для управління модальним вікном зворотного зв'язку

class FeedbackModal {
    constructor() {
        this.modal = null;
        this.form = null;
        this.isSubmitting = false;
        this.currentRating = 0;

        // API конфігурація
        this.apiUrl = 'https://sound-wave.b.goit.study/api/feedbacks';

        this.init();
    }

    init() {
        // Знаходимо модальне вікно
        this.modal = document.getElementById('feedbackModal');
        this.form = document.getElementById('feedbackForm');

        if (!this.modal || !this.form) {
            console.error('Feedback modal elements not found');
            return;
        }

        this.bindEvents();
        this.calculateScrollbarWidth();
    }

    bindEvents() {
        // Обробка форми
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Обробка рейтингу
        this.setupRating();

        // Валідація в реальному часі
        this.setupValidation();

        // Закриття по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        // Закриття по кліку на оверлей
        this.modal.querySelector('.feedback-modal__overlay').addEventListener('click', () => {
            this.close();
        });

        // Закриття по кнопці
        this.modal.querySelector('.feedback-modal__close').addEventListener('click', () => {
            this.close();
        });
    }

    setupRating() {
        const stars = this.modal.querySelectorAll('.feedback-modal__star');
        const ratingInputs = this.modal.querySelectorAll('.feedback-modal__rating-input');

        stars.forEach((star, index) => {
            // Hover ефект
            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });

            // Клік для вибору рейтингу
            star.addEventListener('click', () => {
                this.setRating(index + 1);
            });
        });

        // Повернення до поточного рейтингу при виході миші
        this.modal.querySelector('.feedback-modal__rating').addEventListener('mouseleave', () => {
            this.highlightStars(this.currentRating);
        });
    }

    highlightStars(rating) {
        const stars = this.modal.querySelectorAll('.feedback-modal__star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    setRating(rating) {
        this.currentRating = rating;
        const ratingInput = this.modal.querySelector(`input[name="rating"][value="${rating}"]`);
        if (ratingInput) {
            ratingInput.checked = true;
        }
        this.highlightStars(rating);
        this.clearError('rating');
    }

    setupValidation() {
        const nameInput = this.modal.querySelector('#feedbackName');
        const messageInput = this.modal.querySelector('#feedbackMessage');

        nameInput.addEventListener('input', () => this.validateName());
        nameInput.addEventListener('blur', () => this.validateName());

        messageInput.addEventListener('input', () => this.validateMessage());
        messageInput.addEventListener('blur', () => this.validateMessage());
    }

    validateName() {
        const nameInput = this.modal.querySelector('#feedbackName');
        const name = nameInput.value.trim();

        if (!name) {
            this.showError('name', 'Ім\'я є обов\'язковим');
            return false;
        }

        if (name.length < 2) {
            this.showError('name', 'Ім\'я повинно містити мінімум 2 символи');
            return false;
        }

        if (name.length > 16) {
            this.showError('name', 'Ім\'я не повинно перевищувати 16 символів');
            return false;
        }

        this.clearError('name');
        return true;
    }

    validateMessage() {
        const messageInput = this.modal.querySelector('#feedbackMessage');
        const message = messageInput.value.trim();

        if (!message) {
            this.showError('message', 'Повідомлення є обов\'язковим');
            return false;
        }

        if (message.length < 10) {
            this.showError('message', 'Повідомлення повинно містити мінімум 10 символів');
            return false;
        }

        if (message.length > 512) {
            this.showError('message', 'Повідомлення не повинно перевищувати 512 символів');
            return false;
        }

        this.clearError('message');
        return true;
    }

    validateRating() {
        if (this.currentRating === 0) {
            this.showError('rating', 'Будь ласка, оберіть рейтинг');
            return false;
        }

        this.clearError('rating');
        return true;
    }

    showError(field, message) {
        const errorElement = this.modal.querySelector(`#${field}Error`);
        const inputElement = this.modal.querySelector(`#feedback${field.charAt(0).toUpperCase() + field.slice(1)}`);

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    clearError(field) {
        const errorElement = this.modal.querySelector(`#${field}Error`);
        const inputElement = this.modal.querySelector(`#feedback${field.charAt(0).toUpperCase() + field.slice(1)}`);

        if (errorElement) {
            errorElement.textContent = '';
        }

        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    clearAllErrors() {
        ['name', 'message', 'rating'].forEach(field => this.clearError(field));
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

        // Збираємо дані форми
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name').trim(),
            descr: formData.get('descr').trim(),
            rating: parseInt(formData.get('rating'))
        };

        try {
            this.setSubmitting(true);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Успішна відправка
            this.showSuccessMessage();
            setTimeout(() => {
                this.close();
                this.resetForm();
            }, 2000);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showErrorMessage(error.message);
        } finally {
            this.setSubmitting(false);
        }
    }

    setSubmitting(isSubmitting) {
        this.isSubmitting = isSubmitting;
        const submitBtn = this.modal.querySelector('#submitBtn');
        const submitText = submitBtn.querySelector('.feedback-modal__submit-text');
        const submitLoader = submitBtn.querySelector('.feedback-modal__submit-loader');

        if (isSubmitting) {
            submitBtn.disabled = true;
            submitText.style.display = 'none';
            submitLoader.style.display = 'flex';
        } else {
            submitBtn.disabled = false;
            submitText.style.display = 'block';
            submitLoader.style.display = 'none';
        }
    }

    showSuccessMessage() {
        // Можна додати toast повідомлення або змінити текст кнопки
        const submitBtn = this.modal.querySelector('#submitBtn');
        const submitText = submitBtn.querySelector('.feedback-modal__submit-text');
        const originalText = submitText.textContent;

        submitText.textContent = 'Відправлено!';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

        setTimeout(() => {
            submitText.textContent = originalText;
            submitBtn.style.background = '';
        }, 2000);
    }

    showErrorMessage(message) {
        // Показуємо помилку користувачу
        alert(`Помилка відправки: ${message}`);
    }

    calculateScrollbarWidth() {
        const scrollDiv = document.createElement('div');
        scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
        document.body.appendChild(scrollDiv);
        const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    }

    open() {
        this.modal.classList.add('active');
        document.body.classList.add('modal-open');

        // Фокус на першому полі
        setTimeout(() => {
            const firstInput = this.modal.querySelector('#feedbackName');
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
    }

    close() {
        this.modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    resetForm() {
        this.form.reset();
        this.currentRating = 0;
        this.highlightStars(0);
        this.clearAllErrors();
    }
}

// Ініціалізація модального вікна
let feedbackModalInstance = null;

function initFeedbackModal() {
    if (!feedbackModalInstance) {
        feedbackModalInstance = new FeedbackModal();
    }
}

// Функції для відкриття та закриття модального вікна
function openFeedbackModal() {
    if (feedbackModalInstance) {
        feedbackModalInstance.open();
    } else {
        console.error('Feedback modal not initialized');
    }
}

function closeFeedbackModal() {
    if (feedbackModalInstance) {
        feedbackModalInstance.close();
    }
}

// Автоматична ініціалізація при завантаженні DOM
document.addEventListener('DOMContentLoaded', initFeedbackModal);

// Експорт для використання в інших модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FeedbackModal, openFeedbackModal, closeFeedbackModal };
}


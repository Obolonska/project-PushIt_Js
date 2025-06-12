/**
 * Feedback Modal Component
 * Handles modal functionality, form validation, and user interactions
 */

class FeedbackModal {
    constructor() {
        this.modal = document.getElementById('feedbackModal');
        this.overlay = this.modal?.querySelector('.feedback-modal__overlay');
        this.closeBtn = this.modal?.querySelector('.feedback-modal__close');
        this.form = document.getElementById('feedbackForm');
        this.submitBtn = this.modal?.querySelector('.feedback-modal__submit');

        this.isOpen = false;
        this.isSubmitting = false;

        // Configuration options
        this.config = {
            autoSave: true,
            autoSaveKey: 'feedback-modal-draft',
            submitDelay: 1500
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.initRating();
        this.calculateScrollbarWidth();
        this.loadDraft();
    }

    bindEvents() {
        // Open modal when clicking trigger elements
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-feedback-modal]') ||
                e.target.closest('[data-feedback-modal]')) {
                e.preventDefault();
                this.open();
            }
        });

        // Close modal events
        this.closeBtn?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Form submission
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        this.form?.addEventListener('input', (e) => this.validateField(e.target));
        this.form?.addEventListener('blur', (e) => this.validateField(e.target), true);

        // Character counter for message field
        const messageField = document.getElementById('feedbackMessage');
        messageField?.addEventListener('input', () => this.updateCounter());
    }

    initRating() {
        const ratingContainer = document.getElementById('feedbackRating');
        const stars = ratingContainer?.querySelectorAll('.feedback-modal__star');

        if (!stars) return;

        let currentRating = 0;

        stars.forEach((star, index) => {
            const input = star.previousElementSibling;
            const rating = parseInt(input?.value || 0);

            // Hover effects
            star.addEventListener('mouseenter', () => {
                this.highlightStars(stars, rating);
            });

            // Click handling
            star.addEventListener('click', () => {
                currentRating = rating;
                input.checked = true;
                this.setRating(stars, rating);
                this.clearError('ratingError');
            });
        });

        // Reset hover effects
        ratingContainer.addEventListener('mouseleave', () => {
            this.setRating(stars, currentRating);
        });
    }

    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            const input = star.previousElementSibling;
            const starRating = parseInt(input?.value || 0);
            star.style.color = starRating <= rating ? '#fbbf24' : '#404040';
        });
    }

    setRating(stars, rating) {
        stars.forEach((star) => {
            const input = star.previousElementSibling;
            const starRating = parseInt(input?.value || 0);
            star.style.color = starRating <= rating ? '#fbbf24' : '#404040';
        });
    }

    calculateScrollbarWidth() {
        const scrollDiv = document.createElement('div');
        scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
        document.body.appendChild(scrollDiv);
        const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    }

    updateCounter() {
        const messageField = document.getElementById('feedbackMessage');
        const counter = document.getElementById('messageCounter');

        if (!messageField || !counter) return;

        const current = messageField.value.length;
        const max = 512;
        counter.textContent = `${current}/${max}`;

        // Change color based on usage
        if (current > max * 0.9) {
            counter.style.color = '#ef4444';
        } else if (current > max * 0.8) {
            counter.style.color = '#f59e0b';
        } else {
            counter.style.color = '#888888';
        }
    }

    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.modal.classList.add('is-open');
        document.body.classList.add('feedback-modal-open');

        // Focus management
        setTimeout(() => {
            const firstInput = this.form?.querySelector('input, textarea');
            firstInput?.focus();
        }, 100);

        // Load saved draft
        this.loadDraft();
        this.updateCounter();
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.modal.classList.remove('is-open');
        document.body.classList.remove('feedback-modal-open');

        // Hide status messages
        this.hideStatus();
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        const isValid = this.validateForm();
        if (!isValid) return;

        this.isSubmitting = true;
        this.setSubmitLoading(true);

        try {
            const formData = this.getFormData();
            await this.submitFeedback(formData);

            // Success handling
            this.showSuccess();
            this.clearDraft();
            setTimeout(() => this.close(), 3000);

        } catch (error) {
            console.error('Submit error:', error);
            this.showError('Sorry, there was an error submitting your feedback. Please try again.');
        } finally {
            this.isSubmitting = false;
            this.setSubmitLoading(false);
        }
    }

    validateForm() {
        const fields = [
            { id: 'feedbackName', errorId: 'nameError', validator: this.validateName },
            { id: 'feedbackMessage', errorId: 'messageError', validator: this.validateMessage },
            { name: 'rating', errorId: 'ratingError', validator: this.validateRating }
        ];

        let isValid = true;

        fields.forEach(field => {
            let value = '';

            if (field.name === 'rating') {
                const checkedRating = this.modal.querySelector('[name="rating"]:checked');
                value = checkedRating ? checkedRating.value : '';
            } else {
                const element = document.getElementById(field.id);
                value = element?.value || '';
            }

            const error = field.validator.call(this, value);

            if (error) {
                this.showFieldError(field.errorId, error);
                isValid = false;
            } else {
                this.clearError(field.errorId);
            }
        });

        return isValid;
    }

    validateField(field) {
        if (!field.name && !field.id) return;

        let error = '';
        const value = field.value;

        switch (field.name || field.id) {
            case 'name':
            case 'feedbackName':
                error = this.validateName(value);
                this.showFieldError('nameError', error);
                break;
            case 'descr':
            case 'feedbackMessage':
                error = this.validateMessage(value);
                this.showFieldError('messageError', error);
                this.updateCounter();
                break;
            case 'rating':
                const checkedRating = this.modal.querySelector('[name="rating"]:checked');
                error = this.validateRating(checkedRating ? checkedRating.value : '');
                this.showFieldError('ratingError', error);
                break;
        }

        // Auto-save functionality
        if (this.config.autoSave) {
            this.saveDraft();
        }
    }

    validateName(value) {
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 16) return 'Name must be no more than 16 characters';
        return '';
    }

    validateMessage(value) {
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        if (value.trim().length > 512) return 'Message must be no more than 512 characters';
        return '';
    }

    validateRating(value) {
        const rating = parseInt(value);
        if (!rating || rating < 1 || rating > 5) return 'Please select a rating';
        return '';
    }

    showFieldError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            if (message) {
                errorElement.classList.add('is-visible');
            } else {
                errorElement.classList.remove('is-visible');
            }
        }
    }

    clearError(errorId) {
        this.showFieldError(errorId, '');
    }

    getFormData() {
        const checkedRating = this.modal.querySelector('[name="rating"]:checked');

        return {
            name: document.getElementById('feedbackName')?.value.trim(),
            descr: document.getElementById('feedbackMessage')?.value.trim(),
            rating: checkedRating ? parseInt(checkedRating.value) : null,
            timestamp: new Date().toISOString()
        };
    }

    async submitFeedback(data) {
        // Simulate API request
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional errors for testing
                if (Math.random() < 0.1) {
                    reject(new Error('Network error'));
                } else {
                    console.log('Feedback submitted:', data);
                    resolve({ success: true });
                }
            }, this.config.submitDelay);
        });
    }

    setSubmitLoading(loading) {
        if (!this.submitBtn) return;

        this.submitBtn.disabled = loading;
        this.submitBtn.classList.toggle('is-loading', loading);
    }

    showSuccess() {
        this.showStatus('success', 'Thank you! Your feedback has been submitted successfully.');
    }

    showError(message) {
        this.showStatus('error', message);
    }

    showStatus(type, message) {
        const statusElement = this.modal?.querySelector('.feedback-modal__status');
        if (!statusElement) return;

        statusElement.className = 'feedback-modal__status';
        statusElement.classList.add('is-visible', `is-${type}`);
        statusElement.textContent = message;

        // Auto-hide error messages
        if (type === 'error') {
            setTimeout(() => {
                this.hideStatus();
            }, 5000);
        }
    }

    hideStatus() {
        const statusElement = this.modal?.querySelector('.feedback-modal__status');
        if (!statusElement) return;

        statusElement.classList.remove('is-visible');
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'feedback-modal__status';
        }, 300);
    }

    saveDraft() {
        if (!this.config.autoSave) return;

        const data = this.getFormData();
        try {
            localStorage.setItem(this.config.autoSaveKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save draft:', e);
        }
    }

    loadDraft() {
        if (!this.config.autoSave) return;

        try {
            const saved = localStorage.getItem(this.config.autoSaveKey);
            if (saved) {
                const data = JSON.parse(saved);

                const nameField = document.getElementById('feedbackName');
                const messageField = document.getElementById('feedbackMessage');

                if (nameField && data.name) {
                    nameField.value = data.name;
                }

                if (messageField && data.descr) {
                    messageField.value = data.descr;
                    this.updateCounter();
                }

                if (data.rating) {
                    const ratingInput = this.modal.querySelector(`[name="rating"][value="${data.rating}"]`);
                    if (ratingInput) {
                        ratingInput.checked = true;

                        // Update star display
                        const stars = this.modal.querySelectorAll('.feedback-modal__star');
                        this.setRating(stars, data.rating);
                    }
                }
            }
        } catch (e) {
            console.warn('Could not load draft:', e);
        }
    }

    clearDraft() {
        if (!this.config.autoSave) return;

        try {
            localStorage.removeItem(this.config.autoSaveKey);
        } catch (e) {
            console.warn('Could not clear draft:', e);
        }
    }

    resetForm() {
        this.form?.reset();

        // Reset star ratings
        const stars = this.modal?.querySelectorAll('.feedback-modal__star');
        stars?.forEach(star => star.style.color = '#404040');

        // Clear error messages
        const errors = this.modal?.querySelectorAll('.feedback-modal__error');
        errors?.forEach(error => {
            error.textContent = '';
            error.classList.remove('is-visible');
        });

        // Reset counter
        this.updateCounter();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackModal = new FeedbackModal();
});

// Global functions for compatibility
window.openFeedbackModal = () => {
    if (window.feedbackModal) {
        window.feedbackModal.open();
    }
};

window.closeFeedbackModal = () => {
    if (window.feedbackModal) {
        window.feedbackModal.close();
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackModal;
}


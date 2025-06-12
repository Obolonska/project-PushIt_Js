/**
 * Adaptive Feedback Modal Component
 * Supports all devices: mobile, tablet, desktop
 * Includes touch events, keyboard navigation, and accessibility
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
        this.isMobile = this.detectMobile();
        this.isTouch = this.detectTouch();

        // Configuration
        this.config = {
            autoSave: true,
            autoSaveKey: 'feedback-modal-draft',
            submitDelay: 1500,
            mobileBreakpoint: 768
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.initRating();
        this.calculateScrollbarWidth();
        this.loadDraft();
        this.setupResponsive();
    }

    detectMobile() {
        return window.innerWidth <= this.config.mobileBreakpoint;
    }

    detectTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    setupResponsive() {
        // Listen for orientation and resize changes
        window.addEventListener('resize', () => {
            this.isMobile = this.detectMobile();
            this.updateLayout();
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.isMobile = this.detectMobile();
                this.updateLayout();
            }, 100);
        });
    }

    updateLayout() {
        if (this.isOpen) {
            // Recalculate modal positioning if needed
            this.calculateScrollbarWidth();
        }
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

        // Touch events for mobile
        if (this.isTouch) {
            this.bindTouchEvents();
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }

            // Tab trapping
            if (e.key === 'Tab' && this.isOpen) {
                this.handleTabKey(e);
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

        // Prevent zoom on iOS when focusing inputs
        if (this.isMobile && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
            this.preventIOSZoom();
        }
    }

    bindTouchEvents() {
        // Swipe down to close on mobile
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        this.modal?.addEventListener('touchstart', (e) => {
            if (e.target === this.modal || e.target === this.overlay) {
                startY = e.touches[0].clientY;
                isDragging = true;
            }
        });

        this.modal?.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;

            // Only allow downward swipe
            if (deltaY > 50) {
                this.close();
                isDragging = false;
            }
        });

        this.modal?.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    preventIOSZoom() {
        const inputs = this.form?.querySelectorAll('input, textarea');
        inputs?.forEach(input => {
            input.addEventListener('focus', () => {
                if (input.style.fontSize !== '16px') {
                    input.style.fontSize = '16px';
                }
            });
        });
    }

    handleTabKey(e) {
        const focusableElements = this.modal?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    initRating() {
        const ratingContainer = document.getElementById('feedbackRating');
        const stars = ratingContainer?.querySelectorAll('.feedback-modal__star');

        if (!stars) return;

        let currentRating = 0;

        stars.forEach((star, index) => {
            const input = star.previousElementSibling;
            const rating = parseInt(input?.value || 0);

            // Mouse events
            star.addEventListener('mouseenter', () => {
                if (!this.isTouch) {
                    this.highlightStars(stars, rating);
                }
            });

            // Touch and click events
            const handleSelect = () => {
                currentRating = rating;
                input.checked = true;
                this.setRating(stars, rating);
                this.clearError('ratingError');
                this.saveDraft();
            };

            star.addEventListener('click', handleSelect);

            // Touch events for better mobile experience
            if (this.isTouch) {
                star.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    handleSelect();
                });
            }

            // Keyboard support
            star.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect();
                }
            });
        });

        // Reset hover effects
        ratingContainer?.addEventListener('mouseleave', () => {
            if (!this.isTouch) {
                this.setRating(stars, currentRating);
            }
        });
    }

    highlightStars(stars, rating) {
        stars.forEach((star) => {
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
        this.modal?.classList.add('is-open');
        document.body.classList.add('feedback-modal-open');

        // Focus management with delay for animation
        setTimeout(() => {
            const firstInput = this.form?.querySelector('input, textarea');
            firstInput?.focus();
        }, 100);

        // Load saved draft
        this.loadDraft();
        this.updateCounter();

        // Announce to screen readers
        this.announce('Feedback modal opened');

        // Prevent scroll on mobile
        if (this.isMobile) {
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.modal?.classList.remove('is-open');
        document.body.classList.remove('feedback-modal-open');

        // Restore scroll on mobile
        if (this.isMobile) {
            document.body.style.position = '';
            document.body.style.width = '';
        }

        // Hide status messages
        this.hideStatus();

        // Announce to screen readers
        this.announce('Feedback modal closed');
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        const isValid = this.validateForm();
        if (!isValid) {
            // Focus first error field
            const firstError = this.modal?.querySelector('.feedback-modal__error.is-visible');
            if (firstError) {
                const fieldId = firstError.id.replace('Error', '');
                const field = document.getElementById(fieldId) ||
                    document.getElementById('feedback' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1));
                field?.focus();
            }
            return;
        }

        this.isSubmitting = true;
        this.setSubmitLoading(true);

        try {
            const formData = this.getFormData();
            await this.submitFeedback(formData);

            // Success handling
            this.showSuccess();
            this.clearDraft();
            this.announce('Feedback submitted successfully');

            // Auto-close after delay
            setTimeout(() => this.close(), 3000);

        } catch (error) {
            console.error('Submit error:', error);
            this.showError('Sorry, there was an error submitting your feedback. Please try again.');
            this.announce('Error submitting feedback');
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
                const checkedRating = this.modal?.querySelector('[name="rating"]:checked');
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
                const checkedRating = this.modal?.querySelector('[name="rating"]:checked');
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
        const checkedRating = this.modal?.querySelector('[name="rating"]:checked');

        return {
            name: document.getElementById('feedbackName')?.value.trim(),
            descr: document.getElementById('feedbackMessage')?.value.trim(),
            rating: checkedRating ? parseInt(checkedRating.value) : null,
            timestamp: new Date().toISOString(),
            device: this.isMobile ? 'mobile' : 'desktop',
            userAgent: navigator.userAgent
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
                    const ratingInput = this.modal?.querySelector(`[name="rating"][value="${data.rating}"]`);
                    if (ratingInput) {
                        ratingInput.checked = true;

                        // Update star display
                        const stars = this.modal?.querySelectorAll('.feedback-modal__star');
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

    announce(message) {
        const announcer = this.modal?.querySelector('.feedback-modal__announcer');
        if (announcer) {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
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

    // Public API methods
    destroy() {
        // Remove event listeners and clean up
        this.modal?.removeEventListener('click', this.handleClick);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
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


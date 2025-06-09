// Модуль для управління модальним вікном зворотного зв'язку

// Глобальні змінні
let currentRating = 0;

// API конфігурація
const API_BASE_URL = 'https://sound-wave.b.goit.study/api';

// Функція відкриття модального вікна
function openFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Фокус на перше поле
        const firstInput = modal.querySelector('#feedbackName');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Функція закриття модального вікна
function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Скидання форми
        resetFeedbackForm();
    }
}

// Скидання форми
function resetFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    if (form) {
        form.reset();
        clearErrors();
        resetRating();
    }
}

// Очищення помилок
function clearErrors() {
    const errorElements = document.querySelectorAll('.feedback-form__error');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

// Скидання рейтингу
function resetRating() {
    currentRating = 0;
    const stars = document.querySelectorAll('.rating__star');
    stars.forEach(star => {
        star.classList.remove('active');
    });
}

// Валідація імені згідно з API
function validateName(value) {
    if (!value.trim()) {
        return "Ім'я обов'язкове для заповнення";
    }
    if (value.trim().length < 2) {
        return "Ім'я повинно містити мінімум 2 символи";
    }
    if (value.trim().length > 16) {
        return "Ім'я не повинно перевищувати 16 символів";
    }
    return '';
}

// Валідація повідомлення згідно з API
function validateMessage(value) {
    if (!value.trim()) {
        return "Повідомлення обов'язкове для заповнення";
    }
    if (value.trim().length < 10) {
        return 'Повідомлення повинно містити мінімум 10 символів';
    }
    if (value.trim().length > 512) {
        return 'Повідомлення не повинно перевищувати 512 символів';
    }
    return '';
}

// Валідація рейтингу згідно з API
function validateRating() {
    if (currentRating === 0) {
        return 'Будь ласка, оберіть рейтинг';
    }
    if (currentRating < 1 || currentRating > 5) {
        return 'Рейтинг повинен бути від 1 до 5';
    }
    return '';
}

// Показ помилки
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Валідація всієї форми
function validateForm() {
    const nameValue = document.getElementById('feedbackName').value;
    const messageValue = document.getElementById('feedbackMessage').value;
    
    const nameError = validateName(nameValue);
    const messageError = validateMessage(messageValue);
    const ratingError = validateRating();
    
    showError('name', nameError);
    showError('message', messageError);
    showError('rating', ratingError);
    
    return !nameError && !messageError && !ratingError;
}

// Обробка відправки форми
async function handleFeedbackSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const submitButton = event.target.querySelector('.feedback-form__submit');
    const submitText = submitButton.querySelector('.submit-text');
    const submitLoader = submitButton.querySelector('.submit-loader');
    
    // Показати завантаження
    submitButton.disabled = true;
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-block';
    
    try {
        const formData = {
            name: document.getElementById('feedbackName').value.trim(),
            descr: document.getElementById('feedbackMessage').value.trim(),
            rating: currentRating
        };
        
        // Запит до реального API
        await submitFeedback(formData);
        
        // Показати успіх
        showSuccess();
        
        // Закрити модальне вікно через 1.5 секунди
        setTimeout(() => {
            closeFeedbackModal();
        }, 1500);
        
    } catch (error) {
        console.error('Помилка відправки відгуку:', error);
        
        // Обробка різних типів помилок
        if (error.status === 400) {
            showError('general', 'Невірні дані. Перевірте правильність заповнення полів.');
        } else if (error.status >= 500) {
            showError('general', 'Помилка сервера. Спробуйте пізніше.');
        } else {
            showError('general', 'Сталася помилка при відправці відгуку. Спробуйте ще раз.');
        }
    } finally {
        // Приховати завантаження
        submitButton.disabled = false;
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
    }
}

// Функція відправки даних до реального API
async function submitFeedback(data) {
    const response = await fetch(`${API_BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        
        // Спроба отримати деталі помилки з відповіді
        try {
            const errorData = await response.json();
            error.details = errorData;
        } catch (e) {
            // Ігноруємо помилки парсингу JSON
        }
        
        throw error;
    }
    
    return await response.json();
}

// Показ повідомлення про успіх
function showSuccess() {
    const submitButton = document.querySelector('.feedback-form__submit');
    const originalText = submitButton.innerHTML;
    
    submitButton.innerHTML = '✓ Відправлено!';
    submitButton.style.background = '#10b981';
    
    setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.style.background = '#8b5cf6';
    }, 1500);
}

// Ініціалізація при завантаженні DOM
document.addEventListener('DOMContentLoaded', function() {
    // Обробники для рейтингу
    const stars = document.querySelectorAll('.rating__star');
    
    stars.forEach((star, index) => {
        // Hover ефект
        star.addEventListener('mouseenter', function() {
            highlightStars(index + 1);
        });
        
        // Клік для вибору рейтингу
        star.addEventListener('click', function() {
            currentRating = index + 1;
            setActiveStars(currentRating);
            clearErrors();
        });
    });
    
    // Скидання hover ефекту при відході миші
    const ratingContainer = document.getElementById('feedbackRating');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            setActiveStars(currentRating);
        });
    }
    
    // Закриття по Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('feedbackModal');
            if (modal && modal.classList.contains('active')) {
                closeFeedbackModal();
            }
        }
    });
    
    // Валідація в реальному часі
    const nameInput = document.getElementById('feedbackName');
    const messageInput = document.getElementById('feedbackMessage');
    
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            const error = validateName(this.value);
            showError('name', error);
        });
        
        nameInput.addEventListener('input', function() {
            // Очищення помилки при введенні
            if (this.value.trim().length >= 2) {
                showError('name', '');
            }
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('blur', function() {
            const error = validateMessage(this.value);
            showError('message', error);
        });
        
        messageInput.addEventListener('input', function() {
            // Очищення помилки при введенні
            if (this.value.trim().length >= 10) {
                showError('message', '');
            }
        });
    }
});

// Функція підсвічування зірок при hover
function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating__star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('hover');
        } else {
            star.classList.remove('hover');
        }
    });
}

// Функція встановлення активних зірок
function setActiveStars(rating) {
    const stars = document.querySelectorAll('.rating__star');
    stars.forEach((star, index) => {
        star.classList.remove('hover');
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}


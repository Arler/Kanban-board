export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Функция отключения формы
export function hideForm() {
    let activeForm = document.querySelector('.active')
    if (activeForm) {
        activeForm.classList.remove('active')
    }
}

export function hideAllForm() {
    let activeForm = document.querySelector('.active')
    while (activeForm) {
        activeForm.classList.remove('active')
        activeForm = document.querySelector('.active')
    }
}
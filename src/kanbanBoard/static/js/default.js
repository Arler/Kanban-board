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

// функция обработчик удаления анимации
function removeCloseAnimation() {
    this.classList.remove('form-open-animation')
    this.classList.remove('form-close-animation')
    this.classList.remove('active')
    this.removeEventListener('animationend', removeCloseAnimation)
}

// Функция скрытия модального окна
export function hideModalWindow(activeModalWindow=null) {
    if (!activeModalWindow) {
        activeModalWindow = document.querySelector('.active')
    }
    activeModalWindow.addEventListener('animationend', removeCloseAnimation);
    activeModalWindow.classList.add('form-close-animation');
}

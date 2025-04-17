function getCookie(name) {
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

// Функция обработки форм
function formResponse(event) {
    event.preventDefault()
    if (event.target.classList.contains('profile-edit')) {
        changeUserProfile(event)
    }
    else if (event.target.classList.contains('profile-delete')) {
        deleteProfile()
    }
}

document.addEventListener('submit', formResponse)

// Функция отправки изменённых настроек пользователя
function changeUserProfile(event) {
    let siteURL = `${window.location.protocol}//${window.location.host}`
    let formData = new FormData(event.target)

    if (!formData.has('send_notifications')) {
        formData.append('send_notifications', false)
    }

    let init = {
        method: "PUT",
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    }

    fetch(`${siteURL}/accounts/api/profile/`, init)
    .then(response => {
        if (!response.ok) throw new Error('Что-то не так')
        return response.json()
    })
    .then(data => {changeUserInfo(data[0])})
    .catch(error => {console.log(error)})
}

// Функция изменения информации о пользователе на странице
function changeUserInfo(data) {
    const usernamelabel = document.querySelector('.username__label')
    const labelText = usernamelabel.innerHTML
    usernamelabel.innerHTML = `${labelText.slice(0, labelText.indexOf(':') + 2)}${data.fields.username}`
}

// Функция отправки запроса на удаление аккаунта
function deleteProfile() {
    const banner = `
    <div class="confirm-delete-background"></div>
    <div class="confirm-delete-wrapper">
        <div class="banner">
            <span class="banner__title">Вы действительно хотите удалить аккаунт?</span>
            <div class="banner__buttons">
                <button class="banner__button-yes" type="submit">Да</button>
                <button class="banner__button-no" type="submit">Нет</button>
            </div>
        </div>
    </div>`
    document.body.insertAdjacentHTML('afterbegin', banner)
    document.querySelector('.confirm-delete-background').classList.toggle('active')
    const confirmDeleteBanner = document.querySelector('.confirm-delete-wrapper')

    confirmDeleteBanner.classList.toggle('active')
    confirmDeleteBanner.addEventListener('click', confirmDelete)
}

function confirmDelete(event) {
    if (event.target.classList.contains('banner__button-yes')) {
        const siteURL = `${window.location.protocol}//${window.location.host}`
        
        let init = {
            method: "DELETE",
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        }
    
        fetch(`${siteURL}/accounts/api/profile/`, init)
        .then(response => {
            if (!response.ok) throw new Error('Что-то не так')
            return response.text()
        })
        .then(data => {window.location.assign(`${siteURL}/accounts/login/`)})
        .catch(error => {console.log(error)})        
    }
    else if (event.target.classList.contains('banner__button-no')) {
        console.log('Нет')
        document.querySelector('.confirm-delete-background').classList.remove('active')
        document.querySelector('.confirm-delete-wrapper').classList.remove('active')
    }
}
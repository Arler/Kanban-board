import {getCookie, hideForm} from "./default.js";


// Функция обработки нажатия кнопок
function buttonResponse(event) {
    if (event.target.classList.contains('board__settings')) {
        show_board_settings_form(event)
    }
}

// Функция получения формы изменения настроек доски
function get_board_settings_form(pk, func=() => {}, event=null) {
    fetch(
        `${window.location.protocol}//${window.location.host}/api/forms/boardsettings/${pk}/`,
        {headers: {'X-CSRFToken': getCookie('csrftoken')}}
    )
    .then(response => {
        if (!response.ok) throw new Error('Что-то не так')
        return response.text()
    })
    .then(html => {
        let style = html.match(/<link.*?>/)[0]
        let buttons = html.match(/^<button.*?>$/gm)
        let boardSettingsFormHtml = html.replace(/<link.*?>/, ' ').replace(/^<button.*?>$/gm, ' ')

        sessionStorage.setItem('board-settings-form', boardSettingsFormHtml)
        sessionStorage.setItem('board-settings-form-style', style)
        sessionStorage.setItem('board-settings-form-delete-button', buttons[0])
        sessionStorage.setItem('board-settings-form-edit-button', buttons[1])
        func(event)
    })
    .catch(error => {console.log(error)})
}

// Функция показа формы настройки доскиdocument.URL.match(/(\d+)(\/)$/)[0]
function show_board_settings_form(event) {
    let boardSettingsForm = document.querySelector(`.board-settings[value="${document.URL.match(/(\d+)(\/)?$/)[0]}"]`)

    if (boardSettingsForm) {
        if (boardSettingsForm.classList.contains('active')) {
            boardSettingsForm.classList.remove('active')
        }
        else if (!boardSettingsForm.classList.contains('active')) {
            hideForm()
            boardSettingsForm.classList.toggle('active')
            setup_board_settings_form(boardSettingsForm, event.target)
        }
    }
    else {
        hideForm()
        get_board_settings_form(document.URL.match(/(\d+)(\/)?$/)[0], () => {
            document.querySelector('.board').insertAdjacentHTML('afterbegin', sessionStorage.getItem('board-settings-form'))
            let boardSettingsForm = document.querySelector(`.board-settings`)

            if (!document.querySelector('#board-settings-style')) {
                document.head.insertAdjacentHTML("beforeend", sessionStorage.getItem('board-settings-form-style'))
            }
            
            setup_board_settings_form(boardSettingsForm, event.target)
            boardSettingsForm.classList.toggle('active')
        })
    }
}

// Функция установки формы настройки доски
function setup_board_settings_form(formElement, buttonElement) {
    let buttonRect = buttonElement.getBoundingClientRect()
    let formRect = formElement.getBoundingClientRect()

    formElement.style.position = 'absolute'
    formElement.style.top = `${buttonRect.bottom}px`
    formElement.style.left = `${buttonRect.right - formRect.width}px`
}

// Отслеживание события клика по кнопкам
document.addEventListener('click', buttonResponse)
import {getCookie, hideForm} from "./default.js";


// Функция обработки нажатия кнопок
function buttonResponse(event) {
    if (event.target.classList.contains('board__settings')) {
        show_board_settings_form(event)
    }
}

// Отслеживание события клика по кнопкам
document.addEventListener('click', buttonResponse)
// Отслеживание события отправки формы
document.addEventListener("submit", sendForm)

function sendForm(event) {
    let form = event.target

    event.preventDefault()

    if (form.getAttribute('name') == "board-settings") {
        fetch(
            `${window.location.protocol}//${window.location.host}/api/board/`,
            {
                method: "PUT",
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
            }
        )
        .then(response => {
            if (!response.ok) throw new Error('Что-то не так')
            return response.json()
        })
        .then(json => {
            update_board(json)
            console.log(json)
        })
        .catch(error => {console.log(error)})
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

// Функция обновления доски
function update_board(boardObj) {
    update_board_columns(boardObj.fields.columns)
}

// Функция обновления информации о колонках
function update_board_columns(columns) {
    const formColumns = document.querySelector('.board-settings__column-container').children
    const boardColumns = document.querySelector('.column-container').children
    for (let i = 0; i < columns.length; ++i) {
        if (i < formColumns.length) {
            formColumns[i].textContent = columns[i].fields.title
            boardColumns[i].querySelector('.column__title').textContent = columns[i].fields.title
        }
        else {
            const formColumnHtml = document.querySelector('.board-settings__column').outerHTML
            document.querySelector('.board-settings__column-container').insertAdjacentHTML('beforeend', formColumnHtml)
            const newFormColumn = document.querySelector('.board-settings__column-container').lastElementChild
            newFormColumn.textContent = columns[i].fields.title

            const boardColumnHtml = document.querySelector('.column').outerHTML
            document.querySelector('.column-container').insertAdjacentHTML('beforeend', boardColumnHtml)
            const newBoardColumn = document.querySelector('.column-container').lastElementChild
            newBoardColumn.querySelector('.column__title').textContent = columns[i].fields.title
        }
    }
}

// Функция показа формы настройки доски
function show_board_settings_form(event) {
    let boardSettingsForm = document.querySelector(`.board-settings`)

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

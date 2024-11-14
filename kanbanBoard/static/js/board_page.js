import {getCookie, hideAllForm, hideForm} from "./default.js";
import {ref, createApp} from "./vue.esm-browser.prod.js";


// Функция обработки нажатия кнопок
function buttonResponse(event) {
    if (event.target.classList.contains('board__settings')) {
        show_board_settings_form(event)
    }
    else if (event.target.classList.contains('board-settings__column')) {
        show_column_buttons(event)
    }
    else if (event.target.classList.contains('edit-button')) {
        show_column_settings_form(event)
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

    setup_board_settings_form(boardSettingsForm, event.target)
    if (boardSettingsForm.classList.contains('active')) hideAllForm()
    else boardSettingsForm.classList.toggle('active')
}

// Функция показа кнопок взаимодействия с колонками
function show_column_buttons(event) {
    let columnEditButton = document.querySelector('.edit-button')
    let columnDeleteButton = document.querySelector('.delete-button')

    if (columnEditButton) {
        let buttonRect = event.target.getBoundingClientRect() 
        if (document.elementFromPoint(buttonRect.x, buttonRect.y + buttonRect.height + 1).classList.contains('edit-button')) {
            columnEditButton.classList.toggle('active')
            columnDeleteButton.classList.toggle('active')
        }
        else if (!columnEditButton.classList.contains('active')) {
            columnEditButton.classList.toggle('active')
            columnDeleteButton.classList.toggle('active')
        }
        document.querySelector('.column-settings').classList.remove('active')
        setup_column_buttons(event.target, columnEditButton, columnDeleteButton)
    }
    else {
        document.body.insertAdjacentHTML('afterbegin', sessionStorage.getItem('board-settings-form-edit-button'))
        document.body.insertAdjacentHTML('afterbegin', sessionStorage.getItem('board-settings-form-delete-button'))
        
        let columnEditButton = document.querySelector('.edit-button')
        let columnDeleteButton = document.querySelector('.delete-button')

        setup_column_buttons(event.target, columnEditButton, columnDeleteButton)
        columnEditButton.classList.toggle('active')
        columnDeleteButton.classList.toggle('active')
    }
}

// Показ формы настройки колонки
function show_column_settings_form(event) {
    let columnSettingsForm = document.querySelector('.column-settings')

    columnSettingsForm.classList.toggle('active')
    setup_column_settings_form(columnSettingsForm, document.querySelector('.edit-button'))
}

// Функция установки формы настройки доски
function setup_board_settings_form(formElement, buttonElement) {
    let buttonRect = buttonElement.getBoundingClientRect()
    let formRect = formElement.getBoundingClientRect()

    formElement.style.top = `${buttonRect.y + buttonRect.height}px`
    formElement.style.left = `${buttonRect.x + buttonRect.width - formRect.width}px`
}

// Функция установки кнопок взаимодействия с колонками
function setup_column_buttons(column, editButton, deleteButton) {
    const columnRect = column.getBoundingClientRect()

    editButton.style.top = `${columnRect.y + columnRect.height}px`
    deleteButton.style.top = `${columnRect.y + columnRect.height * 2}px`
    editButton.style.left = `${columnRect.x}px`
    deleteButton.style.left = `${columnRect.x}px`
}

// Установка формы настройки колонки
function setup_column_settings_form(columnForm, editButton) {
    const editButtonRect = editButton.getBoundingClientRect()
    const columnFormRect = columnForm.getBoundingClientRect()
    const column = document.elementFromPoint(editButtonRect.x, editButtonRect.y - 1)
    columnForm.setAttribute('value', column.getAttribute('value'))
    columnForm.style.top = `${editButtonRect.top + editButtonRect.height}px`
    columnForm.style.left = `${editButtonRect.left + editButtonRect.width - columnFormRect.width}px`
}
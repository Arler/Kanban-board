import {getCookie, hideAllForm, hideForm} from "./default.js";
import {ref, createApp} from "./vue.esm-browser.prod.js";


const BOARDID = document.querySelector('.board').getAttribute('id')
let columns = document.querySelectorAll('.column')

// Функция обработки нажатия кнопок
function buttonResponse(event) {
    if (event.target.classList.contains('board__settings')) {
        show_board_settings_form(event)
    }
    else if (event.target.classList.contains('board-settings__column')) {
        show_column_buttons(event)
    }
    else if (event.target.classList.contains('board-settings__edit-button')) {
        show_column_settings_form(event)
    }
    else if (event.target.classList.contains('board-settings__delete-button')) {
        delete_column(event)
    }
    else if (event.target.classList.contains('board-settings__new-column')) {
        show_create_column_form(event)
    }
}

// Отслеживание события клика по кнопкам
document.addEventListener('click', buttonResponse)
// Отслеживание события отправки формы
document.addEventListener("submit", sendForm)
// Отслеживание перемещения колонок
columns.forEach((column) => {
    column.ondragover = dragOver;
    column.ondragstart = drag;
    column.ondrop = drop;
    column.ondragend = dragEnd;
    column.ondragenter = dragEnter;
    column.ondragexit = dragExit;
});

// -------------------- Функции управления перетаскиванием --------------------

function dragOver(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('id', event.target.id);
    event.target.classList.add('selected');
}

function dragEnd(event) {
    event.target.classList.remove('selected');
}

function dragEnter(event) {
    if (event.target.closest('.column')) {
        event.target.closest('.column').classList.add('drag-over')
    }
}

function dragExit(event) {
    event.target.closest('.column').classList.remove('drag-over')
}

async function drop(event) {
    if (event.target.closest('.column')) {
        const dragColumnId = event.dataTransfer.getData('id');
        const dropColumnId = event.target.closest('.column').id;
        if (dropColumnId != dragColumnId) {
            const columnContainer = document.querySelector('.column-container');
            const dragColumn = document.querySelector(`#${dragColumnId}`);
            const dropColumn = document.querySelector(`#${dropColumnId}`);
            const dragRowNumber = dragColumn.getAttribute('row-number');
            const dropRowNumber = dropColumn.getAttribute('row-number');
            const nextSibling = dropColumn.nextSibling;

            dragColumn.setAttribute('row-number', dropRowNumber);
            dropColumn.setAttribute('row-number', dragRowNumber);

            columnContainer.insertBefore(dropColumn, dragColumn);
            columnContainer.insertBefore(dragColumn, nextSibling);
            event.target.closest('.column').classList.remove('drag-over');

            // Отправка запроса на изменение порядкового номера колонок
            let response = await fetch(
                `${window.location.protocol}//${window.location.host}/api/column/`,
                {
                    method: "PUT",
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: dragColumnId.split('-')[1],
                        row_number: dragColumn.getAttribute('row-number'),
                        title: dragColumn.querySelector('.column__title').innerText
                    })
                });
            if (!response.ok) console.error(response);
            response = await fetch(
                `${window.location.protocol}//${window.location.host}/api/column/`,
                {
                    method: "PUT",
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: dropColumnId.split('-')[1],
                        row_number: dropColumn.getAttribute('row-number'),
                        title: dropColumn.querySelector('.column__title').innerText
                    })
                });
            if (!response.ok) console.error(response);
        }
    }
}

// --------------------------------------------------------------------------------

// Функция отправки форм создания и редактирования
async function sendForm(event) {
    const form = event.target
    const formName = form.getAttribute('name')

    event.preventDefault()

    if (formName == "board-settings") {
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
        .then(response => {return response.json()})
        .then(board => {
            document.querySelector('.board__title').innerHTML = board.fields.title
        })
        .catch(error => {console.log(error)})
    }
    // Обработка запроса создания и редактирования колонки
    else if (formName == "column-settings") {
        if (form.querySelector('input[name="id"]').getAttribute('value') != '') {
            fetch(
                `${window.location.protocol}//${window.location.host}/api/column/`,
                {
                    method: "PUT",
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(Object.fromEntries(new FormData(form))),
                }
            )
            .then(response => {return response.json()})
            .then(json => {
                update_board_columns(json)
            })
            .catch(error => {console.log(error)})
        }
        else {
            const formData = Object.fromEntries(new FormData(form))
            formData['board-id'] = BOARDID
            formData['row_number'] = parseInt(document.querySelector('.column:last-of-type').getAttribute('row-number')) + 1
            const response = await fetch(
                `${window.location.protocol}//${window.location.host}/api/column/`,
                {
                    method: "POST",
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )
            const newColumn = await response.json()
            create_new_column(newColumn)
        }
    }
}

// Показ формы создания новой колонки
function show_create_column_form(event) {
    const createColumnForm = document.querySelector('.column-settings')
    setup_column_settings_form(createColumnForm, undefined, event.target, true)
    createColumnForm.classList.toggle('active')
}

// Функция создания новой колонки
function create_new_column(newColumn) {
    //Добавление новой колонки на доску
    let newColumnNode = document.querySelector('.column').cloneNode(true);
    let tasksContainer = newColumnNode.querySelector('.column__tasks-container');
    while (tasksContainer.children.length > 0) {
        tasksContainer.children[0].remove();
    }
    newColumnNode.setAttribute('id', `column-${newColumn.pk}`);
    newColumnNode.querySelector('.column__title').innerText = newColumn.fields.title;
    newColumnNode.setAttribute('row-number', newColumn.fields.row_number);
    newColumnNode.ondragover = dragOver;
    newColumnNode.ondragstart = drag;
    newColumnNode.ondrop = drop;
    newColumnNode.ondragend = dragEnd;
    newColumnNode.ondragenter = dragEnter;
    newColumnNode.ondragexit = dragExit;
    document.querySelector('.column-container').insertAdjacentElement('beforeend', newColumnNode);

    //Добавление новой колонки в меню редактирования доски
    newColumnNode = document.querySelector('.board-settings__column').cloneNode(true);
    newColumnNode.setAttribute('value', newColumn.pk);
    newColumnNode.innerText = newColumn.fields.title;
    document.querySelector('.board-settings__column-container').insertAdjacentElement('beforeend', newColumnNode);
}

// Функция удаления колонки
async function delete_column(event) {
    const columnId = event.target.getAttribute('value')

    const response = await fetch(
        `${window.location.protocol}//${window.location.host}/api/column/`,
        {
            method: "DELETE",
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({id: columnId}),
        }
    )
    if (response.ok) {
        document.querySelector(`.column[id="column-${columnId}"]`).remove()
        document.querySelector(`.board-settings__column[value="${columnId}"]`).remove()
        document.querySelector('.board-settings__delete-button').classList.remove('active')
        document.querySelector('.board-settings__edit-button').classList.remove('active')
    }
}

// Функция обновления информации о колонках
function update_board_columns(column) {
    let formColumn = document.querySelector(`.board-settings__column[value="${column.pk}"]`)
    let boardColumn = document.querySelector(`#column-${column.pk}`)

    boardColumn.querySelector('.column__title').innerText = column.fields.title
    formColumn.innerText = column.fields.title
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
    let columnEditButton = document.querySelector('.board-settings__edit-button')
    let columnDeleteButton = document.querySelector('.board-settings__delete-button')

    let buttonRect = event.target.getBoundingClientRect() 
    if (document.elementFromPoint(buttonRect.x, buttonRect.y + buttonRect.height + 1).classList.contains('board-settings__edit-button')) {
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

// Показ формы настройки колонки
function show_column_settings_form(event) {
    let columnSettingsForm = document.querySelector('.column-settings')

    columnSettingsForm.classList.toggle('active')
    setup_column_settings_form(columnSettingsForm, event.target, undefined, undefined)
}

// Функция установки формы настройки доски
function setup_board_settings_form(formElement, buttonElement) {
    let buttonRect = buttonElement.getBoundingClientRect()
    let formRect = formElement.getBoundingClientRect()

    formElement.style.top = `${buttonRect.y + buttonRect.height + window.scrollY}px`
    formElement.style.left = `${buttonRect.x + buttonRect.width - formRect.width}px`
}

// Функция установки кнопок взаимодействия с колонками
function setup_column_buttons(column, editButton, deleteButton) {
    const columnRect = column.getBoundingClientRect()

    editButton.style.top = `${columnRect.y + columnRect.height + window.scrollY}px`
    deleteButton.style.top = `${columnRect.y + columnRect.height * 2 + window.scrollY}px`
    editButton.style.left = `${columnRect.x}px`
    deleteButton.style.left = `${columnRect.x}px`

    editButton.setAttribute('value', column.getAttribute('value'))
    editButton.setAttribute('row-number', column.getAttribute('row-number'))
    deleteButton.setAttribute('value', column.getAttribute('value'))
    deleteButton.setAttribute('row-number', column.getAttribute('row-number'))
}

// Установка формы настройки колонки
function setup_column_settings_form(columnForm, editButton=null, newColumnButton=null, newColumn=false) {
    if (newColumn) {
        // Установка формы новой колонки
        columnForm.setAttribute('value', '')
        columnForm.querySelector('input[name="id"]').setAttribute('value', '')
        const newColumnButtonRect = newColumnButton.getBoundingClientRect()
        const columnFormRect = columnForm.getBoundingClientRect()
        columnForm.style.top = `${newColumnButtonRect.bottom + window.scrollY}px`
        columnForm.style.left = `${newColumnButtonRect.left + newColumnButtonRect.width - columnFormRect.width}px`
    }
    else {
        // Установка формы редактирования существующей колонки
        const editButtonRect = editButton.getBoundingClientRect()
        const columnFormRect = columnForm.getBoundingClientRect()
        const columnId = editButton.getAttribute('value')
        const columnRowNumber = editButton.getAttribute('row-number')
        columnForm.setAttribute('value', columnId)
        columnForm.querySelector('input[name="id"]').setAttribute('value', columnId)
        columnForm.querySelector('input[name="row_number"]').setAttribute('value', columnRowNumber)
        columnForm.style.top = `${editButtonRect.top + editButtonRect.height + window.scrollY}px`
        columnForm.style.left = `${editButtonRect.left + editButtonRect.width - columnFormRect.width}px`
    }
}
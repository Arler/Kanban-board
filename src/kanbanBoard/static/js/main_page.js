import { getCookie, hideModalWindow } from "./default.js";

// Функция получения формы доски
function get_board_form(pk, func=() => {}, event=null) {
    fetch(
        `${window.location.protocol}//${window.location.host}/api/forms/newboard/${pk}/`,
        {
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        }
    )
    .then(response => {
        if (!response.ok) throw new Error('Что-то не так')
        return response.text()
    })
    .then(html => {
        let style = html.match(/<link.*?>/)
        let boardFormHtml = html.replace(/<link.*?>/, ' ')
        sessionStorage.setItem('board-form-style', style)
        sessionStorage.setItem('board-form', boardFormHtml)
        func(event)
    })
    .catch(error => {console.log(error)})
}

// Функция установки формы изменения доски рядом с доской
function setup_form_nearby_board(formElement, boardElement) {
    let boardRect = boardElement.getBoundingClientRect()
    let formRect = formElement.getBoundingClientRect()
    let containerRect = boardElement.parentElement.getBoundingClientRect()

    formElement.style.position = 'absolute'
    formElement.style.top = `${boardRect.top - containerRect.top}px`

    if (boardRect.right + formRect.width > document.documentElement.clientWidth) {
        formElement.style.right = `${containerRect.right - boardRect.left}px`
    }
    else {
        formElement.style.left = `${boardRect.right - containerRect.left}px`
    }
}

// Функция установки формы для создания новой доски рядом с header
function setup_form_nearby_header(formElement, headerElement) {
    let headerRect = headerElement.getBoundingClientRect()
    formElement.setAttribute('name', 'new-board')

    formElement.style.position = 'absolute'
    formElement.style.top = `${headerRect.bottom}px`
}

// Функция для показа или вставки формы создания новой доски
function show_new_board_form() {
    let newBoardForm = document.querySelector('.board-form[value="0"]')

    if (newBoardForm) {
        if (newBoardForm.classList.contains('active')) {
            newBoardForm.classList.remove('active')
        }
        else if (!newBoardForm.classList.contains('active')) {
            hideModalWindow()
            newBoardForm.classList.toggle('active')
        }
    }
    else {
        hideModalWindow()
        get_board_form(0, () => {
            let header = document.querySelector('.header')
            document.head.insertAdjacentHTML("beforeend", sessionStorage.getItem('board-form-style'))
            header.insertAdjacentHTML('afterend', sessionStorage.getItem('board-form'))
            let newBoardForm = document.querySelector(`.board-form[value="0"]`)
            setup_form_nearby_header(newBoardForm, header)
            newBoardForm.classList.toggle('active')
        })
    }
}

// Функция показа формы редактирования доски
function show_board_edit_form(event) {
    let board = event.target.parentElement.parentElement
    let boardForm = document.querySelector(`.board-form[value="${board.getAttribute('id')}"]`)

    if (boardForm) {
        if (boardForm.classList.contains('active')) {
            boardForm.classList.remove('active')
        }
        else if (!boardForm.classList.contains('active')) {
            hideModalWindow()
            boardForm.classList.toggle('active')
            setup_form_nearby_board(boardForm, board)
        }
    }
    else {
        hideModalWindow()
        get_board_form(board.getAttribute('id'), () => {
            board.insertAdjacentHTML('afterend', sessionStorage.getItem('board-form'))

            if (!document.querySelector('#board-form-style')) {
                document.head.insertAdjacentHTML("beforeend", sessionStorage.getItem('board-form-style'))
            }
    
            let boardForm = document.querySelector(`.board-form[value="${board.getAttribute('id')}"]`)
            setup_form_nearby_board(boardForm, board)
            boardForm.classList.toggle('active')
        })
    }
}

// Функция для удаления доски
function deleteBoard(event) {
    let board = event.target.parentElement.parentElement
    let board_id = board.getAttribute('id')
    fetch(
        `${window.location.protocol}//${window.location.host}/api/board/`,
        {
            method: "DELETE",
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {'id': board_id}
            ) 
        }
    )
    .then(response => {
        return response.text()
    })
    .then(data => {
        board.remove()
        let boardEditForm = document.querySelector(`.board-form[value="${board_id}"]`)
        if (boardEditForm) boardEditForm.remove()
    })
    .catch(error => {console.log(error)})
}

// Функция обработки нажатия кнопок
function buttonResponse(event) {
    if (event.target.classList.contains('board__button')) {
        if (event.target.classList.contains('board__button_edit')) {
            show_board_edit_form(event)
        }
        else if (event.target.classList.contains('board__button_delete')) {
            deleteBoard(event)
        }
        else if (event.target.classList.contains('board__button_select')) {
            let siteURL = `${window.location.protocol}//${window.location.host}`
            let id = event.target.parentElement.parentElement.getAttribute('id')
            window.location.assign(`${siteURL}/board/${id}`)
        }
    }
    else if (event.target.classList.contains('new-board')) {
        show_new_board_form()
    }
}

// Функция обновления данных доски
function updateBoard(data) {
    let board = document.querySelector(`.board[id="${data.pk}"]`)

    board.querySelector('.board__title').innerHTML = data.fields.title
    board.querySelector('.board__info_item_tasks').innerHTML = data.fields.tasks.length
    board.querySelector('.board__info_item_columns').innerHTML = data.fields.columns.length
    board.querySelector('.board__info_item_total-users').innerHTML = data.fields.total_users
}

// Функция добавления новой доски на страницу
function add_new_board(data) {
    let container = document.querySelector('.container')

    fetch(
        `${window.location.protocol}//${window.location.host}/api/elements/board/${data.pk}/`,
        {
            headers: {
                csrftoken: getCookie('csrftoken')
            }
        }
    )
    .then(response => {
        return response.text()
    })
    .then(html => {
        sessionStorage.setItem('board', html)
    })
    .catch(error => {console.log(error)})

    if (container) {
        container.insertAdjacentHTML('beforeend', sessionStorage.getItem('board'))
    }
    else {
        let container = document.createElement('div')
        container.setAttribute('class', 'container')
        document.body.appendChild(container)
        container.insertAdjacentHTML('beforeend', sessionStorage.getItem('board'))
    }
}

// Функция отправки формы
function sendForm(event) {
    let form = event.target

    event.preventDefault()

    if (form.getAttribute('name') == 'new-board') {
        fetch(
            `${window.location.protocol}//${window.location.host}/api/board/`,
            {
                method: "POST",
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            }
        )
        .then(response => {
            if (!response.ok) throw new Error('Что-то не так')
            return response.json()
        })
        .then(json => {
            add_new_board(json)
        })
        .catch(error => {console.log(error)})
    }
    else {
        fetch(
            `${window.location.protocol}//${window.location.host}/api/board/`,
            {
                method: "PUT",
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            }
        )
        .then(response => {
            if (!response.ok) throw new Error('Что-то не так')
            return response.json()
        })
        .then(json => {
            updateBoard(json)
        })
        .catch(error => {console.log(error)})
    }
}

// Отслеживание события отправки формы
document.addEventListener("submit", sendForm)
// Отслеживание события клика по кнопкам
document.addEventListener('click', buttonResponse)
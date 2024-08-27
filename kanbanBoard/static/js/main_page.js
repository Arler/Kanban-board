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

// Функция получения формы доски
function get_board_form() {
    const csrftoken = getCookie('csrftoken');

    let init = {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrftoken,
            'X-get-form': true,
        },
    }
    fetch('http://127.0.0.1:8000/', init)
    .then(response => {
        if (!response.ok) throw new Error('Что-то не так')
        return response.text()
    })
    .then(html => {
        sessionStorage.setItem('board-form', html)
    })
    .catch(error => {console.log(error)})
}

// Функция отключения формы
function hideForm() {
    let = activeForm = document.querySelector('.active')
    if (activeForm) {
        activeForm.classList.remove('active')
    }
}

// Функция установки формы изменения доски рядом с доской
function setup_form_nearby_board(formElement, boardElement) {
    let boardRect = boardElement.getBoundingClientRect()
    let formRect = formElement.getBoundingClientRect()
    let containerRect = boardElement.parentElement.getBoundingClientRect()

    formElement.querySelector('input[name="id"]').setAttribute('value', boardElement.getAttribute('id'))
    formElement.setAttribute('value', boardElement.getAttribute('id'))

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

    formElement.style.position = 'absolute'
    formElement.style.top = `${headerRect.bottom}px`
    formElement.setAttribute('name', 'new-board')
}

// Функция для показа или вставки формы создания новой доски
function show_new_board_form() {
    let newBoardForm = document.querySelector('.board-form[name="new-board"]')

    if (newBoardForm) {
        if (newBoardForm.classList.contains('active')) {
            newBoardForm.classList.remove('active')
        }
        else if (!newBoardForm.classList.contains('active')) {
            hideForm()
            newBoardForm.classList.toggle('active')
        }
    }
    else {
        hideForm()
        
        let header = document.querySelector('.header')
        header.insertAdjacentHTML('afterend', sessionStorage.getItem('board-form'))
    
        let newBoardForm = document.querySelector(`.board-form[value=""]`)
        newBoardForm.setAttribute('name', 'new-board-form')
        newBoardForm.setAttribute('value', 'new')
        setup_form_nearby_header(newBoardForm, header)
    
        newBoardForm.classList.toggle('active')
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
            hideForm()
            boardForm.classList.toggle('active')
            setup_form_nearby_board(boardForm, board)
        }
    }
    else {
        hideForm()

        board.insertAdjacentHTML('afterend', sessionStorage.getItem('board-form'))
        let boardForm = document.querySelector(`.board-form[value=""]`)

        setup_form_nearby_board(boardForm, board)

        boardForm.classList.toggle('active')
    }
}

// Функция для удаления доски
function deleteBoard(event) {
    const csrftoken = getCookie('csrftoken');
    let board = event.target.parentElement.parentElement
    let board_id = board.getAttribute('id')

    let init = {
        method: "DELETE",
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {'id': board_id}
        )
    }

    fetch('http://127.0.0.1:8000/board/api/board/', init)
    .then(response => {
        if (!response.ok) throw new Error('Что-то не так')
        return response
    })
    .then(data => {
        board.remove()
        document.querySelector(`.board-form[value="${board.getAttribute('id')}"]`).remove()
    })
    .catch(error => {console.log(error)})
}

// Функция обработки нажатия кнопок
function buttonResponse(event) {
    if (event.target.classList.contains('board__button')) {
        if (event.target.classList.contains('board__button_edit')) {
            let not_forms = document.querySelector('.board-form') == null
            let boardFormStyle = document.querySelector('.board-style')

            if (!boardFormStyle) {
                document.head.insertAdjacentHTML('beforeend', `<link class="board-style" rel="stylesheet" href="static/css/board/board_form.css">`)
            }
            if (not_forms) {
                get_board_form()
                show_board_edit_form(event)
            }
            else {
                show_board_edit_form(event)
            }
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
        let boardFormStyle = document.querySelector('.board-style')

        if (!boardFormStyle) {
            document.head.insertAdjacentHTML('beforeend', `<link class="board-style" rel="stylesheet" href="static/css/board/board_form.css">`)
            get_board_form()
        }
        show_new_board_form()
    }
}

// Отслеживание события клика по кнопкам
document.addEventListener('click', buttonResponse)

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
    let siteURL = `${window.location.protocol}//${window.location.host}`
    let init = {
        method: 'GET',
        csrftoken: getCookie('csrftoken')
    }

    fetch(`${siteURL}/board/api/board`, init)
    .then(response => {
        if (!response.ok) throw new Error('Что-то не так')
        return response.text()
    })
    .then(html => {sessionStorage.setItem('board', html)})
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

    let boards = document.querySelectorAll('.board')
    let new_board = boards[boards.length - 1]

    new_board.setAttribute('id', data.pk)
    new_board.querySelector('.board__title').innerHTML = data.fields.title
    new_board.querySelector('.board__info_item_tasks').innerHTML = data.fields.tasks.length
    new_board.querySelector('.board__info_item_columns').innerHTML = data.fields.columns.length
    new_board.querySelector('.board__info_item_total-users').innerHTML = data.fields.total_users
}

// Функция отправки формы
function sendForm(event) {
    let form = event.target
    const csrftoken = getCookie('csrftoken');

    event.preventDefault()

    if (form.getAttribute('name') == 'new-board') {
        let init = {
            method: "POST",
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(new FormData(form)))
        }

        fetch('http://127.0.0.1:8000/board/api/board/', init)
        .then(response => {
            if (!response.ok) throw new Error('Что-то не так')
            return response.json()
        })
        .then(data => {add_new_board(data[0])})
        .catch(error => {console.log(error)})
    }
    else {
        let init = {
            method: "PUT",
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(new FormData(form)))
        }

        fetch('http://127.0.0.1:8000/board/api/board/', init)
        .then(response => {
            if (!response.ok) throw new Error('Что-то не так')
            return response.json()
        })
        .then(data => {updateBoard(data[0])})
        .catch(error => {console.log(error)})
    }
}

// Отслеживание события отправки формы
document.addEventListener("submit", sendForm)
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

function hideForm() {
    let = activeForm = document.querySelector('.active')
    if (activeForm) {
        activeForm.classList.remove('active')
    }
}

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

function setup_form_nearby_header(formElement, headerElement) {
    let headerRect = headerElement.getBoundingClientRect()

    formElement.style.position = 'absolute'
    formElement.style.top = `${headerRect.bottom}px`
}

function show_new_board_form() {
    let newBoardForm = document.querySelector('.board-form[name="new-board-form"]')

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

function active_board_form(event) {
    if (event.target.classList.contains('board__button_edit')) {
        show_board_edit_form(event)
    }
    else if (event.target.classList.contains('new-board')) {
        show_new_board_form()
    }
}

function show_board_form(event) {
    let not_forms = document.querySelector('.board-form') == null
    let boardFormStyle = document.querySelector('.board-style')

    if (!boardFormStyle) {
        document.head.insertAdjacentHTML('beforeend', `<link class="board-style" rel="stylesheet" href="static/css/board/board_form.css">`)
    }
    if (not_forms) {
        get_board_form()
        active_board_form(event)
    }
    else {
        active_board_form(event)
    }
}

document.addEventListener('click', show_board_form)

function updateBoard(data) {
    let board = document.querySelector(`.board[id="${data.pk}"]`)

    board.querySelector('.board__title').innerHTML = data.fields.title
    board.querySelector('.board__info_item_tasks').innerHTML = data.fields.tasks.length
    board.querySelector('.board__info_item_columns').innerHTML = data.fields.columns.length
    board.querySelector('.board__info_item_total-users').innerHTML = data.fields.total_users
}

// Функция отправки формы
function sendForm(event) {
    const csrftoken = getCookie('csrftoken');

    event.preventDefault()

    let init = {
        method: "PUT",
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(new FormData(event.target)))
    }

    fetch('http://127.0.0.1:8000/board/api/board/', init)
    .then(response => {
        if (!response.ok) throw new Error('Что-то не так')
        return response.json()
    })
    .then(data => {updateBoard(data[0])})
    .catch(error => {console.log(error)})
}

// Отслеживание события отправки формы
document.addEventListener("submit", sendForm)
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

const csrftoken = getCookie('csrftoken');

// function requestTest() {
//     var init = {
//         method: 'DELETE',
//         headers: {'X-CSRFToken': csrftoken},
//         body: JSON.stringify({'id': 6}),
//     }
//     fetch('http://127.0.0.1:8000/board/api/task', init)
//     .then(response => {
//         if (!response.ok) throw new Error('Что-то не так')
//         return response.text();
//     })
//     .then(data => {console.log(data)})
//     .catch(error => {console.log(error)})
// }


// let button = document.querySelector('.test')
// button.addEventListener('click', requestTest)

// Принцип работы всплывающих форм
// При нажатии на кнопку, после которой должна вылезти форма, сначала отправляется ajax запрос на html код формы
// Далее полученный html код формы вставляется в DOM с применением стилей и остаётся там пока пользователь не 
// нажмёт снова на кнопку редактирования.

function hideForm() {
    let = activeForm = document.querySelector('.active')
    if (activeForm) {
        activeForm.classList.remove('active')
    }
}

function setup_form(formElement, boardElement) {
    let boardRect = boardElement.getBoundingClientRect()
    let formRect = formElement.getBoundingClientRect()

    formElement.setAttribute('value', boardElement.getAttribute('id'))
    formElement.style.position = 'fixed'
    formElement.style.top = `${boardRect.top}px`

    if (boardRect.right + formRect.width > document.documentElement.clientWidth) {
        formElement.style.right = `${document.documentElement.clientWidth - boardRect.left}px`
    }
    else {
        formElement.style.left = `${boardRect.right}px`
    }
}

function get_board_form(event) {
    if (event.target.classList.contains('board__button_edit')) {
        let not_forms = document.querySelector('.board-form') == null
        let htmlBoardForm = sessionStorage.getItem('board-form')
        let board = event.target.parentElement.parentElement
        let boardForm = document.querySelector(`.board-form[value="${board.getAttribute('id')}"]`)

        if (not_forms) {
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
                document.head.insertAdjacentHTML('afterend', `<link rel="stylesheet" href="static/css/board/board_form.css">`)
                board.insertAdjacentHTML('afterend', html)

                let boardForm = document.querySelector(`.board-form`)
                setup_form(boardForm, board)

                boardForm.classList.toggle('active')
            })
            .catch(error => {console.log(error)})
        }
        else if (boardForm) {

            if (boardForm.classList.contains('active')) {
                boardForm.classList.remove('active')
            }
            else if (!boardForm.classList.contains('active')) {
                hideForm()
                boardForm.classList.toggle('active')
            }
        }
        else {
            board.insertAdjacentHTML('afterend', htmlBoardForm)
            let boardForm = document.querySelector(`.board-form[value=""]`)

            hideForm()

            setup_form(boardForm, board)

            boardForm.classList.toggle('active')
        }
    }
}

document.addEventListener('click', get_board_form)

// Проблема отображения уже вставленной формы.
// Если досок будет несколько, то при нажатии редактирования у другой доски, форма отобразится у доски, у которой она была вызвана в первый
// раз.
// Можно сохранить скачанную форму в кэш, а уже потом, когда у конкретной доски будет вызвано редактирование, форма будет вставлена рядом с
// с ней, и по необходимости будет исчезать или появлятся путём активации класса active. При всём этом будет проверка на то, чтобы 
// отображалась только одна форма на странице 


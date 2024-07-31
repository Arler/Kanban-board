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
// обновит страницу.

const edit_button = document.querySelector('.board__button_edit')

function get_board_form(event) {
    let boardForm = document.querySelector('.board-form')
    console.log(boardForm)
    if (boardForm == null) {
        let board = event.target.parentElement.parentElement
        let boardRect = board.getBoundingClientRect()
        let container = document.querySelector('.container')

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
            document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="static/css/board/board_form.css">`)
            container.insertAdjacentHTML('afterbegin', html)
            const boardForm = container.querySelector('.board-form')

            boardForm.style.position = 'fixed'
            boardForm.style.top = `${boardRect.top}px`

            if (boardRect.right + 100 > document.documentElement.clientWidth) {
                boardForm.style.right = `${boardRect.left}px`
            }
            else {
                boardForm.style.left = `${boardRect.right}px`
            }

            boardForm.classList.toggle('active')
        })
        .catch(error => {console.log(error)})
    }
    else if (boardForm.classList.contains('active')) {
        boardForm.classList.remove('active')
    }
    else if (!boardForm.classList.contains('active')) {
        boardForm.classList.toggle('active')
    }
}

edit_button.addEventListener('click', get_board_form)

// Проблема отображения уже вставленной формы.
// Если досок будет несколько, то при нажатии редактирования у другой доски, форма отобразится у доски, у которой она была вызвана в первый
// раз.
// Можно сохранить скачанную форму в кэш, а уже потом, когда у конкретной доски будет вызвано редактирование, форма будет вставлена рядом с
// с ней, и по необходимости будет исчезать или появлятся путём активации класса active. При всём этом будет проверка на то, чтобы 
// существовала только одна форма на странице
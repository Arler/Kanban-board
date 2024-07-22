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

function requestTest() {
    var init = {
        method: 'DELETE',
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({'id': 6}),
    }
    fetch('http://127.0.0.1:8000/board/api/task', init)
    .then(response => {
        if (!response.ok) throw new Error('Что-то не так')
        return response.text();
    })
    .then(data => {console.log(data)})
    .catch(error => {console.log(error)})
}


let button = document.querySelector('.test')
button.addEventListener('click', requestTest)
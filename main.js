const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const urlApi = "http://localhost:3000/tasks"

const taskList = $('#task-list')
const form = $('#todo-form')
const taskInput = $('.todo-input')
const submitBtn = $(".submit-btn")

const toast = $("#toast-message")

// 1. phòng xxs

function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;

}
// 2. check duplicate task
// function isDuplicate(inputValue) {
//     getTasks(function(tasks) {
//         const index = tasks.findIndex(task => task.title.toLowerCase() === inputValue.toLowerCase())
//     })
// }

//3. subit form
function submitForm(e) {
    e.preventDefault()

    const taskValue =  taskInput.value.trim()

    if(!taskValue) {
        showToast({message: 'Please enter your task.', status: 'empty'})
        return
    }
    getTasks(function(tasks) {
        const index = tasks.findIndex(task => {
            return task.title.toLowerCase() === taskValue.toLowerCase()
        })
        if(index !== -1) {
            alert('Task already exists!')
            return
        }
        postTask(taskValue)
        taskInput.value = ''
    })
}

//4. post and get apt

function postTask(taskValue) {
    fetch(urlApi, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "title": `${taskValue}`,
            "completed": false
        })
    })
    .then(response => response.json())
    .then(data => {
        render(); 
    })
    .catch(error => console.error('Error:', error))
    .finally(() => {
        taskInput.value = ''
    })
}

function getTasks(callback) {
    fetch(urlApi)
        .then(response => response.json())
        .then((tasks) => callback(tasks))

}

// 5.render
function render() {
    getTasks(function(tasks) {
        const htmls = tasks.map(task => {
            return `
                    <li class="task-item ${task.completed ? 'completed' : ''}">
                        <p class="task-title">${escapeHTML(task.title)}</p>
                        <div class="task-action">
                            <button class="btn btn-edit">Edit</button>
                            <button class="btn btn-done ">Done</button>
                            <button class="btn btn-delete">Delete</button>
                        </div>
                    </li>`
        })
        taskList.innerHTML = htmls.join('')
    })
}

//toast message
function showToast(obj) {
    const {message, status} = obj

    if(toast) {
    // tạo toast message
    const div = document.createElement('div')
    div.className = `toast toast--${status}`


    //auto remove
    const autoRemoveId = setTimeout(function() {
        toast.removeChild(div)
    },4000)

    // remove whwn click
    div.onclick = function(e) {
        if(e.target.closest(".toast__close")) {
            toast.removeChild(div)
            clearTimeout(autoRemoveId) //hủy auto settimeout ở trên
        }
    }


    div.innerHTML = `
        <p class="toast-content">${message}</p>
        <span class="toast__close"><i class="fa-solid fa-xmark"></i></span>`
    
        toast.appendChild(div)
    }
    
}



// showToast({message: 'Task already exists.', status: 'duplicate'})
// showToast({message: 'Task updated.', status: 'updated'})
// showToast({message: 'Task deleted.', status: 'deleted'})



render()
form.addEventListener('submit', submitForm)








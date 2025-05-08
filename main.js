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

submitBtn.onmousedown = function(e) {
    e.preventDefault()
}

//3. subit form
function submitForm(e, taskInput) {
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
            showToast({message: 'Task already exists.', status: 'duplicate'})
            taskInput.value = ''
            return
        }
        postTask(taskValue)
        taskInput.value = ''
    })
}
form.addEventListener('submit', (e)=> submitForm(e, taskInput))

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
function updateTask(taskItem,newTitle) {
    fetch(`${urlApi}/${taskItem.dataset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
    }) 
        .then(response => response.json())
        .then(()=> render())
}

// 5.render
function render() {
    getTasks(function(tasks) {
        const htmls = tasks.map((task) => {
            return `
                    <li data-id="${task.id}" class="task-item ${task.completed ? 'completed' : ''}">
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

//6. edit task


taskList.onclick = function(e) {

    const taskItem = e.target.closest(".task-item")
    const taskTitle = taskItem.querySelector(".task-title")
    const taskAction = taskItem.querySelector(".task-action")
    
    if(e.target.classList.contains("btn-edit")) {
        const form = document.createElement('form')
        form.className = 'edit-form'
        const formEdit = `
        <input 
            type="text" 
            class="input-edit" 
            value="${taskItem.querySelector(".task-title").innerText}">
        <button type="submit"class="btn btn-update">UPDATE</button>
        <button class="btn btn-cancel">CANCEL</button>`

        form.innerHTML = formEdit
        taskItem.appendChild(form)
        taskItem.removeChild(taskTitle)
        taskItem.removeChild(taskAction)

        const inputEdit = form.querySelector(".input-edit")
        const btnUpdate = form.querySelector(".btn-update")
        const btnCancel = form.querySelector(".btn-cancel")

        inputEdit.focus()
        inputEdit.setSelectionRange(inputEdit.value.length, inputEdit.value.length)

        btnCancel.addEventListener('click', () => {
            form.remove();                          // Xóa form đang edit
            taskItem.appendChild(taskTitle);        // Thêm lại nội dung gốc
            taskItem.appendChild(taskAction);       // Thêm lại các nút
        });

        function submitForm(e, taskInput) {
            e.preventDefault()
        
            const taskValue =  taskInput.value.trim()
            if(!taskValue) {
                showToast({message: 'Please enter your task.', status: 'empty'})
                inputEdit.focus()
                return
            }
            getTasks(function(tasks) {
                const indexDuplicated = tasks.find((task) => {
                    return task.title.toLowerCase() === taskValue.toLowerCase() && task.id !== taskItem.dataset.id// taskItem.dataset.id là một chuỗi, chú ý kiểu so sánh
                })

                if(indexDuplicated) {
                    showToast({message: 'Task already exists.', status: 'duplicate'})
                    taskInput.value = taskValue
                    inputEdit.focus()
                    inputEdit.setSelectionRange(inputEdit.value.length, inputEdit.value.length)
                    return
                }
                updateTask(taskItem, taskValue)
                showToast({message: 'Task updated.', status: 'updated'})
                // render()
                // taskTitle.innerText = taskValue
                taskItem.removeChild(form)
                taskItem.appendChild(taskTitle)
                taskItem.appendChild(taskAction)
            })
        }
        form.addEventListener('submit', (e)=> submitForm(e, inputEdit))
    }
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

// showToast({message: 'Task updated.', status: 'updated'})
// showToast({message: 'Task deleted.', status: 'deleted'})



render()









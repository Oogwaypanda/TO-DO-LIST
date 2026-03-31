const tasksList = document.querySelector("#tasks-list");
const addTaskForm = document.querySelector("#add-task-form");
const addTaskInput = document.querySelector("#add-task-input");
const clearAllTasksBtn = document.querySelector("#clear-all-btn");
const clearCompBtn = document.querySelector("#clear-completed-btn");

let list = JSON.parse(localStorage.getItem("tasks")) || [];

function saveAndRender() {
    localStorage.setItem("tasks", JSON.stringify(list));
    showTasksList();
}

function showTasksList() {
    tasksList.innerHTML = "";
    clearAllTasksBtn.disabled = list.length === 0;
    clearCompBtn.disabled = !list.some(t => t.completed);

    if (list.length === 0) {
        tasksList.style.border = "none";
        tasksList.innerHTML = `
            <div class="ui icon warning message">
                <i class="inbox icon"></i>
                <div class="content">
                    <div class="header">You have no tasks today!</div>
                    <div>Enter your tasks above.</div>
                </div>
            </div>`;
        return;
    }

    tasksList.style.border = "1px solid rgba(34,36,38,.15)";
    
    // Sort so newest are at the top
    [...list].reverse().forEach(task => {
        const li = document.createElement('li');
        li.className = `ui segment ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="ui checkbox">
                <input type="checkbox" ${task.completed ? "checked" : ""} onchange="completeTask(${task.id})">
                <label>${task.text}</label>
            </div>
            <div>
                <i class="edit blue outline icon" onclick="showEditModal(${task.id})"></i>
                <i class="trash red alternate outline icon" onclick="showRemoveModal(${task.id})"></i>
            </div>`;
        tasksList.appendChild(li);
    });
}

function addTask(event) {
    event.preventDefault();
    const text = addTaskInput.value.trim();
    if (!text) return;

    list.push({ id: Date.now(), text: text, completed: false });
    addTaskInput.value = "";
    showNotification("success", "Task added");
    saveAndRender();
}

window.completeTask = (id) => {
    list = list.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
};

window.showEditModal = (id) => {
    const task = list.find(t => t.id === id);
    document.querySelector("#edit-task-input").value = task.text;
    
    document.querySelector("#update-button").onclick = () => {
        const newText = document.querySelector("#edit-task-input").value.trim();
        if (newText) {
            list = list.map(t => t.id === id ? { ...t, text: newText } : t);
            $("#edit-modal").modal("hide");
            saveAndRender();
            showNotification("success", "Task updated");
        }
    };
    $("#edit-modal").modal("show");
};

window.showRemoveModal = (id) => {
    document.querySelector("#confirm-remove-btn").onclick = () => {
        list = list.filter(t => t.id !== id);
        $("#remove-modal").modal("hide");
        saveAndRender();
        showNotification("error", "Task deleted");
    };
    $("#remove-modal").modal("show");
};

window.showModal = (selector) => {
    $(selector).modal("show");
};

window.clearAllTasks = () => {
    list = [];
    $("#clear-all-tasks-modal").modal("hide");
    saveAndRender();
    showNotification("error", "All tasks cleared");
};

window.clearCompletedTasks = () => {
    list = list.filter(t => !t.completed);
    $("#clear-completed-tasks-modal").modal("hide");
    saveAndRender();
    showNotification("success", "Completed tasks cleared");
};

function showNotification(type, text) {
    new Noty({
        type,
        text: `<i class="check icon"></i> ${text}`,
        layout: "bottomRight",
        timeout: 2000,
        theme: "metroui"
    }).show();
}

addTaskForm.addEventListener("submit", addTask);
window.onload = () => {
    addTaskInput.focus();
    showTasksList();
};

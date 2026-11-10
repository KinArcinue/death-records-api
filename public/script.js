
// API BASE URL
const API_URL = "";

// HTML ELEMENTS
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const dashboardSection = document.getElementById("dashboard-section");

// SWITCH BETWEEN LOGIN AND REGISTER
document.getElementById("show-register").addEventListener("click", (e) => {
    e.preventDefault();

    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
});

document.getElementById("show-login").addEventListener("click", (e) => {
    e.preventDefault();

    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});

// REGISTRATION
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const message = document.getElementById("register-message");

    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            message.style.color = "green";

            document.getElementById("register-form").reset();

            setTimeout(() => {
                registerSection.classList.add("hidden");
                loginSection.classList.remove("hidden");
            }, 1000);
        } else {
            message.style.color = "red";
        }

    } catch (error) {
        message.textContent = "Unable to connect to server.";
        message.style.color = "red";
    }
});

// LOGIN
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const message = document.getElementById("login-message");

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem("token", data.token);

            message.style.color = "green";
            message.textContent = "Login successful!";

            document.getElementById("login-form").reset();

            showDashboard();
        } else {
            message.style.color = "red";
            message.textContent = data.message;
        }

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server.";
    }
});

// SHOW DASHBOARD
function showDashboard() {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");

    loadRecords();
}

// LOGOUT
document.getElementById("logout-button").addEventListener("click", (e) => {
    e.preventDefault();

    sessionStorage.removeItem("token");

    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    document.getElementById("login-message").textContent = "";
});

// CHECK IF USER IS ALREADY LOGGED IN
if (sessionStorage.getItem("token")) {
    showDashboard();
}

// ==========================================
// DEATH RECORDS MANAGEMENT (CRUD)
// ==========================================

let editingRecordId = null;

// GET ALL DEATH RECORDS
async function loadRecords() {
    const token = sessionStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/api/death-records`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            alert("Your session has expired. Please log in again.");
            sessionStorage.removeItem("token");
            dashboardSection.classList.add("hidden");
            loginSection.classList.remove("hidden");
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load records");
        }

        const records = await response.json();

        displayRecords(records);

        document.getElementById("total-records").textContent = records.length;

    } catch (error) {
        document.getElementById("record-message").textContent =
            "Error loading death records.";
    }
}

// DISPLAY RECORDS IN TABLE
function displayRecords(records) {
    const table = document.getElementById("records-table");

    table.replaceChildren();

    if (records.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No death records found.";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    records.forEach(record => {
        const row = document.createElement("tr");

        const values = [
            record.id,
            record.full_name,
            record.date_of_death,
            record.place_of_death || "Not specified"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editRecord(record));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.background = "#dc3545";
        deleteButton.addEventListener("click", () => deleteRecord(record.id));

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        row.appendChild(actions);
        table.appendChild(row);
    });
}

// SHOW ADD RECORD FORM
document.getElementById("show-add-form").addEventListener("click", () => {
    editingRecordId = null;

    document.getElementById("record-form").reset();
    document.getElementById("form-title").textContent = "Add Death Record";
    document.getElementById("save-record").textContent = "Save Record";

    document.getElementById("record-form").classList.remove("hidden");
});

// ADD OR UPDATE RECORD
document.getElementById("record-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");

    const full_name = document.getElementById("full-name").value;
    const date_of_death = document.getElementById("date-of-death").value;
    const place_of_death = document.getElementById("place-of-death").value;

    const record = {
        full_name,
        date_of_death,
        place_of_death
    };

    const isEditing = editingRecordId !== null;

    const url = isEditing
        ? `${API_URL}/api/death-records/${editingRecordId}`
        : `${API_URL}/api/death-records`;

    try {
        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(record)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to save record");
        }

        document.getElementById("record-message").textContent = data.message;
        document.getElementById("record-message").style.color = "green";

        document.getElementById("record-form").reset();
        document.getElementById("record-form").classList.add("hidden");

        editingRecordId = null;

        await loadRecords();

    } catch (error) {
        document.getElementById("record-message").textContent = error.message;
        document.getElementById("record-message").style.color = "red";
    }
});

// EDIT RECORD
function editRecord(record) {
    editingRecordId = record.id;

    document.getElementById("full-name").value = record.full_name;
    document.getElementById("date-of-death").value = record.date_of_death;
    document.getElementById("place-of-death").value = record.place_of_death || "";

    document.getElementById("form-title").textContent = "Edit Death Record";
    document.getElementById("save-record").textContent = "Update Record";

    document.getElementById("record-form").classList.remove("hidden");

    document.getElementById("record-form").scrollIntoView({
        behavior: "smooth"
    });
}

// DELETE RECORD
async function deleteRecord(id) {
    const confirmed = confirm("Are you sure you want to delete this death record?");

    if (!confirmed) {
        return;
    }

    const token = sessionStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/api/death-records/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete record");
        }

        document.getElementById("record-message").textContent = data.message;
        document.getElementById("record-message").style.color = "green";

        await loadRecords();

    } catch (error) {
        document.getElementById("record-message").textContent = error.message;
        document.getElementById("record-message").style.color = "red";
    }
}

// CANCEL RECORD FORM
document.getElementById("cancel-form").addEventListener("click", () => {
    editingRecordId = null;

    document.getElementById("record-form").reset();
    document.getElementById("record-form").classList.add("hidden");
});

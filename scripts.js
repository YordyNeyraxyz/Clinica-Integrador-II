// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if(email === "" || password === "") {
            alert("Completa todos los campos");
            return;
        }

        if(email === "admin@test.com" && password === "123456") {
            alert("Login exitoso");
        } else {
            alert("Credenciales incorrectas");
        }
    });
}

// REGISTRO
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;

        if(name === "" || email === "" || password === "") {
            alert("Completa todos los campos");
            return;
        }

        alert("Cuenta creada correctamente");

        // Redirige al login
        window.location.href = "login.html";
    });
}
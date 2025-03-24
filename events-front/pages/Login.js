import { apiFetch } from "../services/apiFetch";
import { loadComponent } from "../main";
export function render() {
  return `
    <h2>Iniciar Sesión</h2>
    <form id="login-form">
      <label for="username">Nombre de usuario:</label>
      <input type="text" id="username" name="username" />
      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" />
      <button type="submit">Iniciar Sesión</button>
    </form>
    <div id="error-message-container"></div>
  `;
}

export function setupLogin() {
  const form = document.querySelector("#login-form");
  const errorMessage = document.querySelector("#error-message-container");
  const usernameInput = document.querySelector("#username");
  const passwordInput = document.querySelector("#password");

  usernameInput.addEventListener("input", clearErrorMessage);
  passwordInput.addEventListener("input", clearErrorMessage);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showErrorMessage(
        "El nombre de usuario y la contraseña no pueden estar vacíos."
      );
      return;
    }

    if (password.length < 6) {
      showErrorMessage("La contraseña es demasiado corta.");
      return;
    }

    try {
      await submit(username, password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      showErrorMessage("Ha ocurrido un error. Por favor, inténtalo más tarde.");
    }
  });
}

const showErrorMessage = (message) => {
  const existingError = document.querySelector("#error-message");
  if (existingError) {
    existingError.remove();
  }

  const errorMessage = document.createElement("p");
  errorMessage.id = "error-message";
  errorMessage.style.color = "red";
  errorMessage.textContent = message;
  document.querySelector("#error-message-container").appendChild(errorMessage);
};

const clearErrorMessage = () => {
  const existingError = document.querySelector("#error-message");
  if (existingError) {
    existingError.remove();
  }
};

export const submit = async (username, password) => {
  clearErrorMessage();
  const objetoFinal = JSON.stringify({
    userName: username,
    password: password,
  });

  try {
    const res = await apiFetch("/users/login", {
      method: "POST",
      body: objetoFinal,
    });

    if (res.status === 404 || res.status === 401) {
      showErrorMessage("Usuario o contraseña incorrectos.");
      return;
    }

    const respuestaFinal = await res.json();

    localStorage.setItem("token", respuestaFinal.token);
    localStorage.setItem("user", respuestaFinal.user._id);

    alert("Welcome!");
    loadComponent("home");
  } catch (error) {
    showErrorMessage(
      "Hubo un error al intentar iniciar sesión. Por favor, inténtelo de nuevo más tarde."
    );
  }
};

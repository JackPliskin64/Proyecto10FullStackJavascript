import { apiFetch } from "../services/apiFetch";
import { loadComponent } from "../main";
export function render() {
  return `
    <h2>Login</h2>
    <form id="login-form">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" />
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" />
      <button type="submit">Login</button>
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
      showErrorMessage("Username and password cannot be empty.");
      return;
    }

    if (password.length < 6) {
      showErrorMessage("Password too short.");
      return;
    }

    try {
      await submit(username, password);
    } catch (error) {
      console.error("Login failed:", error);
      showErrorMessage("An error occurred. Please try again later.");
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
      showErrorMessage("Invalid username or password.");
      return;
    }

    const respuestaFinal = await res.json();

    localStorage.setItem("token", respuestaFinal.token);
    localStorage.setItem("user", respuestaFinal.user._id);

    alert("Welcome!");
    loadComponent("home");
  } catch (error) {
    showErrorMessage(
      "There was an error while trying to log in. Please try again later."
    );
  }
};

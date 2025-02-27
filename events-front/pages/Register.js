import { submit } from "./Login.js";
import { apiFetch } from "../services/apiFetch.js";

export function render() {
  return `
      <h2>Register</h2>
      <form id="register-form">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" />
        
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" />
  
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" />
        
        <label for="confirm-password">Confirm Password:</label>
        <input type="password" id="confirm-password" name="confirm-password" />
  
        <button type="submit">Register</button>
      </form>
      <div id="error-message-container"></div>
      <div id="requirements-container"></div>
      <div id="required-acctions-container" style="display: none"> <p id="req-acctions-title">Required acctions:</p></div>
    `;
}

export function setupRegister() {
  const form = document.querySelector("#register-form");

  let isUsernameInput = false;

  const usernameInput = document.querySelector("#username");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const confirmPasswordInput = document.querySelector("#confirm-password");
  const reqAcctionsContainer = document.querySelector(
    "#required-acctions-container"
  );
  const reqsContainer = document.querySelector("#requirements-container");

  usernameInput.addEventListener("focus", () => {
    isUsernameInput = true;
    validateUsernameReqs();
  });
  passwordInput.addEventListener("focus", () => {
    isUsernameInput = false;
    validatePasswordReqs();
  });

  usernameInput.addEventListener("input", () => {
    isUsernameInput = true;
    showRequirements();
  });
  passwordInput.addEventListener("input", () => {
    isUsernameInput = false;
    showRequirements();
  });

  usernameInput.addEventListener("blur", () => validateUsername());
  passwordInput.addEventListener("blur", () => validatePassword());
  emailInput.addEventListener("blur", () => validateEmail());
  confirmPasswordInput.addEventListener("blur", () =>
    validateConfirmPassword()
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const validEmail = validateEmail();
    const validUsername = validateUsername();
    const validPassword = validatePassword();
    const validConfirmPassword = validateConfirmPassword();

    if (
      !(validUsername && validEmail && validPassword && validConfirmPassword)
    ) {
      return;
    }

    try {
      await submitRegister(username, email, password);
    } catch (error) {
      console.error("Error al registrar:", error);
      showErrorMessage("Ocurrió un error. Por favor, inténtalo más tarde.");
    }
  });

  function validateEmail() {
    const email = emailInput.value.trim();
    const element_id = "invalid-email";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      showRequiredActions("El correo electrónico es obligatorio.", element_id);
      return false;
    } else if (!emailRegex.test(email)) {
      showRequiredActions(
        "Por favor, introduce un correo electrónico válido (ej: address@mail.com)",
        element_id
      );
      return false;
    } else {
      clearRequiredActions(element_id);
      updateRequiredActions();
      return true;
    }
  }

  function validateConfirmPassword() {
    const password = passwordInput.value.trim();
    const element_id = "invalid-confirm-password";
    const confirmPassword = confirmPasswordInput.value.trim();
    if (!confirmPassword || confirmPassword !== password) {
      showRequiredActions("Las contraseñas no coinciden.", element_id);
      return false;
    } else {
      clearRequiredActions(element_id);
      updateRequiredActions();
      return true;
    }
  }

  const showRequirements = () => {
    clearRequirements();
    const reqsContainer = document.querySelector("#requirements-container");
    const reqs = document.createElement("div");
    reqs.id = "requirements";
    if (isUsernameInput) {
      const usernameValue = usernameInput.value.trim();

      const req1 = document.createElement("p");
      req1.textContent = "Username debe tener al menos 3 caracteres";
      req1.style.color = usernameValue.length >= 3 ? "green" : "red";

      const req2 = document.createElement("p");
      req2.textContent = "Debe tener al menos un número";
      req2.style.color = /\d/.test(usernameValue) ? "green" : "red";

      reqs.appendChild(req1);
      reqs.appendChild(req2);
    } else {
      const passwordValue = passwordInput.value.trim();

      const req1 = document.createElement("p");
      req1.textContent = "La contraseña debe tener al menos 6 caracteres";
      req1.style.color = passwordValue.length >= 6 ? "green" : "red";

      const req2 = document.createElement("p");
      req2.textContent = "Debe contener al menos una mayúscula";
      req2.style.color = /[A-Z]/.test(passwordValue) ? "green" : "red";

      const req3 = document.createElement("p");
      req3.textContent = "Debe contener al menos una minúscula";
      req3.style.color = /[a-z]/.test(passwordValue) ? "green" : "red";

      const req4 = document.createElement("p");
      req4.textContent = "Debe contener al menos un número";
      req4.style.color = /\d/.test(passwordValue) ? "green" : "red";

      reqs.appendChild(req1);
      reqs.appendChild(req2);
      reqs.appendChild(req3);
      reqs.appendChild(req4);
    }
    reqsContainer.appendChild(reqs);
  };

  const clearRequirements = () => {
    const existingReqs = document.getElementById("requirements");
    if (existingReqs) {
      existingReqs.remove();
    }
  };

  const showRequiredActions = (message, element_id) => {
    clearRequiredActions(element_id);
    reqAcctionsContainer.style.display = "block";
    const errorMessage = document.createElement("p");
    errorMessage.id = element_id;
    errorMessage.style.color = "red";
    errorMessage.textContent = message;
    document
      .querySelector("#required-acctions-container")
      .appendChild(errorMessage);
  };

  const clearRequiredActions = (element_id) => {
    const existingError = document.getElementById(element_id);
    if (existingError) {
      existingError.remove();
    }
  };

  const updateRequiredActions = () => {
    if (
      document.querySelector("#required-acctions-container").childElementCount <
      2
    ) {
      reqAcctionsContainer.style.display = "none";
    }
  };

  function validateUsernameReqs() {
    clearRequirements();
    if (
      usernameInput.value.trim().length >= 3 &&
      /\d/.test(usernameInput.value)
    ) {
      return true;
    } else {
      showRequirements();
      return false;
    }
  }

  function validatePasswordReqs() {
    clearRequirements();
    if (
      passwordInput.value.trim().length >= 6 &&
      /[A-Z]/.test(passwordInput.value) &&
      /[a-z]/.test(passwordInput.value) &&
      /\d/.test(passwordInput.value)
    ) {
      return true;
    } else {
      showRequirements();
      return false;
    }
  }

  function validateUsername() {
    const element_id = "invalid-username";
    if (validateUsernameReqs()) {
      //añadir comprobación username existnete
      clearRequiredActions(element_id);
      updateRequiredActions();
      return true;
    } else {
      clearRequirements();
      showRequiredActions(
        "Por favor, revisa los requisitos e introduce un nombre de usuario válido.",
        element_id
      );
      return false;
    }
  }

  function validatePassword() {
    const element_id = "invalid-password";
    if (validatePasswordReqs()) {
      clearRequiredActions(element_id);
      updateRequiredActions();
      return true;
    } else {
      clearRequirements();
      showRequiredActions(
        "Por favor, revisa los requisitos e introduce una contraseña válida.",
        element_id
      );
      return false;
    }
  }
}

const submitRegister = async (username, email, password) => {
  const data = {
    userName: username,
    email: email,
    password: password,
  };

  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Processing registration...";
  document
    .querySelector("#error-message-container")
    .appendChild(loadingMessage);

  try {
    const res = await apiFetch("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    loadingMessage.remove();

    if (res.status === 409) {
      if (res.json == "Usuario ya existente") {
        showErrorMessage(
          "Ya existe un usuario con este nombre único. Por favor, introduce otro username."
        );
      } else {
        showErrorMessage(
          "Ya existe un usuario con este correo electrónico. Por favor, introduce otro correo."
        );
      }
      return;
    } else if (res.status !== 201) {
      showErrorMessage(
        "Hubo un error al intentar registrarse. Por favor, inténtalo más tarde."
      );
      return;
    }

    showSuccessMessage("Registro exitoso! Realizando el login...");

    setTimeout(() => {
      //loadComponent("login");
      submit(username, password);
    }, 2000);
  } catch (error) {
    loadingMessage.remove();
    showErrorMessage(
      "Hubo un error al intentar registrarse. Por favor, inténtalo más tarde."
    );
  }
};

const showErrorMessage = (message) => {
  clearErrorMessage();
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

const showSuccessMessage = (message) => {
  const successMessage = document.createElement("p");
  successMessage.style.color = "green";
  successMessage.textContent = message;
  document
    .querySelector("#error-message-container")
    .appendChild(successMessage);

  setTimeout(() => {
    successMessage.remove();
  }, 3000);
};

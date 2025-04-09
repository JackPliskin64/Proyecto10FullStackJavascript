import { apiFetch } from "../services/apiFetch";

export function render() {
  return `
    <h2>Mi Perfil</h2>
    <div id="profile-container">
      <div id="profile-picture-section">
        <img id="profile-picture" src="default-profile.jpg" alt="Imagen de Perfil" />
        <input type="file" id="profile-image-upload" accept="image/*" style="display:none;" />
        <button id="upload-image-btn">Subir Imagen</button>
      </div>
      
      <div id="profile-details-section">
        <p id="email-section">
          <strong>Correo electrónico:</strong> <span id="user-email"></span>
        </p>
        <div id="username-section"> 
        <p><strong>Nombre de usuario:</strong> 
        <span id="user-name"></span> <div id="edit-username-div"><button id="edit-username-btn">Editar</button></p></div>
        <form id="username-form">
          <input type="text" id="username-input" value="" />
          <button type="submit" id="update-username-btn">Actualizar nombre de usuario</button>
          <button type="button" id="cancel-update-btn">Cancelar</button>
        </form>
        <p id="feedback-message"></p></div>
      </div>
    </div>
  `;
}

export async function setupMyProfile() {
  const usernameForm = document.getElementById("username-form");
  const usernameInput = document.getElementById("username-input");
  const feedbackMessage = document.getElementById("feedback-message");
  const profilePicture = document.getElementById("profile-picture");
  const userNameSpan = document.getElementById("user-name");
  const userEmailSpan = document.getElementById("user-email");
  const uploadImageBtn = document.getElementById("upload-image-btn");
  const imageUploadInput = document.getElementById("profile-image-upload");
  const editUsernameBtn = document.getElementById("edit-username-btn");
  const cancelUpdateBtn = document.getElementById("cancel-update-btn");

  const userId = localStorage.getItem("user");
  if (!userId) {
    console.error("No se encontró el usuario en el localStorage");
    feedbackMessage.textContent = "Fallo al cargar el perfil del usuario.";
    feedbackMessage.style.color = "red";
    return;
  }

  try {
    const res = await apiFetch(`/users/${userId}`, {
      method: "GET",
    });

    if (res) {
      const { userName, email, image } = await res.json();
      userNameSpan.textContent = userName;
      userEmailSpan.textContent = email;
      usernameInput.value = userName;
      profilePicture.src = image;
    } else {
      feedbackMessage.textContent = "Fallo al cargar el perfil del usuario.";
      feedbackMessage.style.color = "red";
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    feedbackMessage.textContent =
      "Ocurrió un error. Por favor, inténtalo de nuevo.";
    feedbackMessage.style.color = "red";
  }

  editUsernameBtn.addEventListener("click", () => {
    userNameSpan.style.display = "none";
    editUsernameBtn.style.display = "none";
    usernameForm.style.display = "flex";
    feedbackMessage.style.display = "none";
  });

  cancelUpdateBtn.addEventListener("click", () => {
    userNameSpan.style.display = "inline";
    editUsernameBtn.style.display = "inline";
    usernameForm.style.display = "none";
    feedbackMessage.style.display = "none";
  });

  usernameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = usernameInput.value.trim();
    feedbackMessage.style.display = "inline";
    if (!newUsername) {
      feedbackMessage.textContent =
        "El nombre de usuario no puede estar vacío.";
      return;
    } else if (userNameSpan.textContent.trim() === newUsername) {
      feedbackMessage.textContent =
        "El nombre de usuario nuevo es el mismo que el antiguo.";
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.error(
        "No se encontró el token, el usuario no esta autentificado."
      );
      return;
    }

    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userName: newUsername }),
      });
      feedbackMessage.style.display = "inline";
      if (res) {
        feedbackMessage.textContent =
          "El nombre de usuario se actualizó correctamente.";
        feedbackMessage.style.color = "green";
        userNameSpan.textContent = newUsername;
        usernameForm.style.display = "none";
        userNameSpan.style.display = "inline";
        editUsernameBtn.style.display = "inline";
      } else {
        feedbackMessage.textContent = "El nombre de usuario ya existe.";
        feedbackMessage.style.color = "red";
      }
    } catch (error) {
      feedbackMessage.style.display = "inline";
      console.error("Error ual actualizar el nombre de usuario:", error);
      feedbackMessage.textContent =
        "Ocurrió un error. Por favor, inténtalo de nuevo.";
    }
  });

  uploadImageBtn.addEventListener("click", () => {
    imageUploadInput.click();
  });

  imageUploadInput.addEventListener("change", async () => {
    const file = imageUploadInput.files[0];
    if (!file) return;
    feedbackMessage.style.display = "inline";
    feedbackMessage.textContent = "Procesando registro...";
    feedbackMessage.style.color = "blue";
    const formData = new FormData();
    formData.append("img", file);
    const token = localStorage.getItem("token");

    try {
      const res = await apiFetch(`/users/profileImage/${userId}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const { imageUrl } = await res.json();
        profilePicture.src = imageUrl;
        feedbackMessage.textContent = "Imagen de perfil actualizada.";
        feedbackMessage.style.color = "green";
      } else {
        feedbackMessage.textContent = "Fallo al subir la imagen.";
        feedbackMessage.style.color = "red";
      }
    } catch (error) {
      console.error("Error  al subir la imagen:", error);
      feedbackMessage.textContent =
        "Ocurrió un error. Por favor, inténtalo de nuevo.";
    }
  });
}

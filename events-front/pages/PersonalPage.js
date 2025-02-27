import { apiFetch } from "../services/apiFetch";

export function render() {
  return `
    <h2>My Profile</h2>
    <div id="profile-container">
      <div id="profile-picture-section">
        <img id="profile-picture" src="default-profile.jpg" alt="Profile Picture" />
        <input type="file" id="profile-image-upload" accept="image/*" style="display:none;" />
        <button id="upload-image-btn">Upload Image</button>
      </div>
      
      <div id="profile-details-section">
        <p id="email-section">
          <strong>Email:</strong> <span id="user-email"></span>
        </p>
        <p><strong>Username:</strong> <span id="user-name"></span> <button id="edit-username-btn">Edit</button></p>
        <form id="username-form" style="display:none;">
          <input type="text" id="username-input" value="" />
          <button type="submit" id="update-username-btn">Update Username</button>
          <button type="button" id="cancel-update-btn">Cancel</button>
        </form>
        <p id="feedback-message"></p>
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
    console.error("No user found in localStorage");
    feedbackMessage.textContent = "Failed to load user profile.";
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
      feedbackMessage.textContent = "Failed to load user profile.";
      feedbackMessage.style.color = "red";
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    feedbackMessage.textContent = "An error occurred. Please try again.";
    feedbackMessage.style.color = "red";
  }

  editUsernameBtn.addEventListener("click", () => {
    userNameSpan.style.display = "none";
    editUsernameBtn.style.display = "none";
    usernameForm.style.display = "flex";
  });

  cancelUpdateBtn.addEventListener("click", () => {
    userNameSpan.style.display = "inline";
    editUsernameBtn.style.display = "inline";
    usernameForm.style.display = "none";
  });

  usernameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = usernameInput.value.trim();
    if (!newUsername) {
      feedbackMessage.textContent = "Username no puede ser vacío";
      return;
    } else if (userNameSpan.textContent.trim() === newUsername) {
      feedbackMessage.textContent = "Username coincide con el valor antiguo";
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found, user is not authenticated.");
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

      if (res) {
        feedbackMessage.textContent = "Username updated successfully!";
        feedbackMessage.style.color = "green";
        userNameSpan.textContent = newUsername;
        usernameForm.style.display = "none";
        userNameSpan.style.display = "inline";
        editUsernameBtn.style.display = "inline";
      } else {
        feedbackMessage.textContent = "Username already exists!";
        feedbackMessage.style.color = "red";
      }
    } catch (error) {
      console.error("Error updating username:", error);
      feedbackMessage.textContent = "An error occurred. Please try again.";
    }
  });

  uploadImageBtn.addEventListener("click", () => {
    imageUploadInput.click();
  });

  imageUploadInput.addEventListener("change", async () => {
    const file = imageUploadInput.files[0];
    if (!file) return;

    feedbackMessage.textContent = "Processing registration...";
    feedbackMessage.style.color = "blue";
    const formData = new FormData();
    formData.append("img", file);
    const token = localStorage.getItem("token");

    try {
      const res = await apiFetch(`/users/profileImage/${userId}`, {
        method: "PUT",
        body: formData, // No JSON.stringify para FormData
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const { imageUrl } = await res.json();
        profilePicture.src = imageUrl;
        feedbackMessage.textContent = "Profile picture updated!";
        feedbackMessage.style.color = "green";
      } else {
        feedbackMessage.textContent = "Failed to upload image.";
        feedbackMessage.style.color = "red";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      feedbackMessage.textContent = "An error occurred. Please try again.";
    }
  });
}

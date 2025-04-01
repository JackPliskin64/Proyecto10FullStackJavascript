import { apiFetch } from "../services/apiFetch";

export function render() {
  return `
    <h2>Eventos</h2>
    <div id="events-list"></div>
    <div id="error-message"></div>
    <button id="create-event-button" style="display: none;">Crear evento</button>
    <div id="create-event-form-container" style="display: none;">
      <h3>Crear nuevo evento</h3>
      <form id="create-event-form">
        <label for="event-title">Título del evento:</label>
        <input type="text" id="event-title" required />
        
        <label for="event-description">Descripción:</label>
        <textarea id="event-description" required></textarea>

        <label for="event-date">Fecha:</label>
        <input type="datetime-local" id="event-date" required />

        <label for="event-location">Ubicación:</label>
        <input type="text" id="event-location" required />

        <label for="event-image">Imagen del evento:</label>
        <input type="file" id="event-image" accept="image/*" style="display:none;" />
        <button id="upload-image-btn" type="button">Subir imagen</button>

        <div id="image-name-display">No se ha seleccionado ninguna imagen.</div>
        
        <div id="buttons-container">
          <button type="submit" id="confirm-create-event-btn">Crear evento</button>
          <button type="button" id="cancel-create-event-btn">Cancelar</button>
        </div>
        
      </form>
       <div id="feedback-message"></div>
    </div>
  `;
}

export async function setupEvents() {
  const eventsListContainer = document.getElementById("events-list");
  const createEventButton = document.getElementById("create-event-button");
  const cancelCreateEvent = document.getElementById("cancel-create-event-btn");
  const formContainer = document.getElementById("create-event-form-container");

  formContainer.style.display = "none";
  eventsListContainer.style.display = "flex";

  const token = localStorage.getItem("token");
  if (token) {
    createEventButton.style.display = "inline-block";
  } else {
    createEventButton.style.display = "none";
  }

  try {
    const res = await apiFetch("/events", {
      method: "GET",
    });
    if (res) {
      const events = await res.json();
      if (events && events.length > 0) {
        eventsListContainer.innerHTML = events
          .map((event) => {
            const token = localStorage.getItem("token");
            const user = localStorage.getItem("user");
            const isCreator = user && event.creator === user;
            const isAttending =
              event.attendees &&
              event.attendees.some((attendee) => {
                return attendee._id === user;
              });
            return `
              <div class="event-item">
              <input type="hidden" class="event-id" value="${event._id}" />
                <h3>${event.title}</h3>
                <p>${new Date(event.date).toLocaleDateString()}</p>
                <p>${event.location}</p>
                <div class="button-container">
                <button class="view-event-btn">Ver detalles</button>
                ${
                  token && !isCreator && !isAttending
                    ? `<button class="attend-event-btn">Participar</button>`
                    : ""
                }
                </div>
              </div>
            `;
          })
          .join("");

        attachEventListeners();
      } else {
        eventsListContainer.innerHTML = "<p>No se encontraron eventos.</p>";
      }
    } else {
      console.error("Error al hacer fetch de los eventos:", res);
      eventsListContainer.innerHTML =
        "<p>Error al hacer fetch de los eventos. Por favor, inténtalo de nuevo más tarde.</p>";
    }
  } catch (error) {
    console.error("Error al hacer fetch de los eventos:", error);
    eventsListContainer.innerHTML =
      "<p>Error al hacer fetch de los eventos. Por favor, inténtalo de nuevo más tarde.</p>";
  }

  createEventButton.addEventListener("click", () => {
    formContainer.style.display = "block";
    createEventButton.style.display = "none";
    eventsListContainer.style.display = "none";
    setupCreateEvent();
  });

  cancelCreateEvent.addEventListener("click", () => {
    formContainer.style.display = "none";
    eventsListContainer.style.display = "block";
    createEventButton.style.display = "block";
  });

  function attachEventListeners() {
    const viewEventBtns = document.querySelectorAll(".view-event-btn");
    viewEventBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventItem = e.target.closest(".event-item");
        const eventId = eventItem.querySelector(".event-id").value;
        viewEvent(eventId);
      });
    });

    const attendEventBtns = document.querySelectorAll(".attend-event-btn");
    attendEventBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventItem = e.target.closest(".event-item");
        const eventId = eventItem.querySelector(".event-id").value;
        attendEvent(eventId);
      });
    });
  }

  async function viewEvent(eventId) {
    try {
      const res = await apiFetch(`/events/${eventId}`, { method: "GET" });
      if (!res.ok) {
        throw new Error("Error al hacer fetch de los detalles del evento.");
      }
      const event = await res.json();

      const existingModal = document.getElementById("event-details-modal");
      const existingOverlay = document.getElementById("event-details-overlay");

      if (existingModal) existingModal.remove();
      if (existingOverlay) existingOverlay.remove();

      const overlay = document.createElement("div");
      overlay.id = "event-details-overlay";
      document.body.appendChild(overlay);

      const modal = document.createElement("div");
      modal.id = "event-details-modal";
      modal.innerHTML = `
      <div class="event-modal-content">
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Description:</strong> ${event.description}</p>
        ${
          event.img
            ? `<img src="${event.img}" alt="${event.title}" class="event-image"/>`
            : ""
        }
        ${
          event.attendees && event.attendees.length > 0
            ? `
            <h4>Participantes:</h4>
            <ul>
              ${event.attendees
                .map(
                  (attendee) => `
                  <li class="participant-item">
                    <img src="${attendee.image}" alt="${attendee.userName}" class="participant-avatar"/>
                    <span>${attendee.userName}</span>
                  </li>`
                )
                .join("")}
            </ul>
            `
            : ""
        }
        <button id="close-event-modal">Cerrar</button>
      </div>
    `;

      document.body.appendChild(modal);

      modal.style.display = "block";
      overlay.style.display = "block";

      document
        .getElementById("close-event-modal")
        .addEventListener("click", closeModal);
      overlay.addEventListener("click", closeModal);

      function closeModal() {
        modal.remove();
        overlay.remove();
      }
    } catch (error) {
      console.error("Error al hacer fetch de los detalles del evento:", error);
    }
  }

  async function attendEvent(eventId) {
    const errorMessage = document.getElementById("error-message");
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para participar en un evento.");
      return;
    }

    try {
      const res = await apiFetch(`/events/attendees/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.message !== "No changes") {
        console.log("¡Te has unido al evento!", data);
        errorMessage.textContent = "¡Te has unido al evento!";
        errorMessage.style.color = "green";
        setupEvents();
      } else {
        throw new Error("Fallo al unirse al evento.");
      }
    } catch (error) {
      console.error("Fallo al unirse al evento:", error);
      errorMessage.textContent =
        "Ocurrió un error. Por favor, inténtalo de nuevo.";
      errorMessage.style.color = "red";
    }
  }
}

export function setupCreateEvent() {
  const createEventForm = document.getElementById("create-event-form");
  const feedbackMessage = document.getElementById("feedback-message");
  const formContainer = document.getElementById("create-event-form-container");
  const uploadImageBtn = document.getElementById("upload-image-btn");
  const imageUploadInput = document.getElementById("event-image");
  const imageNameDisplay = document.getElementById("image-name-display");
  const maxFileSize = 5 * 1024 * 1024;

  imageUploadInput.addEventListener("change", () => {
    if (imageUploadInput.files[0]) {
      imageNameDisplay.textContent = `¡Imagen seleccionada!`;
    } else {
      imageNameDisplay.textContent = "No se ha seleccionado ninguna imagen.";
    }
  });

  uploadImageBtn.addEventListener("click", () => {
    imageUploadInput.click();
  });

  createEventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Procesando tu petición...";
    loadingMessage.style.color = "blue";
    loadingMessage.style.display = "none";
    createEventForm.parentElement.appendChild(loadingMessage);

    const title = document.getElementById("event-title").value.trim();
    const description = document
      .getElementById("event-description")
      .value.trim();
    const date = document.getElementById("event-date").value;
    const location = document.getElementById("event-location").value.trim();
    const image = imageUploadInput.files[0];

    if (image && image.size > maxFileSize) {
      feedbackMessage.textContent =
        "El tamaño de la imagen debe ser menor a 5MB.";
      feedbackMessage.style.color = "red";
      return;
    }

    if (!title || !description || !date || !location) {
      feedbackMessage.textContent = "Todos los campos son requeridos.";
      feedbackMessage.style.color = "red";
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("location", location);
    formData.append("img", image);
    formData.append("creator", localStorage.getItem("user"));

    const token = localStorage.getItem("token");

    try {
      loadingMessage.style.display = "block";
      formContainer.style.display = "none";
      feedbackMessage.textContent = "";
      const res = await apiFetch("/events", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setupEvents();
      } else {
        formContainer.style.display = "block";
        feedbackMessage.textContent = "Fallo al crear evento.";
        feedbackMessage.style.color = "red";
      }
    } catch (error) {
      formContainer.style.display = "block";
      console.error("Error al crear el evento:", error);
      feedbackMessage.textContent =
        "Ocurrió un error. Por favor, inténtalo de nuevo.";
      feedbackMessage.style.color = "red";
    } finally {
      loadingMessage.style.display = "none";
    }
  });
}

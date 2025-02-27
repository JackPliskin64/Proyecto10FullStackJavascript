document.addEventListener("DOMContentLoaded", () => {
  const eventsLink = document.querySelector("#eventslink");
  const loginLink = document.querySelector("#loginlink");
  const registerLink = document.querySelector("#registerlink");
  const logoutLink = document.querySelector("#logoutlink");
  const personalPageLink = document.querySelector("#personalpagelink");

  const isUserLoggedIn = () => {
    return localStorage.getItem("token") !== null;
  };

  const updateLogoutLinkVisibility = () => {
    if (isUserLoggedIn()) {
      logoutLink.style.display = "block";
      personalPageLink.style.display = "block";
      registerLink.style.display = "none";
      loginLink.style.display = "none";
    } else {
      loginLink.style.display = "block";
      registerLink.style.display = "block";
      personalPageLink.style.display = "none";
      logoutLink.style.display = "none";
    }
  };

  eventsLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadComponent("events");
  });

  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadComponent("login");
  });

  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadComponent("register");
  });

  personalPageLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadComponent("personalPage");
  });

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    alert("You have logged out.");
    updateLogoutLinkVisibility();
    loadComponent("home");
  });

  updateLogoutLinkVisibility();
});

const changeMainContent = (content) => {
  const main = document.querySelector("#main-content");
  main.innerHTML = content;
};

export const loadComponent = (component) => {
  switch (component) {
    case "home":
      window.location.href = "/";
      break;
    case "events":
      import("./pages/Events.js")
        .then((module) => {
          changeMainContent(module.render());
          module.setupEvents();
        })
        .catch((err) => {
          console.error("Error loading events module:", err);
        });
      break;
    case "login":
      import("./pages/Login.js")
        .then((module) => {
          changeMainContent(module.render());
          module.setupLogin();
        })
        .catch((err) => {
          console.error("Error loading login module:", err);
        });
      break;
    case "register":
      import("./pages/Register.js").then((module) => {
        changeMainContent(module.render());
        module.setupRegister();
      });
      break;
    case "personalPage":
      import("./pages/PersonalPage.js")
        .then((module) => {
          changeMainContent(module.render());
          module.setupMyProfile();
        })
        .catch((err) => {
          console.error("Error loading login module:", err);
        });
      break;
    default:
      console.log("Componente no encontrado");
  }
};
/*
export const loadComponent = (component) => {
  const componentsMap = {
    events: {
      path: "./pages/Events.js",
      setup: "setupEvents",
    },
    login: {
      path: "./pages/Login.js",
      setup: "setupLogin",
    },
    register: {
      path: "./pages/Register.js",
      setup: "setupRegister",
    },
    personalPage: {
      path: "./pages/PersonalPage.js",
      setup: "setupPersonalPage",
    },
  };

  const selectedComponent = componentsMap[component];

  if (!selectedComponent) {
    console.log("Componente no encontrado");
    return;
  }

  import( selectedComponent.path)
    .then((module) => {
      changeMainContent(module.render());
      if (
        selectedComponent.setup &&
        typeof module[selectedComponent.setup] === "function"
      ) {
        module[selectedComponent.setup]();
      }
    })
    .catch((err) => {
      console.error(`Error loading ${component} module:`, err);
    });
};

*/

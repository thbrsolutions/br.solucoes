const modal = document.getElementById("registerModal");
const registerForm = document.getElementById("registerForm");
const registrationContent = document.getElementById("registrationContent");
const socialContent = document.getElementById("socialContent");
const formStatus = document.getElementById("formStatus");
const menu = document.getElementById("menu");
const menuButton = document.getElementById("menuButton");
const documentoInput = document.getElementById("documento");
const telefoneInput = document.getElementById("telefone");

document.getElementById("currentYear").textContent = new Date().getFullYear();

document.querySelectorAll("[data-open-register]").forEach((button) => {
  button.addEventListener("click", openModal);
});

document.querySelectorAll("[data-close-register]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.remove("active");
      panel.hidden = true;
    });

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    const panel = document.getElementById(tab.dataset.tab);
    panel.classList.add("active");
    panel.hidden = false;
  });
});

menuButton.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeModal();
  }
});

documentoInput.addEventListener("input", () => {
  documentoInput.value = formatDocument(documentoInput.value);
});

telefoneInput.addEventListener("input", () => {
  telefoneInput.value = formatPhone(telefoneInput.value);
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.textContent = "Enviando cadastro...";

  const formData = new FormData(registerForm);

  const payload = {
    nome: formData.get("nome"),
    documento: formData.get("documento"),
    endereco: formData.get("endereco"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    consentimento: formData.get("consentimento") === "on"
  };

  try {
    const response = await fetch("/api/cadastros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Não foi possível concluir o cadastro.");
    }

    document.getElementById("whatsappLink").href = result.links.whatsapp;
    document.getElementById("instagramLink").href = result.links.instagram;

    registrationContent.hidden = true;
    socialContent.hidden = false;
    registerForm.reset();
    formStatus.textContent = "";
  } catch (error) {
    formStatus.textContent = error.message;
  }
});

function openModal() {
  registrationContent.hidden = false;
  socialContent.hidden = true;
  formStatus.textContent = "";
  modal.hidden = false;
  document.body.classList.add("modal-open");

  setTimeout(() => {
    registerForm.elements.nome.focus();
  }, 50);
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

function formatDocument(value) {
  const numbers = onlyNumbers(value).slice(0, 14);

  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value) {
  const numbers = onlyNumbers(value).slice(0, 11);

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

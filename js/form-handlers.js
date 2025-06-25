const contactForms = document.querySelectorAll('form[data-form="contact"]');

contactForms.forEach(form => {
  form.onsubmit = async e => {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true; // Disable the button to prevent multiple submissions
      submitButton.setAttribute("data-loading", "true");
    }

    const formData = new FormData(form);
    const countryCode =
      form.querySelector(".iti__selected-flag")?.getAttribute("title") || "N/A";

    // Convert FormData to a JSON object
    const data = { ...Object.fromEntries(formData.entries()), countryCode };

    try {
      const response = await fetch("https://sheetdb.io/api/v1/2k8pkbwy90imv", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer 25lr29km6omncb5me2kc0y78spie9wzdagbcd9n6",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Network Error!");

      await response.json();

      form.reset();
      window.location.href = "/thankyou.html";
    } catch (error) {
      alert(error.message || "Something went wrong. Please try again later!");
    } finally {
      if (submitButton) {
        submitButton.disabled = false; // Re-enable the button
        submitButton.setAttribute("data-loading", "false");
      }
    }
  };
});

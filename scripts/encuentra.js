/* =========================================================
   encuentra.js — basic contact form validation + thanks state.
   Replace handleSubmit body with real endpoint when ready.
   ========================================================= */
(function () {
    const form = document.querySelector('[data-form]');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.name || !data.email || !data.message) return;

        // TODO: POST to your endpoint (e.g. fetch('/api/contact', { method:'POST', body: ...}))
        console.log('Contact submission:', data);

        const submit = form.querySelector('.encuentra__submit');
        if (submit) {
            const original = submit.textContent;
            submit.textContent = '¡Gracias! Te respondemos pronto.';
            submit.disabled = true;
            setTimeout(() => {
                submit.textContent = original;
                submit.disabled = false;
                form.reset();
            }, 3200);
        }
    });
})();

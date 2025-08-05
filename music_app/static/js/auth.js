document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const forms = {
        signin: document.getElementById('signin-form'),
        register: document.getElementById('register-form'),
    };

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle tab styles
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle forms
            Object.keys(forms).forEach(formKey => {
                forms[formKey].classList.add('hidden');
            });
            forms[btn.dataset.tab].classList.remove('hidden');
        });
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('flashPopup');
    if (popup) {
        setTimeout(() => {
            popup.style.display = 'none';
        }, 5000); 
    }
});


  
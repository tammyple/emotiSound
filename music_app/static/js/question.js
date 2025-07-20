import { determineQuadrant, quadrantMap } from './determineQuadrant.js';

document.addEventListener('DOMContentLoaded', () => {
    const optionButtons = document.querySelectorAll('.option-btn');
    let selectedValue = null;

    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            optionButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedValue = btn.dataset.value;
        });
    });

    const form = document.getElementById('questionForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!selectedValue) {
                alert("Please select an option before continuing.");
                return;
            }
            // get current page and save page's answer
            const currentPage = window.location.pathname.split("/").pop();
            localStorage.setItem(currentPage, selectedValue);  

            if (currentPage === "style") {
                fetch("/save-answer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        intention: localStorage.getItem("intention"),
                        mood: localStorage.getItem("mood"),
                        style: localStorage.getItem("style")
                    })
                })
                .then(res => res.json())
                .then(data => {
                    console.log(data.message, "Quadrant: ");
                    localStorage.clear();
                    window.location.href = "/main";
                })
                .catch(err => {
                    console.error("Failed to save:", err);
                    alert("Something went wrong while saving your answers.");
                });

            } else {
                // Go to the next question page
                const nextPageMap = {
                    intention: "/question/mood",
                    mood: "/question/style",
                };

                const nextPage = nextPageMap[currentPage];
                if (nextPage) {
                    window.location.href = nextPage;
                } else {
                    console.error("Unknown page:", currentPage);
                }
            }
        });
    }
});




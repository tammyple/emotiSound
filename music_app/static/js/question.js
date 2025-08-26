// Collect user input for onboarding questions: Intetion, Mood and Music Style

document.addEventListener('DOMContentLoaded', () => {
    const optionButtons = document.querySelectorAll('.option-btn');
    const loadingScreen = document.querySelector('.loadingScreen');
    const questionContainer = document.querySelector('.question-container');

    let selectedValue = null;
    // UI highlights selected option
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            optionButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedValue = btn.dataset.value;
        });
    });

    const form = document.getElementById('questionForm');
    if (form) {
        form.addEventListener('submit', async function (e) {  
            e.preventDefault();

            if (!selectedValue) {
                alert("Please select an option before continuing.");
                return;
            }

            // Set item in localStorage
            const currentPage = window.location.pathname.split("/").pop();
            localStorage.setItem(currentPage, selectedValue);

            // If page is music style, save all answers to database
            if (currentPage === "style") {
                // Show loading screen 
                if (loadingScreen) {
                    loadingScreen.style.display = 'flex';
                    questionContainer.style.display ='none';
                }
                try {
                    // Save user answers first
                    const res = await fetch("/save-answer", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            intention: localStorage.getItem("intention"),
                            mood: localStorage.getItem("mood"),
                            style: localStorage.getItem("style")
                        })
                    });

                    const data = await res.json();
                    console.log("Data message: ", data.message, );

                    // Generate a tune 
                    const wavRes = await fetch("/get-wav");
                    const tune = await wavRes.json();

                    console.log("wavRes: ", wavRes);
                    console.log("tune: ", tune.wav_url);

                    // Clear and redirect
                    localStorage.clear();
                    window.location.href = "/main";
                } catch (err) {
                    console.error("Failed to save or generate tune:", err);
                    alert("Something went wrong while saving your answers.");
                }
            } else {
                // Navigate to the next page as usual
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

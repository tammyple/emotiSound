document.addEventListener("DOMContentLoaded", () => {
    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackButtons = document.querySelectorAll(".feedback-btn");
    const question1 = document.getElementById("question-1");
    const question2 = document.getElementById("question-2");
    const thankYouMessage = document.getElementById("thank-you-message");
    const feedbackClose = document.getElementById("feedback-close");

    let feedbackData = {
        q1: null,
        q2: null
    };
  
    // Reset the feedback modal to initial state
    function resetFeedbackModal() {
      question1.classList.remove("hidden");
      question2.classList.add("hidden");
      thankYouMessage.classList.add("hidden");
    }
  
    feedbackButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const question = btn.dataset.question;
        const answer = btn.dataset.answer;
  
        if (question === "1") {
            feedbackData.q1 = answer;
            question1.classList.add("hidden");
            question2.classList.remove("hidden");
        } else if (question === "2") {
            feedbackData.q2 = answer;
            question2.classList.add("hidden");
            thankYouMessage.classList.remove("hidden");

        fetch("/submit-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            q1: feedbackData.q1,
            q2: feedbackData.q2
            })
        })
        .then(res => res.json())
        .then(data => console.log("Feedback submitted:", data))
        .catch(err => console.error("Feedback error:", err));


        setTimeout(() => {
            feedbackModal.classList.add("hidden");
        }, 3000);
        }
      });
    });
  
    feedbackClose?.addEventListener("click", () => {
      feedbackModal.classList.add("hidden");
    });
  
    // Optional: export reset function to use in other files
    window.resetFeedbackModal = resetFeedbackModal;
  });
  
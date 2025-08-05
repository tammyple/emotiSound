document.addEventListener("DOMContentLoaded", () => {
    const feedbackModal = document.getElementById("feedback-modal");
    const feedbackButtons = document.querySelectorAll(".feedback-btn");
    const question1 = document.getElementById("question-1");
    const question2 = document.getElementById("question-2");
    const thankYouMessage = document.getElementById("thank-you-message");
    const feedbackClose = document.getElementById("feedback-close");
  
    // Reset the feedback modal to initial state
    function resetFeedbackModal() {
      question1.classList.remove("hidden");
      question2.classList.add("hidden");
      thankYouMessage.classList.add("hidden");
    }
  
    feedbackButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const question = btn.dataset.question;
  
        if (question === "1") {
          question1.classList.add("hidden");
          question2.classList.remove("hidden");
        } else if (question === "2") {
          question2.classList.add("hidden");
          thankYouMessage.classList.remove("hidden");
  
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
  
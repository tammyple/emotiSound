import { closeOnOutsideClick } from "./helpers/outsideClick.js";

document.addEventListener("DOMContentLoaded", () => {
    const burger = document.getElementById("burger");
    const menu = document.getElementById("dropdownMenu");

    // Toggle burger menu
    burger.addEventListener("click", () => {
        console.log("burger menu is clicked");
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    // Close the menu when clicking outside
    closeOnOutsideClick("#dropdownMenu", "#burger");
});


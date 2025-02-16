let slots = document.querySelectorAll(".slot");

slots.forEach((slot) => {
  slot.addEventListener("click", (event) => {
    let span = slot.querySelector("span");
    if (span.innerText === "Available" || span.innerText === "") {
      slot.style.backgroundColor = "#FFADB0";
      slot.style.border = "4px solid red";
      span.innerText = "Reserved";
      span.style.color = "dark-red";
      slot.setAttribute("data-text", "Reserved"); // Update data-text attribute
    } else {
      slot.style.backgroundColor = "#59e659";
      slot.style.border = "4px solid green";
      span.innerText = "Available";
      span.style.color = "dark-green";
      slot.setAttribute("data-text", "Available"); // Update data-text attribute
    }
    updateCounts();
  });
});

function updateCounts() {
  let reservedCount = 0;
  let availableCount = 0;

  slots.forEach((slot) => {
    let span = slot.querySelector("span");
    if (span.innerText === "Reserved") {
      reservedCount++;
    } else if (span.innerText === "Available") {
      availableCount++;
    }
  });

  document.getElementById(
    "Reserved-count"
  ).innerText = `Reserved Slots: ${reservedCount}`;
  document.getElementById(
    "available-count"
  ).innerText = `Available Slots: ${availableCount}`;
  document.getElementById("Total-count").innerText = `Total slots: ${
    reservedCount + availableCount
  }`;
}

// Initial count update
updateCounts();

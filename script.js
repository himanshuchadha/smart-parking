document.addEventListener("DOMContentLoaded", function () {
  const parkingLine1 = document.getElementById("parking-line");
  const parkingLine2 = document.getElementById("parking-line-2");

  const db = firebase.database().ref("parking_slots");

  db.once("value").then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const slotData = childSnapshot.val();
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.setAttribute("data-text", slotData.status);
      const span = document.createElement("span");
      span.innerText = slotData.status;
      slot.appendChild(span);
      if (slotData.status === "Reserved") {
        slot.style.backgroundColor = "#FFADB0";
        slot.style.border = "4px solid red";
        span.style.color = "dark-red";
      } else {
        slot.style.backgroundColor = "#59e659";
        slot.style.border = "4px solid green";
        span.style.color = "dark-green";
      }
      slot.addEventListener("click", function () {
        const currentStatus = slot.getAttribute("data-text");
        const newStatus =
          currentStatus === "Available" ? "Reserved" : "Available";
        slot.setAttribute("data-text", newStatus);
        span.innerText = newStatus;
        slot.style.backgroundColor =
          newStatus === "Available" ? "#59e659" : "#FFADB0";
        slot.style.border =
          newStatus === "Available" ? "4px solid green" : "4px solid red";
        span.style.color =
          newStatus === "Available" ? "dark-green" : "dark-red";
        db.child(slotData.id).update({ status: newStatus });
        updateCounts();
      });
      if (slotData.id <= 10) {
        parkingLine1.appendChild(slot);
      } else {
        parkingLine2.appendChild(slot);
      }
    });
    updateCounts();
  });

  function updateCounts() {
    const slots = document.querySelectorAll(".slot");
    let reservedCount = 0;
    let availableCount = 0;

    slots.forEach((slot) => {
      const span = slot.querySelector("span");
      if (span.innerText === "Reserved") {
        reservedCount++;
      } else if (span.innerText === "Available") {
        availableCount++;
      }
    });

    document.getElementById(
      "reserved-count"
    ).innerText = `Reserved Slots: ${reservedCount}`;
    document.getElementById(
      "available-count"
    ).innerText = `Available Slots: ${availableCount}`;
    document.getElementById(
      "total-count"
    ).innerText = `Total Slots: ${slots.length}`;
  }

  // Initial count update
  updateCounts();
});

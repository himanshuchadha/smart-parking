// Firebase Initialization
var firebaseConfig = {
  apiKey: "AIzaSyAKqdODWQz3sl7H27FDQN85tOd_qNnRYdk",
  authDomain: "smart-parking-13e29.firebaseapp.com",
  projectId: "smart-parking-13e29",
  storageBucket: "smart-parking-13e29.firebasestorage.app",
  messagingSenderId: "832422095286",
  appId: "1:832422095286:web:141acda9b641cf7b487917",
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
console.log("Firebase initialized successfully!");

// Fetch slots from Firestore and initialize the UI
function fetchSlots() {
  db.collection("slots")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data()); // Log fetched documents
        let slotId = doc.id;
        let slotData = doc.data();
        let slotElement = document.querySelector(`#${slotId}`);
        if (slotElement) {
          slotElement.querySelector("span").innerText = slotData.status;
          slotElement.style.backgroundColor =
            slotData.status === "Reserved" ? "#FFADB0" : "#59e659";
          slotElement.style.border =
            slotData.status === "Reserved"
              ? "4px solid red"
              : "4px solid green";
        }
      });
      updateCounts();
    })
    .catch((error) => {
      console.error("Error fetching documents: ", error);
    });
}

// Add click event listeners to slots
let slots = document.querySelectorAll(".slot");
slots.forEach((slot) => {
  slot.addEventListener("click", (event) => {
    let span = slot.querySelector("span");
    let slotId = slot.getAttribute("id"); // Use slot ID for Firestore document ID
    let newStatus =
      span.innerText === "Available" || span.innerText === ""
        ? "Reserved"
        : "Available";
    updateSlotStatus(slotId, newStatus);
  });
});

// Update slot status in Firestore
function updateSlotStatus(slotId, status) {
  db.collection("slots")
    .doc(slotId)
    .set({
      status: status,
    })
    .then(() => {
      console.log("Slot status updated!");
      fetchSlots(); // Refresh slots from Firestore
    })
    .catch((error) => {
      console.error("Error updating status: ", error);
    });
}

// Update counts of available and reserved slots
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

// Initial count update and fetching slots
fetchSlots();
updateCounts();

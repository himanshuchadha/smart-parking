// Firebase Initialization
var firebaseConfig = {
  apiKey: "AIzaSyAKqdODWQz3sl7H27FDQN85tOd_qNnRYdk",
  authDomain: "smart-parking-13e29.firebaseapp.com",
  projectId: "smart-parking-13e29",
  storageBucket: "smart-parking-13e29.firebasestorage.app",
  messagingSenderId: "832422095286",
  appId: "1:832422095286:web:141acda9b641cf7b487917",
  measurementId: "G-052L2SP4ZY", // Added measurementId
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
console.log("Firebase initialized successfully!");

// Sign-In Handler
document.getElementById("login-button").addEventListener("click", function () {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Signed in successfully!");
      document.getElementById("login-form").style.display = "none"; // Hide login form
    })
    .catch((error) => {
      console.error("Error signing in: ", error);
      document.getElementById("login-error").innerText = error.message;
    });
});

// Check Auth State Continuously
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user);
    document.getElementById("login-form").style.display = "none"; // Hide login form if signed in
  } else {
    console.log("No user is signed in.");
    document.getElementById("login-form").style.display = "block"; // Show login form if not signed in
  }
});

// Initialize `reservedBy` field for existing documents
db.collection("slots")
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      doc.ref
        .update({
          reservedBy: null,
        })
        .then(() => {
          console.log(`Document ${doc.id} updated successfully!`);
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    });
  });

// Real-time listener for slots
db.collection("slots").onSnapshot(
  (querySnapshot) => {
    console.log("Real-time update received!"); // Log for real-time updates
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data()); // Log fetched documents
      let slotId = doc.id;
      let slotData = doc.data();
      let slotElement = document.querySelector(`#${slotId}`);
      if (slotElement) {
        console.log(`Updating slot ${slotId} with status ${slotData.status}`);
        slotElement.querySelector("span").innerText = slotData.status;
        slotElement.setAttribute("data-text", slotData.status); // Update the data-text attribute
        slotElement.setAttribute("reservedBy", slotData.reservedBy); // Update the reservedBy attribute
        slotElement.style.backgroundColor =
          slotData.status === "Reserved" ? "#FFADB0" : "#59e659";
        slotElement.style.border =
          slotData.status === "Reserved" ? "4px solid red" : "4px solid green";
      }
    });
    updateCounts();
  },
  (error) => {
    console.error("Real-time listener error: ", error); // Log any errors in real-time listener
  }
);

// Add click event listeners to slots
let slots = document.querySelectorAll(".slot");
slots.forEach((slot) => {
  slot.addEventListener("click", (event) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        let span = slot.querySelector("span");
        let slotId = slot.getAttribute("id"); // Use slot ID for Firestore document ID
        let newStatus =
          span.innerText === "Available" || span.innerText === ""
            ? "Reserved"
            : "Available";
        if (newStatus === "Reserved") {
          canReserveSlot(userId).then((canReserve) => {
            if (canReserve) {
              updateSlotStatus(slotId, newStatus, userId);
            } else {
              alert("You can only reserve one slot at a time.");
            }
          });
        } else if (
          slot.getAttribute("data-text") === "Reserved" &&
          slot.getAttribute("reservedBy") === userId
        ) {
          // Allow only if the user is unreserving their own slot
          updateSlotStatus(slotId, newStatus, null);
        } else {
          alert("You can only unreserve your own slot.");
        }
      } else {
        alert("Please sign in to reserve a slot.");
      }
    });
  });
});

// Update slot status in Firestore
function updateSlotStatus(slotId, status, userId) {
  db.collection("slots")
    .doc(slotId)
    .set({
      status: status,
      reservedBy: status === "Reserved" ? userId : null,
    })
    .then(() => {
      console.log("Slot status updated!");
      let slotElement = document.querySelector(`#${slotId}`);
      if (slotElement) {
        slotElement.setAttribute("data-text", status); // Update the data-text attribute
      }
    })
    .catch((error) => {
      console.error("Error updating status: ", error);
    });
}

// Function to check if the user can reserve a slot
function canReserveSlot(userId) {
  return db
    .collection("slots")
    .where("reservedBy", "==", userId)
    .get()
    .then((querySnapshot) => {
      return querySnapshot.empty; // Returns true if the user has no reserved slots
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

// Initial count update
updateCounts();

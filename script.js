document.addEventListener("DOMContentLoaded", function () {
  // Firebase Initialization
  var firebaseConfig = {
    apiKey: "AIzaSyAKqdODWQz3sl7H27FDQN85tOd_qNnRYdk",
    authDomain: "smart-parking-13e29.firebaseapp.com",
    projectId: "smart-parking-13e29",
    storageBucket: "smart-parking-13e29.firebasestorage.app",
    messagingSenderId: "832422095286",
    appId: "1:832422095286:web:141acda9b641cf7b487917",
    measurementId: "G-052L2SP4ZY",
  };
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  console.log("Firebase initialized successfully!");

  // Sign-In and Sign-Up Handler
  document
    .getElementById("login-button")
    .addEventListener("click", function () {
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
          if (error.code === "auth/user-not-found") {
            // Register the user if they don't exist
            firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then((userCredential) => {
                console.log("User registered successfully!");
                document.getElementById("login-form").style.display = "none"; // Hide login form
              })
              .catch((error) => {
                console.error("Error registering user: ", error);
                document.getElementById("login-error").innerText =
                  error.message;
              });
          } else {
            console.error("Error signing in: ", error);
            document.getElementById("login-error").innerText = error.message;
          }
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
      console.log("Real-time update received!");
      querySnapshot.forEach((doc) => {
        let slotId = doc.id;
        let slotData = doc.data();
        let slotElement = document.querySelector(`#${slotId}`);
        if (slotElement) {
          slotElement.querySelector("span").innerText = slotData.status;
          slotElement.setAttribute("data-text", slotData.status);
          slotElement.setAttribute("reservedBy", slotData.reservedBy);
          slotElement.style.backgroundColor =
            slotData.status === "Reserved" ? "#FFADB0" : "#59e659";
          slotElement.style.border =
            slotData.status === "Reserved"
              ? "4px solid red"
              : "4px solid green";
        }
      });
      updateCounts();
    },
    (error) => {
      console.error("Real-time listener error: ", error);
    }
  );

  // Add click event listeners to slots
  document.querySelectorAll(".slot").forEach((slot) => {
    slot.addEventListener("click", () => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          const userId = user.uid;
          let slotId = slot.getAttribute("id");
          let currentStatus = slot.getAttribute("data-text");
          let newStatus =
            currentStatus === "Available" ? "Reserved" : "Available";

          if (newStatus === "Reserved") {
            canReserveSlot(userId).then((canReserve) => {
              if (canReserve) {
                updateSlotStatus(slotId, newStatus, userId);
              } else {
                alert("You can only reserve one slot at a time.");
              }
            });
          } else if (
            currentStatus === "Reserved" &&
            slot.getAttribute("reservedBy") === userId
          ) {
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
        console.log(`Slot ${slotId} status updated to ${status}`);
      })
      .catch((error) => {
        console.error("Error updating slot: ", error);
      });
  }

  // Check if the user already reserved a slot
  function canReserveSlot(userId) {
    return db
      .collection("slots")
      .where("reservedBy", "==", userId)
      .get()
      .then((querySnapshot) => {
        return querySnapshot.empty; // Returns true if user has no reserved slots
      })
      .catch((error) => {
        console.error("Error checking reserved slots: ", error);
        return false;
      });
  }

  // Update slot counts
  function updateCounts() {
    db.collection("slots")
      .get()
      .then((querySnapshot) => {
        let totalSlots = querySnapshot.size;
        let reservedSlots = 0;
        querySnapshot.forEach((doc) => {
          if (doc.data().status === "Reserved") {
            reservedSlots++;
          }
        });
        document.getElementById(
          "Total-count"
        ).innerText = `Total Slots: ${totalSlots}`;
        document.getElementById(
          "Reserved-count"
        ).innerText = `Reserved Slots: ${reservedSlots}`;
        document.getElementById(
          "available-count"
        ).innerText = `Available Slots: ${totalSlots - reservedSlots}`;
      });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "smart-parking-13e29.firebaseapp.com",
    projectId: "smart-parking-13e29",
    storageBucket: "smart-parking-13e29.appspot.com",
    messagingSenderId: "832422095286",
    appId: "1:832422095286:web:141acda9b641cf7b487917",
  };

  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();

  // User Authentication
  document
    .getElementById("login-button")
    .addEventListener("click", function () {
      var email = document.getElementById("email").value;
      var password = document.getElementById("password").value;

      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          document.getElementById("login-form").style.display = "none";
        })
        .catch((error) => {
          if (error.code === "auth/user-not-found") {
            firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then(() => {
                document.getElementById("login-form").style.display = "none";
              })
              .catch((error) => {
                document.getElementById("login-error").innerText =
                  error.message;
              });
          } else {
            document.getElementById("login-error").innerText = error.message;
          }
        });
    });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      document.getElementById("login-form").style.display = "none";
    }
  });

  // Real-time slot updates
  db.collection("slots").onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let slot = document.getElementById(doc.id);
      if (slot) {
        slot.innerText = doc.data().status;
        slot.setAttribute("data-text", doc.data().status);
        slot.style.backgroundColor =
          doc.data().status === "Reserved" ? "red" : "green";
      }
    });
  });

  // Slot click event
  document.querySelectorAll(".slot").forEach((slot) => {
    slot.addEventListener("click", () => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          let slotId = slot.id;
          let newStatus =
            slot.getAttribute("data-text") === "Available"
              ? "Reserved"
              : "Available";

          db.collection("slots")
            .doc(slotId)
            .set({
              status: newStatus,
              reservedBy: newStatus === "Reserved" ? user.uid : null,
            });
        } else {
          alert("Please sign in to reserve a slot.");
        }
      });
    });
  });
});

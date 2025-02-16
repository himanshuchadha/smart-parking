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
  console.log("✅ Firebase initialized successfully!");

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
          console.log("✅ Signed in successfully!");
          document.getElementById("login-form").style.display = "none";
        })
        .catch((error) => {
          if (error.code === "auth/user-not-found") {
            firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then((userCredential) => {
                console.log("✅ User registered successfully!");
                document.getElementById("login-form").style.display = "none";
              })
              .catch((error) => {
                console.error("❌ Error registering user: ", error);
                document.getElementById("login-error").innerText =
                  error.message;
              });
          } else {
            console.error("❌ Error signing in: ", error);
            document.getElementById("login-error").innerText = error.message;
          }
        });
    });

  // Real-time listener for slots
  db.collection("slots").onSnapshot(
    (querySnapshot) => {
      console.log("🔥 Real-time update received!");
      let hasSlots = false;

      querySnapshot.forEach((doc) => {
        hasSlots = true;
        console.log(`📌 Slot ID: ${doc.id}, Data:`, doc.data());

        let slotId = doc.id;
        let slotData = doc.data();
        let slotElement = document.querySelector(`#${slotId}`);

        if (slotElement) {
          slotElement.querySelector("span").innerText = slotData.status;
          slotElement.setAttribute("data-text", slotData.status);
          slotElement.setAttribute("reservedBy", slotData.reservedBy || "");

          slotElement.style.backgroundColor =
            slotData.status === "Reserved" ? "#FFADB0" : "#59e659";
          slotElement.style.border =
            slotData.status === "Reserved"
              ? "4px solid red"
              : "4px solid green";
        }
      });

      if (!hasSlots) {
        console.warn("⚠️ No slots found in Firestore!");
      }
    },
    (error) => {
      console.error("🚨 Firestore real-time listener error: ", error);
    }
  );

  // Click event for slots
  document.querySelectorAll(".slot").forEach((slot) => {
    slot.addEventListener("click", () => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          let slotId = slot.getAttribute("id");
          let currentStatus = slot.getAttribute("data-text");
          let newStatus =
            currentStatus === "Available" ? "Reserved" : "Available";

          db.collection("slots")
            .doc(slotId)
            .set({
              status: newStatus,
              reservedBy: newStatus === "Reserved" ? user.uid : null,
            })
            .then(() => console.log("✅ Slot status updated!"))
            .catch((error) => console.error("❌ Error updating slot: ", error));
        } else {
          alert("⚠️ Please sign in to reserve a slot.");
        }
      });
    });
  });
});

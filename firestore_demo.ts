// Firestore CRUD demo for Deno + npm:firebase
// Usage: deno run -A --env --node-modules-dir firestore_demo.ts

import { db, ensureAnonAuth } from "./firebase.ts";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";

async function main() {
    console.log("Initializing auth (anonymous) and Firestore...");
    await ensureAnonAuth();

    const dinos = collection(db, "dinosaurs");

    // Create
    console.log("\n[CREATE] adding a dinosaur doc...");
    const created = await addDoc(dinos, {
        name: "Denosaur",
        description: "Dinosaurs should be simple.",
        createdAt: serverTimestamp(),
        isCool: true,
    });
    console.log("Created doc id:", created.id);

    // Read (list)
    console.log("\n[READ] listing all dinosaurs...");
    const allSnap = await getDocs(dinos);
    allSnap.forEach((d) => console.log(d.id, d.data()));

    // Read (filtered)
    console.log("\n[READ] query by name == 'Denosaur'...");
    const q = query(dinos, where("name", "==", "Denosaur"));
    const byNameSnap = await getDocs(q);
    const target = byNameSnap.docs[0];
    console.log("Found:", target?.id, target?.data());

    // Update
    if (target) {
        console.log("\n[UPDATE] toggling isCool to false...");
        await updateDoc(target.ref, { isCool: false });
        const after = await getDocs(query(dinos, where("name", "==", "Denosaur")));
        console.log("After update:", after.docs[0]?.id, after.docs[0]?.data());
    }

    // Delete
    if (target) {
        console.log("\n[DELETE] removing doc", target.id);
        await deleteDoc(doc(db, "dinosaurs", target.id));
    }

    console.log("\nDone.");
}

if (import.meta.main) {
    await main();
}

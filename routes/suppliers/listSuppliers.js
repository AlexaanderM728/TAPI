import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const suppliersFilePath = path.resolve("./data/suppliers.json");

// GET /suppliers - Lista dostawców
router.get("/", async (req, res) => {
    try {
        const suppliers = await fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse);
        res.status(200).json(suppliers);
    } catch (error) {
        console.error("Błąd podczas pobierania listy dostawców:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się pobrać listy dostawców." });
    }
});

export default router;
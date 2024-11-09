import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const categoriesFilePath = path.resolve("./data/categories.json");

// GET /categories - Lista kategorii
router.get("/", async (req, res) => {
    try {
        const categories = await fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse);
        res.status(200).json(categories);
    } catch (error) {
        console.error("Błąd podczas pobierania listy kategorii:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się pobrać listy kategorii." });
    }
});

export default router;
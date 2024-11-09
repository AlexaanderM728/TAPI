import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const categoriesFilePath = path.resolve("./data/categories.json");

// GET /categories/:id - Szczegóły kategorii
router.get("/:id", async (req, res) => {
    const categoryId = parseInt(req.params.id, 10);

    try {
        const categories = await fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse);
        const category = categories.find((c) => c.id_category === categoryId);

        if (!category) {
            return res.status(404).json({ error: `Kategoria o ID ${categoryId} nie została znaleziona.` });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error("Błąd podczas pobierania kategorii:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się pobrać kategorii." });
    }
});

export default router;
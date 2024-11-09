import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const categoriesFilePath = path.resolve("./data/categories.json");

// PATCH /categories/:id - Aktualizacja kategorii
router.patch("/:id", async (req, res) => {
    const categoryId = parseInt(req.params.id, 10);
    const updates = req.body;

    try {
        const categories = await fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse);
        const categoryIndex = categories.findIndex((c) => c.id_category === categoryId);

        if (categoryIndex === -1) {
            return res.status(404).json({ error: `Kategoria o ID ${categoryId} nie została znaleziona.` });
        }

        categories[categoryIndex] = { ...categories[categoryIndex], ...updates };

        await fs.writeFile(categoriesFilePath, JSON.stringify(categories, null, 2));

        res.status(200).json(categories[categoryIndex]);
    } catch (error) {
        console.error("Błąd podczas aktualizacji kategorii:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się zaktualizować kategorii." });
    }
});

export default router;
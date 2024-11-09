import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const categoriesFilePath = path.resolve("./data/categories.json");

// DELETE /categories/:id - Usuwanie kategorii
router.delete("/:id", async (req, res) => {
    const categoryId = parseInt(req.params.id, 10);

    try {
        const categories = await fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse);
        const updatedCategories = categories.filter((c) => c.id_category !== categoryId);

        if (updatedCategories.length === categories.length) {
            return res.status(404).json({ error: `Kategoria o ID ${categoryId} nie została znaleziona.` });
        }

        await fs.writeFile(categoriesFilePath, JSON.stringify(updatedCategories, null, 2));

        res.status(200).json({ message: `Kategoria o ID ${categoryId} została usunięta.` });
    } catch (error) {
        console.error("Błąd podczas usuwania kategorii:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się usunąć kategorii." });
    }
});

export default router;
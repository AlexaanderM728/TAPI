import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const categoriesFilePath = path.resolve("./data/categories.json");

// POST /categories - Dodawanie kategorii
router.post("/", async (req, res) => {
    const { name, main_category, description } = req.body;

    if (!name || !main_category) {
        return res.status(400).json({ error: "Brak wymaganych danych do utworzenia kategorii." });
    }

    try {
        const categories = await fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse);

        const newCategory = {
            id_category: categories.length + 1,
            name,
            main_category,
            description: description || "",
        };

        categories.push(newCategory);

        await fs.writeFile(categoriesFilePath, JSON.stringify(categories, null, 2));

        res.status(201).json(newCategory);
    } catch (error) {
        console.error("Błąd podczas dodawania kategorii:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się dodać kategorii." });
    }
});

export default router;
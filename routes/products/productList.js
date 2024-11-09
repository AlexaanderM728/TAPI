import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

// Ścieżki do plików z danymi
const productsFilePath = path.resolve("./data/products.json");
const categoriesFilePath = path.resolve("./data/categories.json");
const suppliersFilePath = path.resolve("./data/suppliers.json");

// GET /products - Pobierz pełną listę produktów
router.get("/", async (req, res) => {
    try {
        // Odczytanie danych z plików
        const [products, categories, suppliers] = await Promise.all([
            fs.readFile(productsFilePath, "utf-8").then(JSON.parse),
            fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse),
            fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse),
        ]);

        // Łączenie danych produktów z kategoriami i dostawcami
        const response = products.map((product) => {
            const category = categories.find((c) => c.id_category === product.category_id);
            const supplier = suppliers.find((s) => s.id_supplier === product.id_supplier);

            return {
                ...product,
                category,
                supplier,
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.error("Błąd podczas pobierania listy produktów:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się pobrać listy produktów." });
    }
});

export default router;
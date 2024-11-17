import express from "express";
import fs from "fs/promises";
import path from "path";
import { generateHATEOASLinks } from "../../utils/generateHATEOASLinks.js";

const router = express.Router();

// Ścieżki do plików JSON
const productsFilePath = path.resolve("./data/products.json");
const categoriesFilePath = path.resolve("./data/categories.json");
const suppliersFilePath = path.resolve("./data/suppliers.json");

// GET /products/:id - Szczegóły produktu
router.get("/:id", async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    try {
        // Odczyt danych z plików JSON
        const [products, categories, suppliers] = await Promise.all([
            fs.readFile(productsFilePath, "utf-8").then(JSON.parse),
            fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse),
            fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse),
        ]);

        // Znajdź produkt po ID
        const product = products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({ error: `Nie znaleziono produktu o ID: ${productId}` });
        }

        // Znajdź kategorię i dostawcę
        const category = categories.find(c => c.id_category === product.category_id) || null;
        const supplier = suppliers.find(s => s.id_supplier === product.id_supplier) || null;

        // Generowanie linków HATEOAS
        const baseUrl = `${req.protocol}://${req.headers.host}`;
        const links = generateHATEOASLinks(baseUrl, {
            id: product.id,
            category_id: product.category_id,
            id_supplier: product.id_supplier,
            name: product.name,
        });

        res.status(200).json({
            ...product,
            category,
            supplier,
            links,
        });
    } catch (error) {
        console.error("Błąd podczas odczytu danych JSON:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się pobrać danych." });
    }
});

export default router;
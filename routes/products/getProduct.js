import express from "express";
import fs from "fs/promises";
import path from "path";
import checkAcceptHeader from "../../middleware/checkAcceptHeader.js";
import checkContentType from "../../middleware/checkContentType.js"; 
import checkRole from "../../middleware/checkRole.js";

const router = express.Router();

// Ścieżki do plików JSON
const productsFilePath = path.resolve("./data/products.json");
const categoriesFilePath = path.resolve("./data/categories.json");
const suppliersFilePath = path.resolve("./data/suppliers.json");



// GET /products/:id - Pobieranie produktu z plików JSON
router.get('/:id', checkAcceptHeader, checkContentType, checkRole,  async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    try {
        // Odczyt danych z plików JSON równocześnie
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
        const category = categories.find(c => c.id_category === product.category_id);
        const supplier = suppliers.find(s => s.id_supplier === product.id_supplier);

        // Zbuduj pełną odpowiedź
        const response = {
            ...product,
            category: category || null,
            supplier: supplier || null,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Błąd podczas odczytu danych JSON:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się pobrać danych." });
    }
});

export default router;
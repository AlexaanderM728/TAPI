import express from "express";
import fs from "fs/promises";
import path from "path";
import checkContentType from "../../middleware/checkContentType.js"; // Middleware do sprawdzania Content-Type
import checkAcceptHeader from "../../middleware/checkAcceptHeader.js"; // Middleware do sprawdzania Accept
import checkRole from "../../middleware/checkRole.js";

const router = express.Router();

// Ścieżki do plików
const productsFilePath = path.resolve("./data/products.json");
const categoriesFilePath = path.resolve("./data/categories.json");
const suppliersFilePath = path.resolve("./data/suppliers.json");

// POST /products - Tworzenie nowego produktu z użyciem middleware
router.post(
    "/",
    checkContentType, // Sprawdza Content-Type: application/json
    checkAcceptHeader,
    checkRole,
    async (req, res) => {
        const { name, category_id, id_supplier, nutritional_values } = req.body;

        // Walidacja danych wejściowych
        if (!name || !category_id || !id_supplier || !nutritional_values) {
            return res.status(400).json({
                error: "Brak wymaganych danych. Upewnij się, że wszystkie pola są wypełnione.",
            });
        }

        try {
            // Odczyt danych z plików
            const [products, categories, suppliers] = await Promise.all([
                fs.readFile(productsFilePath, "utf-8").then(JSON.parse),
                fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse),
                fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse),
            ]);

            // Sprawdzenie, czy kategoria istnieje
            const categoryExists = categories.some((c) => c.id_category === category_id);
            if (!categoryExists) {
                return res.status(404).json({ error: "Podana kategoria nie istnieje." });
            }

            // Sprawdzenie, czy dostawca istnieje
            const supplierExists = suppliers.some((s) => s.id_supplier === id_supplier);
            if (!supplierExists) {
                return res.status(404).json({ error: "Podany dostawca nie istnieje." });
            }

            // Generowanie nowego ID dla produktu
            const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

            // Tworzenie nowego produktu
            const newProduct = {
                id: newId,
                name,
                category_id,
                id_supplier,
                nutritional_values,
            };

            // Dodanie produktu do listy
            products.push(newProduct);

            // Zapisanie zaktualizowanej listy produktów do pliku
            await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));

            res.status(201).json({
                message: "Produkt został pomyślnie utworzony.",
                product: newProduct,
            });
        } catch (error) {
            console.error("Błąd podczas tworzenia produktu:", error);
            res.status(500).json({ error: "Błąd serwera. Nie udało się utworzyć produktu." });
        }
    }
);

export default router;
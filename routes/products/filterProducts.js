import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

// Ścieżki do plików z danymi
const productsFilePath = path.resolve("./data/products.json");
const categoriesFilePath = path.resolve("./data/categories.json");
const suppliersFilePath = path.resolve("./data/suppliers.json");

// GET /products/filter - Filtrowanie produktów
router.get("/", async (req, res) => {
    try {
        // Odczytanie danych z plików
        const [products, categories, suppliers] = await Promise.all([
            fs.readFile(productsFilePath, "utf-8").then(JSON.parse),
            fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse),
            fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse),
        ]);

        // Pobranie parametrów filtrów z zapytania
        const {
            category_id,
            id_supplier,
            minCarbohydrates,
            maxCarbohydrates,
            minProteins,
            maxProteins,
            minFats,
            maxFats,
        } = req.query;

        // Kopia produktów do przefiltrowania
        let filteredProducts = [...products];

        // Filtrowanie według parametrów
        if (category_id) {
            filteredProducts = filteredProducts.filter((p) => p.category_id === parseInt(category_id, 10));
        }

        if (id_supplier) {
            filteredProducts = filteredProducts.filter((p) => p.id_supplier === parseInt(id_supplier, 10));
        }

        if (minCarbohydrates || maxCarbohydrates) {
            filteredProducts = filteredProducts.filter((p) => {
                const carbs = p.nutritional_values.carbohydrates;
                return (
                    (!minCarbohydrates || carbs >= parseFloat(minCarbohydrates)) &&
                    (!maxCarbohydrates || carbs <= parseFloat(maxCarbohydrates))
                );
            });
        }

        if (minProteins || maxProteins) {
            filteredProducts = filteredProducts.filter((p) => {
                const proteins = p.nutritional_values.proteins;
                return (
                    (!minProteins || proteins >= parseFloat(minProteins)) &&
                    (!maxProteins || proteins <= parseFloat(maxProteins))
                );
            });
        }

        if (minFats || maxFats) {
            filteredProducts = filteredProducts.filter((p) => {
                const fats = p.nutritional_values.fats;
                return (
                    (!minFats || fats >= parseFloat(minFats)) &&
                    (!maxFats || fats <= parseFloat(maxFats))
                );
            });
        }

        // Mapowanie wyników filtrowania na pełne dane produktu
        const response = filteredProducts.map((product) => {
            const category = categories.find((c) => c.id_category === product.category_id);
            const supplier = suppliers.find((s) => s.id_supplier === product.id_supplier);

            return {
                ...product,
                category,
                supplier,
            };
        });

        // Zwracanie przefiltrowanych danych w nowym obiekcie JSON
        res.status(200).json(response);
    } catch (error) {
        console.error("Błąd podczas filtrowania produktów:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się przefiltrować produktów." });
    }
});

export default router;
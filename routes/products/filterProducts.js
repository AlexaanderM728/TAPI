import express from "express";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { generateHATEOASLinks } from "../../utils/generateHATEOASLinks.js";

const router = express.Router();

// Ścieżki do plików z danymi
const productsFilePath = path.resolve("./data/products.json");
const categoriesFilePath = path.resolve("./data/categories.json");
const suppliersFilePath = path.resolve("./data/suppliers.json");
const tempDir = path.resolve("./temp");

// Funkcja tworząca folder `temp` (jeśli nie istnieje)
const ensureTempDirExists = async () => {
    try {
        await fs.mkdir(tempDir, { recursive: true });
    } catch (err) {
        console.error("Błąd tworzenia folderu `temp`:", err);
    }
};

// GET /products/filter - Filtrowanie produktów
router.get("/", async (req, res) => {
    try {
        await ensureTempDirExists();

        const allowedParams = [
            "category_id",
            "id_supplier",
            "minCarbohydrates",
            "maxCarbohydrates",
            "minProteins",
            "maxProteins",
            "minFats",
            "maxFats",
            "minRating",
            "maxRating"
        ];

        // Walidacja parametrów zapytania
        const invalidParams = Object.keys(req.query).filter((key) => !allowedParams.includes(key));

        if (invalidParams.length > 0) {
            return res.status(400).json({
                error: "Nieprawidłowe parametry wyszukiwania.",
                invalidParams,
                allowedParams
            });
        }

        const [products, categories, suppliers] = await Promise.all([
            fs.readFile(productsFilePath, "utf-8").then(JSON.parse),
            fs.readFile(categoriesFilePath, "utf-8").then(JSON.parse),
            fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse),
        ]);

        const {
            category_id,
            id_supplier,
            minCarbohydrates,
            maxCarbohydrates,
            minProteins,
            maxProteins,
            minFats,
            maxFats,
            minRating,
            maxRating
        } = req.query;

        const productsWithSuppliers = products.map((product) => {
            const supplier = suppliers.find((s) => s.id_supplier === product.id_supplier);
            return {
                ...product,
                supplier,
            };
        });

        let filteredProducts = [...productsWithSuppliers];

        // Filtrowanie po kategorii
        if (category_id) {
            filteredProducts = filteredProducts.filter((p) => p.category_id === parseInt(category_id, 10));
        }

        // Filtrowanie po dostawcy
        if (id_supplier) {
            filteredProducts = filteredProducts.filter((p) => p.id_supplier === parseInt(id_supplier, 10));
        }

        // Filtrowanie po węglowodanach
        if (minCarbohydrates || maxCarbohydrates) {
            filteredProducts = filteredProducts.filter((p) => {
                const carbs = p.nutritional_values?.carbohydrates || 0;
                return (
                    (!minCarbohydrates || carbs >= parseFloat(minCarbohydrates)) &&
                    (!maxCarbohydrates || carbs <= parseFloat(maxCarbohydrates))
                );
            });
        }

        // Filtrowanie po białkach
        if (minProteins || maxProteins) {
            filteredProducts = filteredProducts.filter((p) => {
                const proteins = p.nutritional_values?.proteins || 0;
                return (
                    (!minProteins || proteins >= parseFloat(minProteins)) &&
                    (!maxProteins || proteins <= parseFloat(maxProteins))
                );
            });
        }

        // Filtrowanie po tłuszczach
        if (minFats || maxFats) {
            filteredProducts = filteredProducts.filter((p) => {
                const fats = p.nutritional_values?.fats || 0;
                return (
                    (!minFats || fats >= parseFloat(minFats)) &&
                    (!maxFats || fats <= parseFloat(maxFats))
                );
            });
        }

        // Filtrowanie po ocenie dostawcy
        if (minRating || maxRating) {
            filteredProducts = filteredProducts.filter((p) => {
                const supplierRating = p.supplier?.rating || NaN;
                return (
                    !isNaN(supplierRating) &&
                    (!minRating || supplierRating >= parseFloat(minRating)) &&
                    (!maxRating || supplierRating <= parseFloat(maxRating))
                );
            });
        }

        // Obsługa przypadku pustej listy
        if (filteredProducts.length === 0) {
            const filtersUsed = [];
            if (minRating) filtersUsed.push(`minRating: ${minRating}`);
            if (maxRating) filtersUsed.push(`maxRating: ${maxRating}`);
            if (category_id) filtersUsed.push(`category_id: ${category_id}`);
            if (id_supplier) filtersUsed.push(`id_supplier: ${id_supplier}`);
            if (minCarbohydrates) filtersUsed.push(`minCarbohydrates: ${minCarbohydrates}`);
            if (maxCarbohydrates) filtersUsed.push(`maxCarbohydrates: ${maxCarbohydrates}`);
            if (minProteins) filtersUsed.push(`minProteins: ${minProteins}`);
            if (maxProteins) filtersUsed.push(`maxProteins: ${maxProteins}`);
            if (minFats) filtersUsed.push(`minFats: ${minFats}`);
            if (maxFats) filtersUsed.push(`maxFats: ${maxFats}`);

            return res.status(404).json({
                message: "Brak wyników dla podanych kryteriów.",
                filters: filtersUsed.join(", "),
            });
        }

        // Generowanie odpowiedzi z linkami HATEOAS
        const response = filteredProducts.map((product) => {
            const category = categories.find((c) => c.id_category === product.category_id);
            const baseUrl = `${req.protocol}://${req.headers.host}`;
            const links = generateHATEOASLinks(baseUrl, product);
            return {
                ...product,
                category,
                links,
            };
        });

        const tempFilePath = path.join(tempDir, `filteredProducts_${uuidv4()}.json`);
        await fs.writeFile(tempFilePath, JSON.stringify(response, null, 2), "utf-8");

        console.log(`Zapisano wyniki filtrowania do pliku: ${tempFilePath}`);

        res.status(200).json({
            products: response,
            count: response.length,
        });
    } catch (error) {
        console.error("Błąd podczas filtrowania produktów:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się przefiltrować produktów." });
    }
});

export default router;
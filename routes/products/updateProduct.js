import express from "express";
import fs from "fs/promises";
import path from "path";
import checkContentType from "../../middleware/checkContentType.js";
import checkAcceptHeader from "../../middleware/checkAcceptHeader.js";
import checkRole from "../../middleware/checkRole.js";

const router = express.Router();

// Ścieżki do plików danych
const productsFilePath = path.resolve("./data/products.json");
const suppliersFilePath = path.resolve("./data/suppliers.json");

router.patch(
    "/:id",
    checkAcceptHeader,
    checkContentType,
    checkRole,
    async (req, res) => {
        const productId = parseInt(req.params.id, 10);

        try {
            // Odczytanie danych z plików
            const [products, suppliers] = await Promise.all([
                fs.readFile(productsFilePath, "utf-8").then(JSON.parse),
                fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse),
            ]);

            // Znalezienie produktu
            const productIndex = products.findIndex((p) => p.id === productId);
            if (productIndex === -1) {
                return res.status(404).json({ error: `Produkt o ID ${productId} nie istnieje.` });
            }

            const currentProduct = products[productIndex];
            const updateData = req.body;

            // Mapowanie uproszczonych danych na zagnieżdżoną strukturę
            if (updateData.carbohydrates || updateData.proteins || updateData.fats) {
                currentProduct.nutritional_values = {
                    ...currentProduct.nutritional_values,
                    carbohydrates: updateData.carbohydrates ?? currentProduct.nutritional_values.carbohydrates,
                    proteins: updateData.proteins ?? currentProduct.nutritional_values.proteins,
                    fats: updateData.fats ?? currentProduct.nutritional_values.fats,
                };
            }

            if (updateData.name) {
                currentProduct.name = updateData.name;
            }

            if (updateData.category_id) {
                currentProduct.category_id = updateData.category_id;
            }

            if (updateData.id_supplier) {
                const supplierExists = suppliers.some((s) => s.id_supplier === updateData.id_supplier);
                if (!supplierExists) {
                    return res.status(400).json({ error: `Dostawca o ID ${updateData.id_supplier} nie istnieje.` });
                }
                currentProduct.id_supplier = updateData.id_supplier;
            }

            // Aktualizacja produktu
            products[productIndex] = currentProduct;

            // Zapisanie zmian do pliku
            await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));

            res.status(200).json({
                message: `Produkt o ID ${productId} został zaktualizowany.`,
                updatedProduct: currentProduct,
            });
        } catch (error) {
            console.error("Błąd podczas aktualizacji produktu:", error);
            res.status(500).json({ error: "Błąd serwera. Nie udało się zaktualizować produktu." });
        }
    }
);

export default router;
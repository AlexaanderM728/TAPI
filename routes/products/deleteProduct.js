import express from "express";
import fs from "fs/promises";
import path from "path";
import checkContentType from "../../middleware/checkContentType.js";
import checkAcceptHeader from "../../middleware/checkAcceptHeader.js";
import checkRole from "../../middleware/checkRole.js";

const router = express.Router();

// Ścieżka do pliku z produktami
const productsFilePath = path.resolve("./data/products.json");

// DELETE /products/:id - Usunięcie produktu
router.delete(
    "/:id",
    checkAcceptHeader, // Middleware do sprawdzania nagłówka Accept
    checkContentType, // Middleware do sprawdzania Content-Type
    checkRole, // Middleware do sprawdzania uprawnień (role)
    async (req, res) => {
        const productId = parseInt(req.params.id, 10);

        try {
            // Odczytanie danych z pliku JSON
            const products = await fs.readFile(productsFilePath, "utf-8").then(JSON.parse);

            // Znalezienie indeksu produktu
            const productIndex = products.findIndex((p) => p.id === productId);

            if (productIndex === -1) {
                return res.status(404).json({ error: `Produkt o ID ${productId} nie istnieje.` });
            }

            // Usunięcie produktu
            const removedProduct = products.splice(productIndex, 1);

            // Zapisanie zaktualizowanej listy produktów do pliku
            await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));

            res.status(200).json({
                message: `Produkt o ID ${productId} został usunięty.`,
                removedProduct: removedProduct[0],
            });
        } catch (error) {
            console.error("Błąd podczas usuwania produktu:", error);
            res.status(500).json({ error: "Błąd serwera. Nie udało się usunąć produktu." });
        }
    }
);

export default router;
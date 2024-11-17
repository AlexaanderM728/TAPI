import express from "express";
import fs from "fs/promises";
import path from "path";
import { generateHATEOASLinks } from "../../utils/generateHATEOASLinks.js";

const router = express.Router();
const suppliersFilePath = path.resolve("./data/suppliers.json");

// GET /suppliers/:id - Szczegóły dostawcy
router.get("/:id", async (req, res) => {
    const supplierId = parseInt(req.params.id, 10);
    console.log(`Otrzymano żądanie dla dostawcy o ID: ${supplierId}`);

    if (isNaN(supplierId)) {
        console.log("Nieprawidłowy format ID dostawcy.");
        return res.status(400).json({ error: "Nieprawidłowy format ID dostawcy." });
    }

    try {
        const suppliers = await fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse);
        
        const supplier = suppliers.find(s => s.id_supplier === supplierId);

        if (!supplier) {
            return res.status(404).json({ error: `Nie znaleziono dostawcy o ID: ${supplierId}` });
        }

        const baseUrl = `${req.protocol}://${req.headers.host}`;
        const links = generateHATEOASLinks(baseUrl,{
            id: supplierId,
            category_id: "category_id",
            id_supplier: "id_supplier",
            name: "product name",
        });

        res.status(200).json({supplier, links});
    } catch (error) {
        console.error("Błąd podczas odczytu pliku JSON:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się pobrać danych." });
    }
});

export default router;
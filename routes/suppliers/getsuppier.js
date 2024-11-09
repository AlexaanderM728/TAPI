import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const suppliersFilePath = path.resolve("./data/suppliers.json");

// GET /suppliers/:id - Szczegóły dostawcy
router.get("/:id", async (req, res) => {
    const supplierId = parseInt(req.params.id, 10);

    try {
        const suppliers = await fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse);
        const supplier = suppliers.find((s) => s.id_supplier === supplierId);

        if (!supplier) {
            return res.status(404).json({ error: `Dostawca o ID ${supplierId} nie został znaleziony.` });
        }

        res.status(200).json(supplier);
    } catch (error) {
        console.error("Błąd podczas pobierania dostawcy:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się pobrać dostawcy." });
    }
});

export default router;
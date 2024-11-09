import express from "express";
import fs from "fs/promises";
import path from "path";
import checkAcceptHeader from "../../middleware/checkAcceptHeader.js";
import checkContentType from "../../middleware/checkContentType.js";
import checkRole from "../../middleware/checkRole.js";

const router = express.Router();
const suppliersFilePath = path.resolve("./data/suppliers.json");

// PATCH /suppliers/:id - Aktualizacja dostawcy
router.patch("/:id", checkAcceptHeader, checkContentType, checkRole, async (req, res) => {
    const supplierId = parseInt(req.params.id, 10);
    const updates = req.body;

    try {
        const suppliers = await fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse);
        const supplierIndex = suppliers.findIndex((s) => s.id_supplier === supplierId);

        if (supplierIndex === -1) {
            return res.status(404).json({ error: `Dostawca o ID ${supplierId} nie został znaleziony.` });
        }

        suppliers[supplierIndex] = { ...suppliers[supplierIndex], ...updates };

        await fs.writeFile(suppliersFilePath, JSON.stringify(suppliers, null, 2));

        res.status(200).json(suppliers[supplierIndex]);
    } catch (error) {
        console.error("Błąd podczas aktualizacji dostawcy:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się zaktualizować dostawcy." });
    }
});

export default router;
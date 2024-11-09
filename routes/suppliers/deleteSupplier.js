import express from "express";
import fs from "fs/promises";
import path from "path";
import checkAcceptHeader from "../../middleware/checkAcceptHeader.js";
import checkContentType from "../../middleware/checkContentType.js";
import checkRole from "../../middleware/checkRole.js";

const router = express.Router();
const suppliersFilePath = path.resolve("./data/suppliers.json");

// DELETE /suppliers/:id - Usuwanie dostawcy
router.delete("/:id", checkAcceptHeader, checkContentType, checkRole, async (req, res) => {
    const supplierId = parseInt(req.params.id, 10);

    try {
        const suppliers = await fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse);
        const updatedSuppliers = suppliers.filter((s) => s.id_supplier !== supplierId);

        if (updatedSuppliers.length === suppliers.length) {
            return res.status(404).json({ error: `Dostawca o ID ${supplierId} nie został znaleziony.` });
        }

        await fs.writeFile(suppliersFilePath, JSON.stringify(updatedSuppliers, null, 2));

        res.status(200).json({ message: `Dostawca o ID ${supplierId} został usunięty.` });
    } catch (error) {
        console.error("Błąd podczas usuwania dostawcy:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się usunąć dostawcy." });
    }
});

export default router;
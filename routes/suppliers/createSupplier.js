import express from "express";
import fs from "fs/promises";
import path from "path";
import checkAcceptHeader from "../../middleware/checkAcceptHeader.js";
import checkContentType from "../../middleware/checkContentType.js";
import checkRole from "../../middleware/checkRole.js";

const router = express.Router();
const suppliersFilePath = path.resolve("./data/suppliers.json");

// POST /suppliers - Dodawanie dostawcy
router.post("/", checkAcceptHeader, checkContentType,checkRole, async (req, res) => {
    const { name, contact_info, rating } = req.body;

    if (!name || !contact_info || !rating) {
        return res.status(400).json({ error: "Brak wymaganych danych do utworzenia dostawcy." });
    }

    try {
        const suppliers = await fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse);

        const newSupplier = {
            id_supplier: suppliers.length + 1,
            name,
            contact_info,
            rating,
        };

        suppliers.push(newSupplier);

        await fs.writeFile(suppliersFilePath, JSON.stringify(suppliers, null, 2));

        res.status(201).json(newSupplier);
    } catch (error) {
        console.error("Błąd podczas dodawania dostawcy:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się dodać dostawcy." });
    }
});

export default router;
import express from "express";
import fs from "fs/promises";
import path from "path";
import checkAcceptHeader from "../../middleware/checkAcceptHeader.js";
import checkContentType from "../../middleware/checkContentType.js";
import checkRole from "../../middleware/checkRole.js";

const router = express.Router();
const suppliersFilePath = path.resolve("./data/suppliers.json");

// GET /suppliers/filter - Filtrowanie dostawców
router.get("/", checkAcceptHeader, checkContentType,checkRole, async (req, res) => {
    try {
        const suppliers = await fs.readFile(suppliersFilePath, "utf-8").then(JSON.parse);

        // Pobranie parametrów z zapytania
        const { name, minRating, maxRating, address } = req.query;

        // Filtrowanie
        let filteredSuppliers = [...suppliers];

        if (name) {
            filteredSuppliers = filteredSuppliers.filter((s) =>
                s.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        if (minRating || maxRating) {
            filteredSuppliers = filteredSuppliers.filter((s) => {
                const rating = s.rating;
                return (
                    (!minRating || rating >= parseFloat(minRating)) &&
                    (!maxRating || rating <= parseFloat(maxRating))
                );
            });
        }

        if (address) {
            filteredSuppliers = filteredSuppliers.filter((s) =>
                s.contact_info.address.toLowerCase().includes(address.toLowerCase())
            );
        }

        res.status(200).json(filteredSuppliers);
    } catch (error) {
        console.error("Błąd podczas filtrowania dostawców:", error);
        res.status(500).json({ error: "Błąd serwera. Nie udało się przefiltrować dostawców." });
    }
});

export default router;
import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const dataFilePath = path.resolve('data.json');

// Middleware do sprawdzania nagłówka Accept
router.use((req, res, next) => {
    
    if (req.headers.accept !== "application/json") {
        return res.status(406)
            .set("Content-Type", "text/plain")
            .send("Nieakceptowalny typ odpowiedzi. Ustaw nagłówek Accept na application/json.");
    }
    next();
});

// Middleware do sprawdzania roli użytkownika
const checkAdmin = (req, res, next) => {
    const role = req.headers.role; // Sprawdzenie roli w nagłówku

    if (role !== 'admin') {
        return res.status(403).json({ message: "Brak uprawnień do wykonania tej operacji" });
    }
    next();
};

// DELETE /product/:id: Usuwa produkt na podstawie jego ID
router.delete('/:id', checkAdmin, (req, res) => {
    const productId = parseInt(req.params.id, 10);

    // Wczytaj aktualne produkty
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Błąd odczytu pliku JSON:", err);
            return res.status(500).json({ message: "Błąd serwera" });
        }

        try {
            let products = JSON.parse(data);
            const initialLength = products.length;

            // Filtruj produkty, aby usunąć ten o danym ID
            products = products.filter(p => p.product.id !== productId);

            // Sprawdź, czy produkt został usunięty
            if (products.length === initialLength) {
                return res.status(404).json({ message: "Produkt nie znaleziony" });
            }

            // Zapisz zmodyfikowane dane do pliku
            fs.writeFile(dataFilePath, JSON.stringify(products, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error("Błąd zapisu do pliku JSON:", writeErr);
                    return res.status(500).json({ message: "Błąd serwera" });
                }

                res.status(204).send(); // Zwraca status 204 No Content
            });
        } catch (parseErr) {
            console.error("Błąd podczas parsowania danych JSON:", parseErr);
            res.status(500).json({ message: "Błąd podczas parsowania danych" });
        }
    });
});

export default router;
import express from "express";
import fs from "fs";
import path from "path";
import generateLinks from "./generateLinks.js"; 

const router = express.Router();
const dataFilePath = path.resolve("data.json");

// Middleware do sprawdzania nagłówka Accept
router.use((req, res, next) => {
    if (req.headers.accept !== "application/json") {
        return res.status(406)
            .set("Content-Type", "text/plain")
            .send("Nieakceptowalny typ odpowiedzi. Ustaw nagłówek Accept na application/json.");
    }
    next();
});

const checkAdminAndUser = (req, res, next) =>{
    const role = req.headers.role;
    if( role !=='admin' && role !=='user'){
        return res.status(403)
                .set("Content-Type", "text/plain")
                .send("Brak uprawnień do wykonania tej operacji");
    }
    next();
}


router.get("/:id", checkAdminAndUser, (req, res) => {
    const id = parseInt(req.params.id, 10);

    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Błąd odczytu pliku JSON:", err);
            return res.status(500)
                      .set("Content-Type", "text/plain")
                      .send("Błąd serwera");
        }

        try {
            const products = JSON.parse(data);
            const product = products.find(p => p.product.id === id);

            if (!product) {
                return res.status(404)
                          .set("Content-Type", "text/plain")
                          .send(`Nie znaleziono produktu o id: ${id}`);
            }

            // Generowanie odpowiedzi w formacie JSON tylko dla poprawnych zapytań
            const baseUrl = `${req.protocol}://${req.headers.host}`;
            product._links = generateLinks(baseUrl, product, id);
            res.status(200).json(product);

        } catch (parseErr) {
            console.error("Błąd parsowania danych JSON:", parseErr);
            res.status(500)
               .set("Content-Type", "text/plain")
               .send("Błąd parsowania danych");
        }
    });
});

export default router;
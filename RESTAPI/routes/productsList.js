import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const dataFilePath = path.resolve('data.json');

router.use((req, res, next)=> {
    if(req.headers.accept !== "application/json"){
        return res.status(406)
                    .set("Content-Type", "text/plain")
                    .send("Nieakceptowalny typ odpowiedzi. Ustaw nagłówek Accept na application/json.");
    }
    next();
});

router.use((req, res, next) => {
    const role = req.headers.role;
    if( role !=='admin' && role !=='user'){
        return res.status(403)
                .set("Content-Type", "text/plain")
                .send("Brak uprawnień do wykonania tej operacji");
    }
    next();
});

// GET /productsList: Zwraca listę wszystkich produktów
router.get('/', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Błąd odczytu pliku JSON:", err);
            return res.status(500).json({ message: "Błąd serwera" });
        }

        try {
            const products = JSON.parse(data);

            const productsWithLinks = products.map(product => ({
                ...product,
                _links: [
                    { rel: "self", href: `${req.protocol}://${req.get('host')}/product/${product.id}`},
                    { rel: "update", href: `${req.protocol}://${req.get('host')}/product/${product.id}`},
                    { rel: "delete", href: `${req.protocol}://${req.get('host')}/product/${product.id}`},
                    { rel: "filterByCategory", href: `${req.protocol}://${req.get('host')}/productsList?categoryId=${product.product.category.id}` },
                    { rel: "filterBySupplier", href: `${req.protocol}://${req.get('host')}/productsList?supplierName=${encodeURIComponent(product.supplier.name)}` },
                    { rel: "filterByMinRating", href: `${req.protocol}://${req.get('host')}/productsList?minRating=${product.supplier.rating}` },
                    { rel: "filterByMaxCarbohydrates", href: `${req.protocol}://${req.get('host')}/productsList?maxCarbohydrates=${product.product.nutritional_values.carbohydrates}` }
                ]
            }));

            res.status(200).json(productsWithLinks);
        } catch (parseErr) {
            console.error("Błąd podczas parsowania danych JSON:", parseErr);
            res.status(500).json({ message: "Błąd podczas parsowania danych" });
        }
    });
});

export default router;
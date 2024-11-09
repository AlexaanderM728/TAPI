import express from "express";
import fs from "fs";
import path from "path";
import generateLinks from "./generateLinks.js"; 

const updateProduct = (port) => {
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
    const checkAdminAndUser = (req, res, next) =>{
        const role = req.headers.role;
        if( role !=='admin' && role !=='user'){
            return res.status(403)
                    .set("Content-Type", "text/plain")
                    .send("Brak uprawnień do wykonania tej operacji");
        }
        next();
    }
    // PATCH /product/:id: Aktualizuje istniejący produkt
    router.patch('/:id', checkAdminAndUser, (req, res) => {
        const productId = parseInt(req.params.id, 10);
        const updates = req.body;

        // Sprawdzanie, czy przekazano jakiekolwiek dane do aktualizacji
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Brak danych do aktualizacji" });
        }

        fs.readFile(dataFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Błąd odczytu pliku JSON:", err);
                return res.status(500).json({ message: "Błąd serwera" });
            }

            try {
                const products = JSON.parse(data);
                const productIndex = products.findIndex(product => product.product.id === productId);

                if (productIndex === -1) {
                    return res.status(404).json({ message: "Produkt nie znaleziony" });
                }

                // Aktualizacja właściwości produktu na podstawie przekazanych danych
                const existingProduct = products[productIndex];
                const updatedProduct = {
                    ...existingProduct, //  wszystkie istniejące właściwości
                    product: {
                        ...existingProduct.product, //  wszystkie istniejące właściwości produktu
                        ...updates //  nowe wartości z `updates`
                    },
                    supplier: {
                        ...existingProduct.supplier, //  wszystkie istniejące właściwości dostawcy
                       
                    },
                    category: {
                        ...existingProduct.category, //  wszystkie istniejące właściwości kategorii
                        
                    }
                };

                products[productIndex] = updatedProduct; // Zamiana stary produkt nowym

                fs.writeFile(dataFilePath, JSON.stringify(products, null, 2), (writeErr) => {
                    if (writeErr) {
                        console.error("Błąd zapisu do pliku JSON:", writeErr);
                        return res.status(500).json({ message: "Błąd serwera" });
                    }

                    const baseUrl = `${req.protocol}://${req.headers.host}`;
                    updatedProduct._links = generateLinks(baseUrl, updatedProduct, updatedProduct.product.id);

                    res.status(200).json({
                        updatedProduct
                    });
                });
            } catch (parseErr) {
                console.error("Błąd podczas parsowania danych JSON:", parseErr);
                res.status(500).json({ message: "Błąd podczas parsowania danych" });
            }
        });
    });

    return router;
};

export default updateProduct;
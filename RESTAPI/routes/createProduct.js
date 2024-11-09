import express from "express";
import fs from "fs";
import path from "path";
import generateLinks from "./generateLinks.js"; 

const createProduct = (port) => {
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

    // POST /product: Tworzy nowy produkt
    router.post('/', (req, res) => {
        const {
            productName,
            productProducer,
            categoryId,
            categoryName,
            categoryMainCategory,
            nutritionalCarbohydrates,
            nutritionalProteins,
            nutritionalFats,
            supplierId,
            supplierName,
            supplierContactAddress,
            supplierContactPhone,
            supplierRating,
            categoryDescription
        } = req.body;

        if (!productName || !productProducer || !categoryId || !supplierName) {
            return res.status(400).json({ message: "Brak wymaganych danych do utworzenia produktu" });
        }

        fs.readFile(dataFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Błąd odczytu pliku JSON:", err);
                return res.status(500).json({ message: "Błąd serwera" });
            }

            try {
                const products = JSON.parse(data);
                const newProduct = {
                    
                    product: {
                        id: products.length + 1, 
                        name: productName,
                        producer: productProducer,
                        category: {
                            id: categoryId,
                            name: categoryName,
                            main_category: categoryMainCategory
                        },
                        nutritional_values: {
                            carbohydrates: nutritionalCarbohydrates,
                            proteins: nutritionalProteins,
                            fats: nutritionalFats
                        }
                    },
                    supplier: {
                        id_supplier: supplierId,
                        name: supplierName,
                        contact_info: {
                            address: supplierContactAddress,
                            phone: supplierContactPhone
                        },
                        rating: supplierRating
                    },
                    category: {
                        id_category: categoryId,
                        name: categoryName,
                        main_category: categoryMainCategory,
                        description: categoryDescription
                    }
                };

                products.push(newProduct);

                fs.writeFile(dataFilePath, JSON.stringify(products, null, 2), (writeErr) => {
                    if (writeErr) {
                        console.error("Błąd zapisu do pliku JSON:", writeErr);
                        return res.status(500).json({ message: "Błąd serwera" });
                    }
                    var createdProduct = newProduct;
                    const baseUrl = `${req.protocol}://${req.headers.host}`;
                    createdProduct._links = generateLinks(baseUrl, newProduct, newProduct.product.id);
                    res.status(201).json({
                        createdProduct
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

export default createProduct;
import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Import UUID do generowania unikalnych nazw plików
import { fileURLToPath } from 'url';
import generateLinks from "./generateLinks.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const router = express.Router();
const productsData = JSON.parse(fs.readFileSync('./data.json', 'utf-8')); // Wczytanie danych z pliku

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

router.get('/', checkAdminAndUser, (req, res) => {
    console.log("Filtracja produktów");

    const { minCarbohydrates, maxFats, productName, supplierName, producerName, categoryName, minProteins, maxCarbohydrates, minSupplierRating } = req.query;
    console.log(`Kryteria filtrowania: { minCarbohydrates: ${minCarbohydrates}, maxFats: ${maxFats}, productName: ${productName}, supplierName: ${supplierName}, producerName: ${producerName}, 
        categoryName: ${categoryName}, minProteins: ${minProteins}, maxCarbohydrates: ${maxCarbohydrates}, minSupplierRating: ${minSupplierRating} }`);

    let filteredProducts = productsData.filter(product => {
        const meetsCarbohydrates = minCarbohydrates ? product.product.nutritional_values.carbohydrates >= parseFloat(minCarbohydrates) : true;
        const meetsFats = maxFats ? product.product.nutritional_values.fats <= parseFloat(maxFats) : true;
        const meetsName = productName ? product.product.name.toLowerCase().includes(productName.toLowerCase()) : true;
        const meetsSupplier = supplierName ? product.supplier.name.toLowerCase().includes(supplierName.toLowerCase()) : true;
        const meetsProducer = producerName ? product.product.producer.toLowerCase().includes(producerName.toLowerCase()) : true;
        const meetsCategory = categoryName ? product.category.name.toLowerCase().includes(categoryName.toLowerCase()) : true;
        const meetsProteins = minProteins ? product.product.nutritional_values.proteins >= parseFloat(minProteins) : true;
        const meetsMaxCarbohydrates = maxCarbohydrates ? product.product.nutritional_values.carbohydrates <= parseFloat(maxCarbohydrates) : true;
        const meetsSupplierRating = minSupplierRating ? product.supplier.rating >= parseFloat(minSupplierRating) : true;

        return meetsCarbohydrates && meetsFats && meetsName && meetsSupplier && meetsProducer && meetsCategory && meetsProteins && meetsMaxCarbohydrates && meetsSupplierRating;
    });

    console.log(`Znaleziono ${filteredProducts.length} produktów spełniających kryteria.`);

    // Zapisz wyniki do pliku tymczasowego
    if (filteredProducts.length > 0) {
        const tempFilePath = path.join(__dirname, '../temp', `filteredProducts_${uuidv4()}.json`);
        fs.writeFileSync(tempFilePath, JSON.stringify(filteredProducts, null, 2));
    }

    // Dodanie HATEOAS
    const baseUrl = `${req.protocol}://${req.headers.host}`; // Podstawowy URL bez parametrów

    // Tworzenie HATEOAS dla każdego produktu
    const response = {
        products: filteredProducts.map(product => {
            const productId = product.product.id;
            const links = generateLinks(baseUrl, product, productId); // Generowanie linków HATEOAS

            return {
                ...product,
                _links: links // wygenerowane linki do obiektu produktu
            };
        }),
    };

    res.status(200).json(response);
});

export default router;
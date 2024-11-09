import express from "express";
import cors from "cors";

import productsList from "./routes/productsList.js"; 
import createProduct from "./routes/createProduct.js";
import getProduct from "./routes/getProduct.js";
import deleteProduct from "./routes/deleteProduct.js";
import updateProduct from "./routes/updateProduct.js";
import filterBy from "./routes/filterProducts.js";


const app = express();
const port = 8989;

app.use(cors({
    origin: "http://mojadomenaoproduktach.pl" 
}));

app.use(express.json()); 

app.use((req, res, next) => {
    // Sprawdzenie tylko metody wymagające `Content-Type: application/json`
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
        if (!req.is('application/json')) {
            return res.status(415).json({
                error: "Unsupported Media Type",
                message: "Expected 'Content-Type: application/json'",
                header: `${req.headers.accept}, ${req.headers.role}`
            });
        }
    }
    next();
});

app.use("/products", filterBy);  
app.use("/products", productsList); 
app.use('/products', createProduct(port));
app.use('/products', getProduct);
app.use("/products", deleteProduct);
app.use("/products", updateProduct(port));


// app use  dsotawcy 
// app use  kategorie 



app.listen(port, () => {
    console.log(`Serwer uruchomiony na porcie ${port}`);
});


/* 
zapytania : 
GET
cala lista produktow : "http://localhost:8989/productsList"
jedne filtr : "http://localhost:8989/productsList?minCarbohydrates=9.4"
wiecje filtorwo : "http://localhost:8989/productsList?minCarbohydrates=9.4&maxCarbohydrates=9.4"
szukanie po nazwie : "http://localhost:8989/productsList?productName=jogurt"

dodawanie porduktu : "http://mojadomenaoproduktach.pl:8989/product"
POST
josn : "
{
    "productName": "Homelander jogurt",
    "productProducer": "Johnson-Broders",
    "categoryId": 105,
    "categoryName": "Nabiał",
    "categoryMainCategory": "Produkty mleczne",
    "nutritionalCarbohydrates": 10,
    "nutritionalProteins": 14,
    "nutritionalFats": 8,
    "supplierId": 69,
    "supplierName": "Yates, Kaiser and Howard",
    "supplierContactAddress": "390 Matthew Village, East Kristenhaven, FM 81039",
    "supplierContactPhone": "001-972-521-7720x1535",
    "supplierRating": 5.0,
    "categoryDescription": "Produkty bogate w składniki odżywcze."
}
"
DELETE
usuwniae : "http://mojadomenaoproduktach.pl:8989/product/103"

update produktu : "http://localhost:8989/product/101"
PATCH
"
{
    "name": "ATRAIN jogurttt",
    "nutritional_values": {
        "carbohydrates": 68,
        "proteins": 68,
        "fats": 68
    }
}
"
 
*/
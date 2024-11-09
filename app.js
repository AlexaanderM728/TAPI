import express from "express";
import cors from "cors";


import checkAcceptHeader from "./middleware/checkAcceptHeader.js";

import getProduct from "./routes/products/getProduct.js";
import createProduct from "./routes/products/createProduct.js";
import deleteProduct from "./routes/products/deleteProduct.js";
import updateProduct from "./routes/products/updateProduct.js";
import productList from "./routes/products/productList.js";
import filterProducts from "./routes/products/filterProducts.js";

import listSuppliers from "./routes/suppliers/listSuppliers.js";
import getSupplier from "./routes/suppliers/getsuppier.js";
import createSupplier from "./routes/suppliers/createSupplier.js";
import deleteSupplier from "./routes/suppliers/deleteSupplier.js";
import updateSupplier from "./routes/suppliers/updateSupplier.js"
import filterSuppliers from "./routes/suppliers/filterSuppliers.js";

import listCategories from "./routes/categories/listCategories.js";
import getCategory from "./routes/categories/getCategory.js";
import createCategory from "./routes/categories/createCategory.js";
import updateCategory from "./routes/categories/updateCategory.js";
import deleteCategory from "./routes/categories/deleteCategory.js";


const app = express();
const port = 8989;

app.use(cors({
    origin: "http://mojadomenaoproduktach.pl" 
}));

app.use(express.json()); 

app.use((req, res, next) => {
    if (req.method === "GET") {
        return checkAcceptHeader(req, res, next);
    }
    next();
});


app.use("/products/:id", getProduct); // GET /products/:id
app.use("/products", createProduct);  // POST /products
app.use("/products/:id", deleteProduct); // DELETE /products/:id
app.use("/products/:id", updateProduct); // PATCH /products/:id
app.use("/products", productList); // GET /products
app.use("/products/filter", filterProducts); 

app.use("/suppliers/:id", getSupplier);
app.use("/suppliers", createSupplier);
app.use("/suppliers/:id", deleteSupplier);
app.use("/suppliers/:id", updateSupplier);
app.use("/suppliers", listSuppliers);
app.use("/suppliers/filter", updateSupplier);
app.use("/suppliers/filter",filterSuppliers);

app.use("/categories", listCategories);
app.use("/categories", getCategory);
app.use("/categories", createCategory);
app.use("/categories", updateCategory);
app.use("/categories", deleteCategory);



// Uruchomienie serwera
app.listen(port, () => {
    console.log(`Serwer uruchomiony na porcie ${port}`);
});

# TAPI
## Products

### Get Product List
curl -X GET http://localhost:8989/products \
-H "Accept: application/json" \
-H "role: admin"

### Get Product by ID
curl -X GET http://localhost:8989/products/1 \
-H "Accept: application/json" \
-H "role: admin"

### Create a Product
curl -X POST http://localhost:8989/products \
-H "Content-Type: application/json" \
-H "role: admin" \
-d '{
    "name": "Nowy produkt",
    "category_id": 1,
    "id_supplier": 1,
    "nutritional_values": {
        "carbohydrates": 10,
        "proteins": 5,
        "fats": 3
    }
}'

### Update a Product
curl -X PATCH http://localhost:8989/products/1 \
-H "Content-Type: application/json" \
-H "role: admin" \
-d '{
    "name": "Zaktualizowany produkt",
    "carbohydrates": 15
}'

### Delete a Product
curl -X DELETE http://localhost:8989/products/1 \
-H "Content-Type: application/json" \
-H "role: admin"

---

## Suppliers

### Get Supplier List
curl -X GET http://localhost:8989/suppliers \
-H "Accept: application/json" \
-H "role: admin"

### Get Supplier by ID
curl -X GET http://localhost:8989/suppliers/1 \
-H "Accept: application/json" \
-H "role: admin"

### Create a Supplier
curl -X POST http://localhost:8989/suppliers \
-H "Content-Type: application/json" \
-H "role: admin" \
-d '{
    "name": "Nowy dostawca",
    "contact_info": { "address": "ul. Nowa 1, Miasto", "phone": "123-456-789" },
    "rating": 5
}'

### Update a Supplier
curl -X PATCH http://localhost:8989/suppliers/1 \
-H "Content-Type: application/json" \
-H "role: admin" \
-d '{"rating": 4.5}'

### Delete a Supplier
curl -X DELETE http://localhost:8989/suppliers/1 \
-H "role: admin"

---

## Categories

### Get Category List
curl -X GET http://localhost:8989/categories \
-H "Accept: application/json" \
-H "role: admin"

### Get Category by ID
curl -X GET http://localhost:8989/categories/1 \
-H "Accept: application/json" \
-H "role: admin"

### Create a Category
curl -X POST http://localhost:8989/categories \
-H "Content-Type: application/json" \
-H "role: admin" \
-d '{
    "name": "Nabiał",
    "main_category": "Produkty spożywcze",
    "description": "Produkty mleczne i nabiałowe."
}'

### Update a Category
curl -X PATCH http://localhost:8989/categories/1 \
-H "Content-Type: application/json" \
-H "role: admin" \
-d '{"description": "Nowy opis kategorii"}'

### Delete a Category
curl -X DELETE http://localhost:8989/categories/1 \
-H "role: admin"

---

## Filters

### Filter Products
curl -X GET "http://localhost:8989/products/filter?carbohydrates=10&proteins=5" \
-H "Accept: application/json" \
-H "role: admin"

### Filter Suppliers
curl -X GET "http://localhost:8989/suppliers/filter?minRating=4&address=Miasto" \
-H "Accept: application/json" \
-H "role: admin"
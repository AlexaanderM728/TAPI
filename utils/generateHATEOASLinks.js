/**
 * Generuje dynamiczne linki HATEOAS dla zasobu.
 * @param {string} baseUrl - Podstawowy URL (np. z req.headers.host).
 * @param {Object} resourceData - Dane zasobu (np. ID, wartości odżywcze, kategoria, itp.).
 * @returns {Array} Lista linków HATEOAS dla zasobu.
 */
export function generateHATEOASLinks(baseUrl, resourceData = {}) {
    const {
        id,
        category_id,
        id_supplier,
        nutritional_values: { carbohydrates, proteins, fats } = {},
    } = resourceData;

    // Wszystkie dostępne endpointy w API
    const apiEndpoints = [
        { rel: "products_list", method: "GET", href: `${baseUrl}/products` },
        { rel: "products_create", method: "POST", href: `${baseUrl}/products` },
        { rel: "products_details", method: "GET", href: `${baseUrl}/products/${id || "{id}"}` },
        { rel: "products_update", method: "PATCH", href: `${baseUrl}/products/${id || "{id}"}` },
        { rel: "products_delete", method: "DELETE", href: `${baseUrl}/products/${id || "{id}"}` },
        {
            rel: "products_filter",
            method: "GET",
            href: `${baseUrl}/products/filter?category_id=${category_id}&minCarbohydrates=${carbohydrates}&maxCarbohydrates=${carbohydrates}&minProteins=${proteins}&maxProteins=${proteins}&minFats=${fats}&maxFats=${fats}`,
        },
        { rel: "categories_list", method: "GET", href: `${baseUrl}/categories` },
        { rel: "suppliers_list", method: "GET", href: `${baseUrl}/suppliers` },
        { rel: "suppliers_details", method: "GET", href: `${baseUrl}/suppliers/${id_supplier || "{id_supplier}"}` },
    ];

    // Generowanie linków z dynamicznymi danymi
    return apiEndpoints.map((endpoint) => ({
        ...endpoint,
        href: endpoint.href
            .replace("{id}", id || "")
            .replace("{category_id}", category_id || "")
            .replace("{id_supplier}", id_supplier || ""),
    }));
}


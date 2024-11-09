const generateLinks = (baseUrl, product, id) => {
    const minCarbohydrates = product.product.nutritional_values.carbohydrates || 0;
    const maxCarbohydrates = product.product.nutritional_values.carbohydrates || 0;
    const minFats = product.product.nutritional_values.fats || 0;
    const maxFats = product.product.nutritional_values.fats || 0;
    const minProteins = product.product.nutritional_values.proteins || 0;
    const maxProteins = product.product.nutritional_values.proteins || 0;

    const supplierName = product.supplier ? encodeURIComponent(product.supplier.name) : '';
    const producerName = product.producer ? encodeURIComponent(product.producer.name) : '';
    const categoryName = product.category ? encodeURIComponent(product.category.name) : '';
    const minSupplierRating = product.supplier ? product.supplier.rating : 0;

    return {
        "self": `${baseUrl}/product/${id}`,
        "update": `${baseUrl}/product/${id}`,
        "delete": `${baseUrl}/product/${id}`,
        "minCarbohydrates": `${baseUrl}/productsList?minCarbohydrates=${minCarbohydrates}`,
        "maxCarbohydrates": `${baseUrl}/productsList?maxCarbohydrates=${maxCarbohydrates}`,
        "minFats": `${baseUrl}/productsList?minFats=${minFats}`,
        "maxFats": `${baseUrl}/productsList?maxFats=${maxFats}`,
        "minProteins": `${baseUrl}/productsList?minProteins=${minProteins}`,
        "maxProteins": `${baseUrl}/productsList?maxProteins=${maxProteins}`,
        "supplierName": `${baseUrl}/productsList?supplierName=${supplierName}`,
        "producerName": `${baseUrl}/productsList?producerName=${producerName}`,
        "categoryName": `${baseUrl}/productsList?categoryName=${categoryName}`,
        "minSupplierRating": `${baseUrl}/productsList?minSupplierRating=${minSupplierRating}`,
        "allParams": `${baseUrl}/productsList?minCarbohydrates=${minCarbohydrates}&maxCarbohydrates=${maxCarbohydrates}&minFats=${minFats}&maxFats=${maxFats}&minProteins=${minProteins}&maxProteins=${maxProteins}&supplierName=${supplierName}&producerName=${producerName}&categoryName=${categoryName}&minSupplierRating=${minSupplierRating}`
    };
};

export default generateLinks;
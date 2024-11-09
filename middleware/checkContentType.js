const checkContentType = (req, res, next) => {
    console.log(`Metoda: ${req.method}, Nagłówki: ${JSON.stringify(req.headers)}`);
    
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
        const contentType = req.headers['content-type'];
        if (!contentType || contentType !== 'application/json') {
            console.log("Brak poprawnego Content-Type");
            return res.status(415).json({
                error: "Unsupported Media Type",
                message: "Nagłówek Content-Type musi być ustawiony na 'application/json' dla zapytań z ciałem."
            });
        }
    }
    console.log("Nagłówki poprawne.");
    next();
};

export default checkContentType;
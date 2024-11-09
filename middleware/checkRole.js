const checkRole = (req, res, next) => {
    const role = req.headers['role'];

    // Sprawdź, czy nagłówek `role` jest ustawiony
    if (!role) {
        return res.status(403).json({
            error: "Forbidden",
            message: "Brak uprawnień. Nagłówek 'role' jest wymagany."
        });
    }

    // Sprawdź, czy wartość nagłówka jest poprawna
    if (role !== 'admin' && role !== 'user') {
        return res.status(403).json({
            error: "Forbidden",
            message: "Nieprawidłowa rola. Wymagana rola: 'admin' lub 'user'."
        });
    }

    next(); // Przejdź do kolejnego middleware lub obsługi trasy
};

export default checkRole;
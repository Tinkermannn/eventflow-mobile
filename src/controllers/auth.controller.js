const authRepository = require('../repositories/auth.repository');
const baseResponse = require('../utils/baseResponse.util');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await authRepository.findUserByEmail(email);

        if (existingUser) {
            return baseResponse(res, false, 400, "User with this email already exists", null);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await authRepository.createUser({ name, email, passwordHash, role });

        // Hapus password dari response
        delete newUser.passwordHash;

        return baseResponse(res, true, 201, "User registered successfully", newUser);
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authRepository.findUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return baseResponse(res, false, 401, "Invalid credentials", null);
        }
        
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        delete user.passwordHash;

        return baseResponse(res, true, 200, "Login successful", { user, token });

    } catch (error) {
        next(error);
    }
};
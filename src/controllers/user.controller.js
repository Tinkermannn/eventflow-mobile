const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.getProfile = async (req, res, next) => {
    try {
        // ID user diambil dari token yang sudah diverifikasi oleh middleware `protect`
        const userId = req.user.id;
        const user = await userRepository.findUserById(userId);

        if (!user) {
            return baseResponse(res, false, 404, "User not found", null);
        }
        return baseResponse(res, true, 200, "Profile fetched successfully", user);
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, phoneNumber } = req.body;
        
        const dataToUpdate = {};
        if (name) dataToUpdate.name = name;
        if (phoneNumber) dataToUpdate.phoneNumber = phoneNumber;

        // Jika ada file yang di-upload (ditangani oleh middleware `upload`)
        if (req.file) {
            dataToUpdate.avatarUrl = req.file.path; // URL dari Cloudinary
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return baseResponse(res, false, 400, "No data provided for update", null);
        }

        const updatedUser = await userRepository.updateUser(userId, dataToUpdate);
        return baseResponse(res, true, 200, "Profile updated successfully", updatedUser);
    } catch (error) {
        next(error);
    }
};
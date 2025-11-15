"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseResponse = baseResponse;
exports.errorResponse = errorResponse;
function baseResponse(params) {
    return {
        success: params.success,
        message: params.message,
        data: params.data,
        error: params.error
    };
}
function errorResponse(error) {
    let errorMsg = 'Internal server error';
    if (typeof error === 'object' && error && 'error' in error) {
        errorMsg = error.error;
    }
    return baseResponse({ success: false, error: errorMsg });
}

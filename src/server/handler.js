const predictClassification = require('../services/inferenceService');
const Boom = require('@hapi/boom');
const storeData = require('../services/storeData');
const crypto = require('crypto');


async function postPredictHandler(request, h) {
    try {
        const { image } = request.payload;
        const { model } = request.server.app;

        const { label, suggestion } = await predictClassification(model, image);
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            id,
            result: label,
            suggestion,
            createdAt
        };

        await storeData(id, data);
        
        return h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data
        }).code(201);
    } catch (error) {
        if (Boom.isBoom(error)) {
            return error;
        }
        
        console.error('Prediction Error:', error);
        return Boom.badRequest('Terjadi kesalahan dalam melakukan prediksi');
    }
}

module.exports = postPredictHandler;
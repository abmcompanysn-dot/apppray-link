// api/proxy.js

// Cette fonction agira comme une passerelle (proxy) vers votre Google Apps Script.
export default async function handler(request, response) {
    // L'URL de votre script Google est stockée de manière sécurisée dans les variables d'environnement de Vercel.
    const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!SCRIPT_URL) {
        return response.status(500).json({ error: 'URL du script Google non configurée sur le serveur.' });
    }

    try {
        let googleResponse;

        // On transfère la requête du frontend vers le script Google
        if (request.method === 'POST') {
            googleResponse = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request.body),
                redirect: 'follow' // Important pour Google Apps Script
            });
        } else { // Pour les requêtes GET
            const url = new URL(SCRIPT_URL);
            // On transfère les paramètres de la requête
            Object.keys(request.query).forEach(key => url.searchParams.append(key, request.query[key]));
            
            googleResponse = await fetch(url.toString(), {
                method: 'GET',
                redirect: 'follow'
            });
        }

        // Autoriser les requêtes cross-origin pour que votre frontend puisse parler à cette API
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // On récupère la réponse de Google
        const data = await googleResponse.json();

        // On renvoie la réponse de Google au frontend
        response.status(googleResponse.status).json(data);

    } catch (error) {
        console.error('Erreur dans la passerelle (proxy):', error);
        response.status(500).json({ error: 'Une erreur est survenue dans la passerelle.' });
    }
}

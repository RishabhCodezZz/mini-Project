// A lightweight, browser-safe translation utility using the Google Translate GTX endpoint
// No tokens or Node.js modules required!

export async function translate(text, opts = {}) {
    const from = opts.from || 'auto';
    const to = opts.to || 'en';

    try {
        // Use the GT-X endpoint which doesn't require complex tokens
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Google returns an array where data[0] contains the translated text blocks
        let translatedText = '';
        if (data && data[0]) {
            data[0].forEach(item => {
                if (item[0]) translatedText += item[0];
            });
        }

        // data[2] usually contains the detected source language code
        const detectedLang = data[2] || from;

        // Return in the exact same format that ChatInterface.jsx expects
        return {
            text: translatedText,
            from: {
                language: {
                    iso: detectedLang
                }
            }
        };

    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}
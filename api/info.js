export default async function handler(req, res) {
    // السماح لأي موقع بالتحدث مع هذا الخادم
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;
    const apiKey = process.env.RAPIDAPI_KEY; // قراءة المفتاح الآمن من Vercel

    if (!url || !apiKey) {
        return res.status(400).json({ error: 'بيانات غير مكتملة.' });
    }

    try {
        const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${extractVideoId(url)}`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
            }
        });

        const data = await response.json();

        if (data.status === 'ok' && data.link) {
            res.status(200).json({ downloadUrl: data.link });
        } else {
            throw new Error('لم يتم العثور على رابط تحميل.');
        }

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'فشل تحليل الفيديو. حاول مرة أخرى.' });
    }
}

// دالة مساعدة لاستخراج معرف الفيديو
function extractVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

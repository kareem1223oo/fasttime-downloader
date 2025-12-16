// هذا هو الخادم الوهمي الذي سيحل المشكلة
export default async function handler(req, res) {
    // السماح لأي موقع بالتحدث مع هذا الخادم
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'الرجاء إدخال رابط يوتيوب' });
    }

    try {
        // هذا الخادم هو الذي سيتحدث مع API الخارجي
        const apiResponse = await fetch(`https://api.cobalt.tools/api/json?url=${encodeURIComponent(url)}`);
        const data = await apiResponse.json();

        if (data.status !== 'stream' || !data.url) {
            throw new Error('لم يتم العثور على رابط تحميل صالح.');
        }

        // إرسال النتيجة إلى موقعك
        res.status(200).json({ downloadUrl: data.url });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'فشل تحليل الفيديو. حاول مرة أخرى.' });
    }
}

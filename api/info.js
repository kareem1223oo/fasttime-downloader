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
        // --- التغيير هنا: استخدام API جديد وموثوق ---
        const apiUrl = `https://youtube-dl-api.herokuapp.com/api/info?url=${encodeURIComponent(url)}`;
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();

        // --- التغيير هنا: التحقق من وجود رابط التحميل ---
        if (!data.url) {
            throw new Error('لم يتم العثور على رابط تحميل صالح.');
        }

        // إرسال النتيجة إلى موقعك
        res.status(200).json({ downloadUrl: data.url });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'فشل تحليل الفيديو. قد تكون الخدمة الخارجية غير متوفرة حاليًا، حاول مرة أخرى.' });
    }
}

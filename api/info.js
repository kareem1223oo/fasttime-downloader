import ytdl from 'ytdl-core';

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
        // التحقق من الرابط
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'رابط يوتيوب غير صالح' });
        }

        // جلب معلومات الفيديو والجودات
        const info = await ytdl.getInfo(url);
        
        // اختيار أفضل جودة (فيديو + صوت)
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });

        if (!format) {
            throw new Error('لم يتم العثور على جودة مناسبة للتحميل.');
        }

        // إرسال رابط التحميل المباشر
        res.status(200).json({ downloadUrl: format.url });

    } catch (error) {
        console.error('ytdl-core Error:', error.message);
        
        let errorMessage = 'فشل تحليل الفيديو. حاول مرة أخرى.';
        if (error.message.includes('Video unavailable') || error.message.includes('private')) {
            errorMessage = 'الفيديو غير متاح أو خاص.';
        } else if (error.message.includes('This video is restricted')) {
            errorMessage = 'الفيديو مقيد. لا يمكن تحميله.';
        }
        
        res.status(500).json({ error: errorMessage });
    }
}

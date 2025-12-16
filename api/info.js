// الخادم الوهمي القوي الذي يعتمد على yt-dlp
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
        // --- الخطوة 1: جلب معلومات الفيديو والجودات المتاحة ---
        const infoUrl = `https://yt.8man.com/api/v1/info?url=${encodeURIComponent(url)}`;
        const infoResponse = await fetch(infoUrl);

        if (!infoResponse.ok) {
            throw new Error('فشل جلب معلومات الفيديو من الخدمة.');
        }

        const infoData = await infoResponse.json();
        const formats = infoData.streamingData.formats;

        // البحث عن أفضل جودة فيديو مع صوت (MP4)
        let bestFormat = null;
        for (const format of formats) {
            if (format.mimeType.includes('video/mp4') && format.audioQuality && format.qualityLabel) {
                if (!bestFormat || parseInt(format.height) > parseInt(bestFormat.height)) {
                    bestFormat = format;
                }
            }
        }

        if (!bestFormat) {
            throw new Error('لم يتم العثور على جودة مناسبة للتحميل.');
        }

        // إرسال رابط التحميل المباشر إلى موقعك
        res.status(200).json({ downloadUrl: bestFormat.url });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'فشل تحليل الفيديو. حاول مرة أخرى.' });
    }
}

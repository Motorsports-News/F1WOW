// F1wow Newsletter API - Vercel Serverless Function
// Free hosting, no authentication required for basic usage

export default async function handler(req, res) {
    // CORS headers - restrict to allowed origins
    const allowedOrigins = [
        'https://motorsports-news.github.io',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method, query, body } = req;

    // Health check
    if (req.url === '/health' || req.url === '/api/health') {
        return res.status(200).json({ status: 'ok', service: 'f1wow-newsletter' });
    }

    // GET: Get subscriber count
    if (method === 'GET' && req.url === '/api/subscribers/count') {
        // This would connect to a database
        // For now, return a mock count
        return res.status(200).json({
            count: Math.floor(Math.random() * 1000) + 500,
            message: 'Connect to a database to track real subscribers'
        });
    }

    // POST: Subscribe to newsletter
    if (method === 'POST' && req.url === '/api/subscribe') {
        const { email } = body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Store subscriber (in production, use a database like Vercel Postgres)
        // For now, we'll simulate success
        // console.log('New subscriber:', email); // Removed: don't log emails

        return res.status(200).json({
            success: true,
            message: 'Successfully subscribed!',
            email: email
        });
    }

    // POST: Send newsletter to all subscribers
    if (method === 'POST' && req.url === '/api/notify') {
        const { articleTitle, articleUrl, adminKey } = body;

        // Admin key must be configured via environment variable; fail closed if missing
        const VALID_KEY = process.env.ADMIN_KEY;
        if (!VALID_KEY || adminKey !== VALID_KEY) {
            return res.status(403).json({ error: 'Invalid admin key' });
        }

        if (!articleTitle || !articleUrl) {
            return res.status(400).json({ error: 'Article title and URL are required' });
        }

        // In production, fetch subscribers from database and send emails
        // For now, log the notification
        console.log('Newsletter notification:', { articleTitle, articleUrl });

        return res.status(200).json({
            success: true,
            message: 'Newsletter sent to subscribers',
            notified: 0 // Replace with actual count
        });
    }

    return res.status(404).json({ error: 'Not found' });
}

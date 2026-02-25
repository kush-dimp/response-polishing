module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { model, messages, max_tokens } = req.body;

    if (!model || !messages) {
        return res.status(400).json({ error: 'Missing required fields: model, messages' });
    }

    const isOpenAI = model.startsWith('gpt-') || model.startsWith('o1');

    try {
        let apiResponse;

        if (isOpenAI) {
            apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({ model, messages, max_tokens })
            });
        } else {
            apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({ model, messages, max_tokens })
            });
        }

        const data = await apiResponse.json();
        return res.status(apiResponse.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

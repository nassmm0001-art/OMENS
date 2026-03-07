export default async function handler(req, res) {
    const { question, symbols } = req.body;

    // Change the fallback so the AI doesn't get confused by an empty box
    const inquiry = question && question.trim() !== '' ? question : "Open reading. Just channel the ambient energy.";

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLAUDE_KEY, 
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-6", // Updated to March 2026 Model
                max_tokens: 1500,
                temperature: 0.85, 
                system: `You are an intuitive energy translator. You do not overthink, over-analyze, or force logical structures. Your only job is to feel the "weather" of the symbols provided.
                
                HOW TO TRANSLATE THE ENERGY:
                - Read the ambient vibe: If there is no specific question, don't invent one. Just describe the current energetic tide.
                - Use Sensory Metaphors: Ditch textbook tarot definitions. Describe the symbols as elements (fire, water, earth, air), light/shadow, momentum, gravity, or temperature. Let them blend together like watercolors. 
                - Be Organic: If the cards are 10 of Cups and The Sun, the energy feels like "warmth, expansion, a deep exhale, basking in golden light." If it's The Tower and 3 of Swords, it feels like "sudden lightning, heavy pressure, the breaking of a fever."
                - Actions are Energetic, not Tactical: Don't give corporate or aggressive advice. Tell the user how to move *with* the energy. (e.g., "Breathe into the expansion," "Let the old structures fall," "Anchor your feet," "Float, do not swim").`,
                messages: [{
                    role: "user",
                    content: `INQUIRY: "${inquiry}"
                    SYMBOLS PRESENT: [${symbols.join(', ')}]
                    
                    Return ONLY a JSON array of 7 objects. 
                    Format: {
                      "pattern": "2-4 words describing the elemental vibe (e.g., 'A rising warm tide', 'Heavy stagnant earth')", 
                      "reading": "A fluid, atmospheric translation of how this combination feels energetically. No jargon.", 
                      "action": "How to naturally carry or move through this specific energy."
                    }`
                }]
            })
        });

        const data = await response.json();
        let content = data.content[0].text;
        
        // Sanitize JSON
        if (content.includes('```json')) {
            content = content.split('```json')[1].split('```')[0];
        } else if (content.includes('```')) {
            content = content.split('```')[1].split('```')[0];
        }

        res.status(200).json(JSON.parse(content.trim()));
    } catch (error) {
        res.status(500).json({ error: "NEURAL_LINK_STALLED", details: error.message });
    }
}
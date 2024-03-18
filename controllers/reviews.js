const { Client } = require("@googlemaps/google-maps-services-js");
const OpenAI = require('openai');

const mapKey = process.env.mapKey;
const AIkey = process.env.AIkey;

const client = new Client({});
const openai = new OpenAI({
    apiKey: AIkey
});

let message_list = [];

module.exports.sum = async (req, res) => {
    console.log('getting sum request');
    console.log(client);
    message_list = [];
    const query = req.body.location;
    const r = await client
        .textSearch({
            params: {
                query: query,
                radius: 10000,
                type: "restaurant",
                key: mapKey,
            },
            timeout: 1000, // milliseconds
        });
    const responseData = r.data.results;
    const extractedID = responseData.map(data => {
        return {
            //name: data.name,
            place_id: data.place_id,
            //price_level: data.price_level,
            //address: data.formatted_address,
            //rating: data.rating
        };
    });
    const reviews_all = [];
    for (let i = 0; i < extractedID.length; i++) {
        const place_id = extractedID[i].place_id;
        const r = await client
            .placeDetails({
                params: {
                    place_id: place_id,
                    key: mapKey,
                },
                timeout: 1000, // milliseconds
            });
        const data = r.data.result;
        const extractedData = {
            name: data.name,
            summary: data.editorial_summary,
            rating: data.rating,
            reviews: data.reviews.map(review => review.text),
        };
        reviews_all.push(extractedData);
    }
    const prompt = "You are a culinary guide, summarizing local delicacies based on the information I provide. Be objective and neutral."
        //+ "Divide it into paragraphs, keep it well-organized, and avoid writing in one large block."
        + "Categorize the restaurants, refrain from stating information without actual content. Add a little emoji. Your response must be no more than 100 words."
    const msg = prompt + "Summarize the info: " + JSON.stringify(reviews_all);
    message_list.push({ role: "system", content: msg });
    const completion = await openai.chat.completions.create({
        messages: message_list,
        model: "gpt-3.5-turbo"
    });
    const ans = completion.choices[0].message.content;
    message_list.push({ role: "assistant", content: ans });
    res.json(ans);
    console.log(ans);
}

module.exports.ask = async (req, res) => {
    const ask = req.body.text;
    message_list.push({ role: "user", content: ask });
    const completion = await openai.chat.completions.create({
        messages: message_list,
        model: "gpt-3.5-turbo"
    });
    const ans = completion.choices[0].message.content;
    message_list.push({ role: "assistant", content: ans });
    res.json(ans);
    console.log(ans);
}
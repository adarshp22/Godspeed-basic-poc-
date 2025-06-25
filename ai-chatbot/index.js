const godspeed = require('godspeed');
const OpenAI = require('openai');
const redis = require('redis');
const { Server } = require('socket.io');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();

const app = godspeed();
const io = new Server(app.server);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', async (msg) => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: msg }],
        model: 'gpt-3.5-turbo',
      });
      socket.emit('chat message', completion.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      socket.emit('error', 'An error occurred. Please try again later.');
    }
  });
});

app.listen(3000, () => {
  console.log('listening on *:3000');
});
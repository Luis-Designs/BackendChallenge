import 'dotenv/config'
import server from './service';

const { PORT } = process.env

server.listen(Number(PORT), '0.0.0.0', () => {
    console.log('Listening at', `http://localhost:${PORT}`);
})
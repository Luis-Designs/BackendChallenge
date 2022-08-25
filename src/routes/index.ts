import { Router } from "express";
import ProcessVideo from "../controller/processVideo.controller";

const miniApp = Router()

export default miniApp

miniApp.get('/', (_, res) => {
    res.json({ sms: "Hola mundo" })
})

miniApp.get('/videos', (req, res) => {
    res.json({ message: 'succes' });
    ProcessVideo.getVideosUrls();
});

miniApp.get('/importVideos', (_, res) => {
    res.json({ message: 'succes' });
    ProcessVideo.downLoadAllMedia();
});

miniApp.get('/mergeVideos', (_, res) => {
    res.json({ message: 'succes' });
    ProcessVideo.mergeAllvideos();
});

miniApp.get('/cutVideos', (_, res) => {
    res.json({ message: true });
    ProcessVideo.cutVideos();
});

miniApp.get('/concatVideos', (_, res) => {
    res.json({ message: true });
    ProcessVideo.concatVideos();
});
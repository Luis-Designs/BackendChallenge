import VideoModel, { VideoStatus } from "../data/models/Video.models";
import axiosService from "../service/axios.service";
import fs from 'fs'
import { exec } from "child_process";


class ProcessVideo {
    async getVideosUrls(limit = 20) {
        const { documents, status } = await axiosService.getVideos(limit)

        if (!(status >= 200) || !(status <= 400))
            throw new Error('Couldnot connect to api')

        VideoModel.insertMany(documents)
    }

    private writeVideoAndAudio(audio: any, video: any, id: string) {
        const audioProcess = audio.pipe(fs.createWriteStream(__dirname + `/../../videos/audio-${id}.mp4`));
        audioProcess.on('finish', async () => {
            console.log('Successfully downloaded video');
            await VideoModel.updateOne({ _id: id }, { isAudioDownloaded: true });
        });

        const videoProcess = video.pipe(fs.createWriteStream(__dirname + `/../../videos/video-${id}.mp4`));
        videoProcess.on('finish', async () => {
            console.log('Successfully downloaded file!');
            await VideoModel.updateOne({ _id: id }, { isVideoDownloaded: true });
        });
    }

    private async dowloadVideoAndAudio(url: string, _id: string) {
        const [audio, video] = await Promise.all([
            axiosService.downloadAudio(url),
            axiosService.downloadVideo(url)
        ]);

        this.writeVideoAndAudio(audio, video, _id);

        return { audio, video, _id };

    }

    //TODO: Cambiar el estado en la bd a processed
    private mergeVideoAndAudio(id: string) {
        const command = `ffmpeg -i videos/video-${id}.mp4 -i videos/audio-${id}.mp4 -c:v copy -c:a aac processed/output-${id}.mp4`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
    }

    //TODO: Cambiar status en la bd de preferencia con un bulk
    async mergeAllvideos() {
        const videosToConcat = await VideoModel.find({}).select({ _id: 1 }).lean();

        videosToConcat.forEach(({ _id }) => {
            this.mergeVideoAndAudio(String(_id));
        });
    }

    async downLoadAllMedia() {
        const videos = await VideoModel
            .find({ isProcessed: false, status: VideoStatus.Pending })
            .lean();

        videos
            .map(({ _id, url }) => this.dowloadVideoAndAudio(url, String(_id)));
    }

    private cutVideo(_id: string) {
        const command = `ffmpeg -i processed/output-${_id}.mp4 -ss 00:00:00 -t 00:00:10 -async 1 processed/output2-${_id}.mp4 &&
    rm processed/output-${_id}.mp4 && mv processed/output2-${_id}.mp4 processed/output-${_id}.mp4`;
        console.log(command);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
    }

    async cutVideos() {
        const videosToProcess = await VideoModel
            .find({ duration: { $gt: 10 } })
            .lean();

        console.log(videosToProcess);

        videosToProcess.forEach(({ _id }) => {
            this.cutVideo(String(_id));
        });
    }

    async concatVideos() {
        const videosToConcat = await VideoModel.find({}).select({ _id: 1 }).lean();
        const data = videosToConcat.map(({ _id }) => `file 'output-${String(_id)}.mp4'`).join('\n');

        fs.writeFileSync('processed/mylist.txt', data);

        const command = 'ffmpeg -f concat -safe 0 -i processed/mylist.txt -c copy processed/output.mp4';
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
    }
}

export default new ProcessVideo
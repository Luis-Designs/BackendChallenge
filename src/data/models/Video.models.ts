import { Schema } from "mongoose";
import database from "../database";
// Schema

export enum VideoStatus {
    Pending = 'PENDING',
    Downloaded = 'DOWNLOADED',
    MediaMerged = 'MEDIA_MERGED',
}

const VideoStatusEnums = [
    VideoStatus.Downloaded,
    VideoStatus.MediaMerged,
    VideoStatus.Pending
];

export interface IVideo {
    url: string,
    duration: number,
    status?: VideoStatus;
    isAudioDownloaded?: boolean;
    isVideoDownloaded?: boolean;
    isProcessed?: boolean
}

export const VideoSchema = new Schema<IVideo>({
    url: { type: String },
    duration: { type: Number },
    status: { type: String, enum: VideoStatusEnums, default: VideoStatus.Pending },
    isProcessed: { type: Boolean, 'default': false },
    isAudioDownloaded: { type: Boolean, default: false },
    isVideoDownloaded: { type: Boolean, default: false }
}, { timestamps: true })

const VideoModel = database.model('Video', VideoSchema)
export default VideoModel
// database.m